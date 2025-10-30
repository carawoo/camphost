---
name: task-management
description: Manage Pioneer Tasks. Use when user wants to create Task, update Task status, reopen Task, complete Task, or list Tasks. Triggers include "create task", "update task", "task status", "show task", "list tasks", "reopen task", "complete task", "PR feedback". Wraps task-manager.sh CLI.
allowed-tools: Bash, Read, Edit, Glob
---

# Task 관리

task-manager.sh CLI를 사용하여 Pioneer Task를 관리합니다.

## 사용 시점

Claude가 다음과 같은 사용자 의도를 감지하면 자동으로 이 Skill을 호출합니다:
- "새 Task 만들어줘"
- "Task 상태 업데이트해줘"
- "Task 완료했어"
- "Task 재오픈해줘" (PR 피드백 반영)
- "Task 목록 보여줘"
- "Task 상세 정보 알려줘"

## 명령

- `create <제목> [우선순위] [epic] [타입]` - 새 Task 생성
  - 우선순위: low|medium|high (기본값: medium)
  - Epic: EPIC-xxx (선택)
  - 타입: feat|fix|test|refactor|docs|style|perf|chore (기본값: feat)

- `update <task_id> <상태> <담당자> [메모]` - Task 상태 및 담당자 업데이트
  - 상태: TODO|IN_PROGRESS|READY_FOR_TEST|TESTING|READY_FOR_COMMIT|BLOCKED|CANCELLED|DONE

- `complete <task_id>` - Task를 완료로 표시하고 completed/로 이동

- `reopen <task_id> [메모]` - 완료된 Task 재오픈 (PR 피드백용)
  - 상태를 DONE에서 IN_PROGRESS로 변경하고 Epic 상태 업데이트

- `list [필터] [epic_id]` - Task 나열
  - 필터: active|completed|blocked|cancelled|all (기본값: active)
  - Epic ID: 선택, 특정 Epic의 Task만 표시

- `show <task_id>` - Task 상세 정보 표시

- `help` - 도움말 메시지 표시

## 예시

```bash
# 새 Task 생성
task-manager.sh create "로그인 API 구현" high EPIC-e8a9c2d feat
task-manager.sh create "테스트 커버리지 개선" medium EPIC-e8a9c2d test

# Task 업데이트
task-manager.sh update TASK-a3f9c2d IN_PROGRESS developer "Started implementation"
task-manager.sh update TASK-a3f9c2d READY_FOR_TEST test-engineer "구현 완료, 테스트 대기"

# Task 완료
task-manager.sh complete TASK-a3f9c2d

# Task 재오픈 (PR 피드백)
task-manager.sh reopen TASK-a3f9c2d "PR 피드백 반영 필요"

# Task 나열
task-manager.sh list active                    # 모든 활성 Task
task-manager.sh list all EPIC-e8a9c2d          # 특정 Epic의 모든 Task
task-manager.sh list completed

# Task 상세 정보 표시
task-manager.sh show TASK-a3f9c2d
```

## Execute

!if [ -z "$ARGUMENTS" ]; then
!  /Users/jaehwankim/Workspace/api-monorepo-starter/.pioneer/scripts/task-manager.sh help
!else
!  /Users/jaehwankim/Workspace/api-monorepo-starter/.pioneer/scripts/task-manager.sh $ARGUMENTS
!fi
