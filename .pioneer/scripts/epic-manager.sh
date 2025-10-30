#!/bin/bash
# Epic Manager CLI - Pioneer Epic 관리 시스템

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
generate_epic_id() {
  if command -v uuidgen &> /dev/null; then
    # macOS/BSD
    local uuid=$(uuidgen | tr '[:upper:]' '[:lower:]' | tr -d '-')
    echo "EPIC-${uuid:0:7}"
  else
    # Linux (random 사용)
    local random_str=$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 7 | head -n 1)
    echo "EPIC-$random_str"
  fi
}

# Epic 생성
create_epic() {
  local title="$1"
  local priority="${2:-medium}"

  if [ -z "$title" ]; then
    log_error "Title is required"
    echo "Usage: epic-manager.sh create \"<title>\" [priority]"
    exit 1
  fi

  # UUID 기반 Epic ID 생성
  local epic_id=$(generate_epic_id)

  # 중복 체크
  while [ -d "$EPICS_DIR/$epic_id" ]; do
    epic_id=$(generate_epic_id)
  done

  local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local now_display=$(date -u +"%Y-%m-%d %H:%M")
  local creator="${PIONEER_AGENT:-scrum-master}"

  # Epic 폴더 및 tasks 폴더 생성
  local epic_dir="$EPICS_DIR/$epic_id"
  mkdir -p "$epic_dir/tasks"

  # Epic 파일 생성
  local epic_file="$epic_dir/epic.md"

  cat > "$epic_file" <<EOF
---
id: $epic_id
title: $title
type: epic
status: TODO
priority: $priority
created: $now
updated: $now
branch: ""
pr_url: ""
---

# Epic: $title

## Description

[Epic description here]

## Tasks

(Tasks will be added by Scrum Master)

**Total**: 0/0 Tasks (0%)

## Checklist

- [ ] All Tasks completed (CANCELLED excluded)
- [ ] Build succeeded
- [ ] All tests passed
- [ ] PR created
- [ ] Code reviewed and approved
- [ ] PR merged to main

EOF

  log_success "Created $epic_id: $title"
  log_info "File: $epic_file"
  echo "$epic_id"  # Return Epic ID for scripting
}

# Epic 상태 업데이트 (PR 피드백 처리 포함)
update_epic() {
  local epic_id="$1"
  local status="$2"

  if [ -z "$epic_id" ] || [ -z "$status" ]; then
    log_error "Usage: epic-manager.sh update <epic_id> <status>"
    echo "Status: TODO|IN_PROGRESS|IN_REVIEW|BLOCKED|DONE"
    exit 1
  fi

  # Epic 파일 찾기
  local epic_dir="$EPICS_DIR/$epic_id"
  local epic_file="$epic_dir/epic.md"

  if [ ! -f "$epic_file" ]; then
    log_error "Epic not found: $epic_id"
    exit 1
  fi

  local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local current_status=$(grep '^status:' "$epic_file" | awk '{print $2}')

  # Validate status
  case "$status" in
    TODO|IN_PROGRESS|IN_REVIEW|BLOCKED|DONE)
      ;;
    *)
      log_error "Invalid status: $status"
      exit 1
      ;;
  esac

  # YAML frontmatter 업데이트
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/^status:.*/status: $status/" "$epic_file"
    sed -i '' "s/^updated:.*/updated: $now/" "$epic_file"
  else
    sed -i "s/^status:.*/status: $status/" "$epic_file"
    sed -i "s/^updated:.*/updated: $now/" "$epic_file"
  fi

  log_success "Updated $epic_id: $current_status → $status"
}

# Epic 완료
complete_epic() {
  local epic_id="$1"

  if [ -z "$epic_id" ]; then
    log_error "Usage: epic-manager.sh complete <epic_id>"
    exit 1
  fi

  # Use update_epic to set status to DONE
  update_epic "$epic_id" "DONE"

  log_success "Completed $epic_id"
}

# Epic 블록
block_epic() {
  local epic_id="$1"

  if [ -z "$epic_id" ]; then
    log_error "Usage: epic-manager.sh block <epic_id>"
    exit 1
  fi

  # Use update_epic to set status to BLOCKED
  update_epic "$epic_id" "BLOCKED"

  log_warning "Blocked $epic_id"
}

# Epic에 브랜치 설정
set_branch() {
  local epic_id="$1"
  local branch="$2"

  if [ -z "$epic_id" ] || [ -z "$branch" ]; then
    log_error "Usage: epic-manager.sh set-branch <epic_id> <branch>"
    exit 1
  fi

  local epic_file="$EPICS_DIR/$epic_id/epic.md"

  if [ ! -f "$epic_file" ]; then
    log_error "Epic not found: $epic_id"
    exit 1
  fi

  # YAML frontmatter 업데이트
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^branch:.*|branch: \"$branch\"|" "$epic_file"
  else
    sed -i "s|^branch:.*|branch: \"$branch\"|" "$epic_file"
  fi

  log_success "Set branch for $epic_id: $branch"
}

# Epic에 PR URL 설정
set_pr() {
  local epic_id="$1"
  local pr_url="$2"

  if [ -z "$epic_id" ] || [ -z "$pr_url" ]; then
    log_error "Usage: epic-manager.sh set-pr <epic_id> <pr_url>"
    exit 1
  fi

  local epic_file="$EPICS_DIR/$epic_id/epic.md"

  if [ ! -f "$epic_file" ]; then
    log_error "Epic not found: $epic_id"
    exit 1
  fi

  # YAML frontmatter 업데이트
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^pr_url:.*|pr_url: \"$pr_url\"|" "$epic_file"
  else
    sed -i "s|^pr_url:.*|pr_url: \"$pr_url\"|" "$epic_file"
  fi

  log_success "Set PR URL for $epic_id: $pr_url"
}

# Epic 목록 조회
list_epics() {
  local filter="$1"

  log_info "Epics (filter: ${filter:-all}):"

  for epic_dir in "$EPICS_DIR"/EPIC-*/; do
    if [ -d "$epic_dir" ]; then
      local epic_file="$epic_dir/epic.md"
      if [ -f "$epic_file" ]; then
        local id=$(grep '^id:' "$epic_file" | awk '{print $2}')
        local title=$(grep '^title:' "$epic_file" | sed 's/^title: //')
        local status=$(grep '^status:' "$epic_file" | awk '{print $2}')
        local branch=$(grep '^branch:' "$epic_file" | sed 's/^branch: //; s/"//g')

        # Filter by status if specified
        if [ -z "$filter" ] || [ "$filter" = "all" ]; then
          # Show all
          echo "  - $id: $title [$status]"
          if [ -n "$branch" ]; then
            echo "    Branch: $branch"
          fi
        else
          # Match filter (active shows TODO/IN_PROGRESS/IN_REVIEW)
          case "$filter" in
            active)
              if [[ "$status" == "TODO" || "$status" == "IN_PROGRESS" || "$status" == "IN_REVIEW" ]]; then
                echo "  - $id: $title [$status]"
                if [ -n "$branch" ]; then
                  echo "    Branch: $branch"
                fi
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
          esac
        fi
      fi
    fi
  done
}

# Epic 상세 조회
show_epic() {
  local epic_id="$1"

  if [ -z "$epic_id" ]; then
    log_error "Usage: epic-manager.sh show <epic_id>"
    exit 1
  fi

  local epic_file="$EPICS_DIR/$epic_id/epic.md"

  if [ ! -f "$epic_file" ]; then
    log_error "Epic not found: $epic_id"
    exit 1
  fi

  cat "$epic_file"
}

# 도움말
show_help() {
  cat <<EOF
Epic Manager CLI - Pioneer Epic 관리 시스템

Usage:
  epic-manager.sh <command> [arguments]

Commands:
  create <title> [priority]
      Create a new epic
      Priority: low|medium|high (default: medium)

  update <epic_id> <status>
      Update epic status
      Status: TODO|IN_PROGRESS|IN_REVIEW|BLOCKED|DONE

  complete <epic_id>
      Mark epic as complete (sets status to DONE)

  block <epic_id>
      Block epic (sets status to BLOCKED)

  set-branch <epic_id> <branch>
      Set git branch for epic

  set-pr <epic_id> <pr_url>
      Set PR URL for epic

  list [filter]
      List epics (filter: active|completed|blocked, default: active)

  show <epic_id>
      Show epic details

  help
      Show this help message

Examples:
  epic-manager.sh create "가상 파일 시스템 API" high
  epic-manager.sh set-branch EPIC-e8a9c2d feature/EPIC-e8a9c2d
  epic-manager.sh update EPIC-e8a9c2d IN_PROGRESS
  epic-manager.sh update EPIC-e8a9c2d IN_REVIEW  # PR 생성 후
  epic-manager.sh set-pr EPIC-e8a9c2d https://github.com/org/repo/pull/123
  epic-manager.sh complete EPIC-e8a9c2d
  epic-manager.sh list active

Note:
  PR body is automatically synced when tasks are completed via task-manager.sh
EOF
}

# 메인 로직
case "$1" in
  create)
    create_epic "$2" "$3"
    ;;
  update)
    update_epic "$2" "$3"
    ;;
  complete)
    complete_epic "$2"
    ;;
  block)
    block_epic "$2"
    ;;
  set-branch)
    set_branch "$2" "$3"
    ;;
  set-pr)
    set_pr "$2" "$3"
    ;;
  list)
    list_epics "$2"
    ;;
  show)
    show_epic "$2"
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
