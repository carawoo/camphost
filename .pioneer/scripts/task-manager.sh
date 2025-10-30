#!/bin/bash
# Task Manager CLI - Pioneer 로컬 티켓 관리 시스템

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIONEER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EPICS_DIR="$PIONEER_ROOT/epics"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✅${NC} $1"
}

log_error() {
  echo -e "${RED}❌${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Epic 디렉토리 확인
if [ ! -d "$EPICS_DIR" ]; then
  log_error "Epics directory not found at $EPICS_DIR"
  exit 1
fi

# UUID 생성 함수 (7자리)
generate_task_id() {
  # 랜덤 UUID 생성 후 7자리만 추출
  if command -v uuidgen &> /dev/null; then
    # macOS/BSD
    local uuid=$(uuidgen | tr '[:upper:]' '[:lower:]' | tr -d '-')
    echo "TASK-${uuid:0:7}"
  else
    # Linux (random 사용)
    local random_str=$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 7 | head -n 1)
    echo "TASK-$random_str"
  fi
}

# Task 생성
create_task() {
  local title="$1"
  local priority="${2:-medium}"
  local epic="${3:-}"
  local task_type="${4:-feat}"

  if [ -z "$title" ] || [ -z "$epic" ]; then
    log_error "Title and Epic ID are required"
    echo "Usage: task-manager.sh create \"<title>\" [priority] <epic_id> [type]"
    echo "Type: feat|fix|test|refactor|docs|style|perf|chore (default: feat)"
    exit 1
  fi

  # Epic 폴더 확인
  local epic_dir="$EPICS_DIR/$epic"
  local tasks_dir="$epic_dir/tasks"

  if [ ! -d "$epic_dir" ]; then
    log_error "Epic not found: $epic"
    exit 1
  fi

  # tasks 폴더가 없으면 생성
  mkdir -p "$tasks_dir"

  # UUID 기반 Task ID 생성
  local task_id=$(generate_task_id)

  # 중복 체크 (만약의 경우)
  while [ -f "$tasks_dir/$task_id.md" ]; do
    task_id=$(generate_task_id)
  done

  local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local now_display=$(date -u +"%Y-%m-%d %H:%M")
  local creator="${PIONEER_AGENT:-scrum-master}"

  # Task 파일 생성
  local task_file="$tasks_dir/$task_id.md"

  cat > "$task_file" <<EOF
---
id: $task_id
title: $title
type: task
task_type: $task_type
status: TODO
priority: $priority
created: $now
updated: $now
assignee: scrum-master
epic: $epic
dependencies: []
---

# $task_id: $title

## Description

[Description here]

## Requirements

- [ ] Requirement 1
- [ ] Requirement 2

## Tech Spec

[Tech spec will be added by Developer]

## Work Log

### $now_display - scrum-master
- Task created

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| $now_display | TODO | scrum-master | Task created |

## Artifacts

- Branch:
- Commit:
- Files Modified:

## Checklist

EOF

  # task_type에 따라 다른 체크리스트 추가
  case "$task_type" in
    feat|fix|refactor|perf)
      cat >> "$task_file" <<'EOF'
- [ ] Tech spec written (Developer)
- [ ] Code implemented (Developer)
- [ ] Type check passed
- [ ] Lint passed
- [ ] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed
EOF
      ;;
    chore)
      cat >> "$task_file" <<'EOF'
- [ ] Tech spec written (Developer)
- [ ] Code implemented (Developer)
- [ ] Type check passed
- [ ] Lint passed
- [ ] Build succeeded
- [ ] Tests written (Test Engineer) - if applicable
- [ ] Tests passed - if applicable
EOF
      ;;
    test)
      cat >> "$task_file" <<'EOF'
- [ ] Tests written (Test Engineer)
- [ ] Tests passed
EOF
      ;;
    docs|style)
      cat >> "$task_file" <<'EOF'
- [ ] Work completed (Developer)
- [ ] Build succeeded
EOF
      ;;
    *)
      cat >> "$task_file" <<'EOF'
- [ ] Task completed
EOF
      ;;
  esac

  cat >> "$task_file" <<EOF

EOF

  log_success "Created $task_id: $title"
  log_info "File: $task_file"
  echo "$task_id"  # Return Task ID for scripting
}

# Task 파일 찾기 헬퍼 함수
find_task_file() {
  local task_id="$1"

  # 모든 Epic 폴더에서 Task 파일 찾기
  find "$EPICS_DIR" -path "*/tasks/$task_id.md" 2>/dev/null | head -1
}

# Task 상태 업데이트 (충돌 방지)
update_task() {
  local task_id="$1"
  local status="$2"
  local assignee="$3"
  local note="${4:-Status changed}"

  if [ -z "$task_id" ] || [ -z "$status" ] || [ -z "$assignee" ]; then
    log_error "Usage: task-manager.sh update <task_id> <status> <assignee> [note]"
    exit 1
  fi

  # Task 파일 찾기
  local task_file=$(find_task_file "$task_id")

  if [ -z "$task_file" ]; then
    log_error "Task not found: $task_id"
    exit 1
  fi

  # 충돌 방지: assignee 검증 (정보성 로그만 출력)
  local current_assignee=$(grep '^assignee:' "$task_file" | awk '{print $2}')
  local current_user="${PIONEER_AGENT:-${USER}}"

  # assignee가 다르면 정보성 로그만 출력 (워크플로우 전환은 허용)
  if [ "$current_assignee" != "$assignee" ] && [ "$current_assignee" != "scrum-master" ]; then
    log_info "Task handoff: $current_assignee → $assignee"
  fi

  local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local now_display=$(date -u +"%Y-%m-%d %H:%M")

  # YAML frontmatter 업데이트 (macOS/Linux 호환)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^status:.*/status: $status/" "$task_file"
    sed -i '' "s/^assignee:.*/assignee: $assignee/" "$task_file"
    sed -i '' "s/^updated:.*/updated: $now/" "$task_file"
  else
    # Linux
    sed -i "s/^status:.*/status: $status/" "$task_file"
    sed -i "s/^assignee:.*/assignee: $assignee/" "$task_file"
    sed -i "s/^updated:.*/updated: $now/" "$task_file"
  fi

  # Status History에 새 줄 추가 (테이블 내부에 삽입)
  # awk를 사용하여 마지막 테이블 행 다음에 삽입
  local temp_file=$(mktemp)
  local new_row="| $now_display | $status | $assignee | $note |"

  awk -v new_row="$new_row" '
    /^## Status History$/ {
      in_status_history = 1
      print
      next
    }
    /^## / && in_status_history {
      # 새 섹션 시작 - 테이블 끝
      print new_row
      in_status_history = 0
      print
      next
    }
    /^\|.*\|$/ && in_status_history {
      # 테이블 행
      print
      last_was_table = 1
      next
    }
    {
      if (last_was_table && in_status_history && !/^\|/) {
        # 테이블이 끝남
        print new_row
        in_status_history = 0
        last_was_table = 0
      }
      print
    }
    END {
      if (in_status_history) {
        # 파일 끝까지 Status History만 있었음
        print new_row
      }
    }
  ' "$task_file" > "$temp_file"

  mv "$temp_file" "$task_file"

  log_success "Updated $task_id"
  log_info "Status: $status"
  log_info "Assignee: $assignee"
}

# Task 완료
complete_task() {
  local task_id="$1"

  if [ -z "$task_id" ]; then
    log_error "Usage: task-manager.sh complete <task_id>"
    exit 1
  fi

  # Use update_task to set status to DONE
  update_task "$task_id" "DONE" "system" "Task completed"

  # Epic 동기화 (내용 + 상태)
  local task_file=$(find_task_file "$task_id")
  local epic_id=$(grep '^epic:' "$task_file" | awk '{print $2}')
  if [ -n "$epic_id" ]; then
    sync_epic_content "$task_id" "$epic_id"
    check_and_update_epic_status "$epic_id"
  fi

  log_success "Completed $task_id"
}

# Task 재개 (PR 피드백 처리)
reopen_task() {
  local task_id="$1"
  local note="${2:-PR feedback - reopening task}"

  if [ -z "$task_id" ]; then
    log_error "Usage: task-manager.sh reopen <task_id> [note]"
    exit 1
  fi

  # Task 파일 찾기
  local task_file=$(find_task_file "$task_id")

  if [ -z "$task_file" ]; then
    log_error "Task not found: $task_id"
    exit 1
  fi

  # Use update_task to set status to IN_PROGRESS
  update_task "$task_id" "IN_PROGRESS" "${PIONEER_AGENT:-${USER}}" "$note"

  # Epic 동기화 (내용 + 상태)
  local epic_id=$(grep '^epic:' "$task_file" | awk '{print $2}')
  if [ -n "$epic_id" ]; then
    sync_epic_content "$task_id" "$epic_id"
    check_and_update_epic_status "$epic_id"
  fi

  log_success "Reopened $task_id"
}

# PR 본문 동기화 (Epic Tasks 섹션 반영)
sync_pr_body() {
  local epic_id="$1"

  if [ -z "$epic_id" ]; then
    return
  fi

  # Epic 파일 찾기
  local epic_file="$EPICS_DIR/$epic_id/epic.md"

  if [ ! -f "$epic_file" ]; then
    return
  fi

  # PR URL 확인
  local pr_url=$(grep '^pr_url:' "$epic_file" | sed 's/^pr_url: //; s/"//g')

  if [ -z "$pr_url" ]; then
    # PR이 없으면 동기화 불필요
    return
  fi

  # GitHub CLI 확인
  if ! command -v gh &> /dev/null; then
    log_warning "gh CLI not found, skipping PR body sync"
    return
  fi

  # Epic 파일 내용 추출 (YAML frontmatter 제외)
  local epic_content=$(sed -n '/^---$/,/^---$/d; p' "$epic_file")

  # PR 본문 생성 (Epic 내용 그대로 사용)
  local pr_body_file=$(mktemp)

  cat > "$pr_body_file" <<EOF
$epic_content

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF

  # gh pr edit로 PR 본문 업데이트
  if gh pr edit "$pr_url" --body-file "$pr_body_file" > /dev/null 2>&1; then
    log_info "PR 본문 업데이트: $pr_url"
  fi

  rm -f "$pr_body_file"
}

# Epic 내용 동기화 (Tasks 섹션, 진행률)
sync_epic_content() {
  local task_id="$1"
  local epic_id="$2"

  if [ -z "$epic_id" ] || [ -z "$task_id" ]; then
    return
  fi

  # Epic 파일 찾기
  local epic_file="$EPICS_DIR/$epic_id/epic.md"

  if [ ! -f "$epic_file" ]; then
    log_warning "Epic not found: $epic_id"
    return
  fi

  # Task의 현재 상태 확인
  local task_file=$(find_task_file "$task_id")

  if [ -z "$task_file" ]; then
    log_warning "Task not found: $task_id"
    return
  fi

  local task_status=$(grep '^status:' "$task_file" | awk '{print $2}')

  # Task 체크박스 상태 결정
  local checkbox="[ ]"
  if [ "$task_status" == "DONE" ]; then
    checkbox="[x]"
  fi

  # Epic 파일에서 해당 Task 라인 업데이트 (체크박스 + 상태)
  # 예: - [ ] TASK-abc1234: ... [high] - TODO  →  - [x] TASK-abc1234: ... [high] - DONE
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' -E "s/^- \[[ x]\] ($task_id:.*) - [A-Z_]+$/- $checkbox \1 - $task_status/" "$epic_file"
  else
    sed -i -E "s/^- \[[ x]\] ($task_id:.*) - [A-Z_]+$/- $checkbox \1 - $task_status/" "$epic_file"
  fi

  # Epic의 모든 Task 진행률 계산
  local epic_tasks_dir="$EPICS_DIR/$epic_id/tasks"
  local total_tasks=$(find "$epic_tasks_dir" -name "TASK-*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
  local completed_tasks=$(find "$epic_tasks_dir" -name "TASK-*.md" -type f -exec grep -l "^status: DONE$" {} \; 2>/dev/null | wc -l | tr -d ' ')

  local percentage=0
  if [ "$total_tasks" -gt 0 ]; then
    percentage=$((completed_tasks * 100 / total_tasks))
  fi

  # **Total**: 2/3 Tasks (67%) 형식 업데이트
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' -E "s/^\*\*Total\*\*: [0-9]+\/[0-9]+ Tasks \([0-9]+%\)$/\*\*Total\*\*: $completed_tasks\/$total_tasks Tasks (${percentage}%)/" "$epic_file"
  else
    sed -i -E "s/^\*\*Total\*\*: [0-9]+\/[0-9]+ Tasks \([0-9]+%\)$/\*\*Total\*\*: $completed_tasks\/$total_tasks Tasks (${percentage}%)/" "$epic_file"
  fi

  log_info "Epic $epic_id 내용 동기화: $task_id ($task_status)"

  # PR 본문도 동기화
  sync_pr_body "$epic_id"
}

# Epic 상태 자동 업데이트
check_and_update_epic_status() {
  local epic_id="$1"

  # Epic 파일 찾기
  local epic_file="$EPICS_DIR/$epic_id/epic.md"

  if [ ! -f "$epic_file" ]; then
    log_warning "Epic not found: $epic_id"
    return
  fi

  local current_epic_status=$(grep '^status:' "$epic_file" | awk '{print $2}')

  # Epic의 모든 Task 파일 찾기
  local epic_tasks_dir="$EPICS_DIR/$epic_id/tasks"
  local total_tasks=$(find "$epic_tasks_dir" -name "TASK-*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
  local cancelled_tasks=$(find "$epic_tasks_dir" -name "TASK-*.md" -type f -exec grep -l "^status: CANCELLED$" {} \; 2>/dev/null | wc -l | tr -d ' ')
  local active_tasks=$(find "$epic_tasks_dir" -name "TASK-*.md" -type f -exec grep -l "^status: \(TODO\|IN_PROGRESS\|READY_FOR_TEST\|TESTING\|READY_FOR_COMMIT\|BLOCKED\)$" {} \; 2>/dev/null | wc -l | tr -d ' ')
  local completed_tasks=$(find "$epic_tasks_dir" -name "TASK-*.md" -type f -exec grep -l "^status: DONE$" {} \; 2>/dev/null | wc -l | tr -d ' ')

  # CANCELLED 제외한 실제 Task 수
  local effective_total=$((total_tasks - cancelled_tasks))

  local new_status=""

  # 상태 결정 로직
  if [ "$active_tasks" -gt 0 ]; then
    # Active Task가 있으면 IN_PROGRESS
    new_status="IN_PROGRESS"
  elif [ "$completed_tasks" -eq "$effective_total" ] && [ "$effective_total" -gt 0 ]; then
    # 모든 유효 Task가 완료되면 IN_REVIEW (PR 대기)
    if [ "$current_epic_status" != "DONE" ]; then
      new_status="IN_REVIEW"
    fi
  fi

  # Epic 상태 업데이트 (변경이 필요한 경우만)
  if [ -n "$new_status" ] && [ "$new_status" != "$current_epic_status" ]; then
    log_info "Epic $epic_id 상태 자동 업데이트: $current_epic_status → $new_status"
    "$SCRIPT_DIR/epic-manager.sh" update "$epic_id" "$new_status" > /dev/null 2>&1
  fi
}

# Task 목록 조회
list_tasks() {
  local filter="$1"
  local epic_id="$2"

  if [ -n "$epic_id" ]; then
    log_info "Tasks for Epic $epic_id (filter: ${filter:-all}):"
    local epic_tasks_dir="$EPICS_DIR/$epic_id/tasks"

    if [ ! -d "$epic_tasks_dir" ]; then
      log_warning "No tasks found for Epic $epic_id"
      return
    fi

    for file in "$epic_tasks_dir"/TASK-*.md; do
      if [ -f "$file" ]; then
        local id=$(grep '^id:' "$file" | awk '{print $2}')
        local title=$(grep '^title:' "$file" | sed 's/^title: //')
        local status=$(grep '^status:' "$file" | awk '{print $2}')
        local assignee=$(grep '^assignee:' "$file" | awk '{print $2}')

        # Apply filter
        case "$filter" in
          active|"")
            if [[ "$status" != "DONE" ]]; then
              echo "  - $id: $title [$status] (@$assignee)"
            fi
            ;;
          completed)
            if [ "$status" = "DONE" ]; then
              echo "  - $id: $title"
            fi
            ;;
          blocked)
            if [ "$status" = "BLOCKED" ]; then
              echo "  - $id: $title"
            fi
            ;;
          all)
            echo "  - $id: $title [$status] (@$assignee)"
            ;;
        esac
      fi
    done
  else
    log_info "All Tasks (filter: ${filter:-all}):"

    for epic_dir in "$EPICS_DIR"/EPIC-*/; do
      if [ -d "$epic_dir/tasks" ]; then
        for file in "$epic_dir/tasks"/TASK-*.md; do
          if [ -f "$file" ]; then
            local id=$(grep '^id:' "$file" | awk '{print $2}')
            local title=$(grep '^title:' "$file" | sed 's/^title: //')
            local status=$(grep '^status:' "$file" | awk '{print $2}')
            local assignee=$(grep '^assignee:' "$file" | awk '{print $2}')
            local epic=$(grep '^epic:' "$file" | awk '{print $2}')

            # Apply filter
            case "$filter" in
              active|"")
                if [[ "$status" != "DONE" ]]; then
                  echo "  - $id: $title [$status] (@$assignee) (Epic: $epic)"
                fi
                ;;
              completed)
                if [ "$status" = "DONE" ]; then
                  echo "  - $id: $title (Epic: $epic)"
                fi
                ;;
              blocked)
                if [ "$status" = "BLOCKED" ]; then
                  echo "  - $id: $title (Epic: $epic)"
                fi
                ;;
              cancelled)
                if [ "$status" = "CANCELLED" ]; then
                  echo "  - $id: $title (Epic: $epic)"
                fi
                ;;
              all)
                echo "  - $id: $title [$status] (@$assignee) (Epic: $epic)"
                ;;
            esac
          fi
        done
      fi
    done
  fi
}

# Task 상세 조회
show_task() {
  local task_id="$1"

  if [ -z "$task_id" ]; then
    log_error "Usage: task-manager.sh show <task_id>"
    exit 1
  fi

  # Task 파일 찾기
  local task_file=$(find_task_file "$task_id")

  if [ -z "$task_file" ]; then
    log_error "Task not found: $task_id"
    exit 1
  fi

  cat "$task_file"
}


# 도움말
show_help() {
  cat <<EOF
Task Manager CLI - Pioneer Task 관리 시스템

Usage:
  task-manager.sh <command> [arguments]

Commands:
  create <title> [priority] [epic] [type]
      Create a new task
      Priority: low|medium|high (default: medium)
      Epic: EPIC-xxx (optional)
      Type: feat|fix|test|refactor|docs|style|perf|chore (default: feat)

  update <task_id> <status> <assignee> [note]
      Update task status and assignee
      Status: TODO|IN_PROGRESS|READY_FOR_TEST|TESTING|READY_FOR_COMMIT|BLOCKED|CANCELLED|DONE

  complete <task_id>
      Mark task as complete and move to completed/

  reopen <task_id> [note]
      Reopen a completed task (for PR feedback)
      Changes status from DONE to IN_PROGRESS and updates Epic status

  list [filter] [epic_id]
      List tasks (filter: active|completed|blocked|cancelled|all, default: active)
      Epic ID: Optional, show tasks for specific epic only

  show <task_id>
      Show task details

  help
      Show this help message

Examples:
  task-manager.sh create "로그인 API 구현" high EPIC-e8a9c2d feat
  task-manager.sh create "테스트 커버리지 개선" medium EPIC-e8a9c2d test
  task-manager.sh update TASK-a3f9c2d IN_PROGRESS developer "Started implementation"
  task-manager.sh complete TASK-a3f9c2d
  task-manager.sh reopen TASK-a3f9c2d "PR 피드백 반영 필요"
  task-manager.sh list active                    # All active tasks
  task-manager.sh list all EPIC-e8a9c2d          # All tasks for specific epic
  task-manager.sh show TASK-a3f9c2d
EOF
}

# 메인 로직
case "$1" in
  create)
    create_task "$2" "$3" "$4" "$5"
    ;;
  update)
    update_task "$2" "$3" "$4" "$5"
    ;;
  complete)
    complete_task "$2"
    ;;
  reopen)
    reopen_task "$2" "$3"
    ;;
  list)
    list_tasks "$2" "$3"
    ;;
  show)
    show_task "$2"
    ;;
  help|"")
    show_help
    ;;
  *)
    log_error "Unknown command: $1"
    show_help
    exit 1
    ;;
esac
