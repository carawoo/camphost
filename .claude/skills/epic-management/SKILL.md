---
name: epic-management
description: Manage Pioneer Epics. Use when user wants to create Epic, update Epic status, set Epic branch/PR, list Epics, or check Epic details. Triggers include "create epic", "start epic", "epic status", "show epic", "list epics", "complete epic", "set PR", "block epic". Wraps epic-manager.sh CLI.
allowed-tools: Bash, Read, Edit, Glob
---

# Epic 관리

epic-manager.sh CLI를 사용하여 Pioneer Epic을 관리합니다.

## 사용 시점

Claude가 다음과 같은 사용자 의도를 감지하면 자동으로 이 Skill을 호출합니다:
- "새 Epic 만들어줘"
- "Epic 상태 업데이트해줘"
- "Epic 목록 보여줘"
- "Epic 완료했어"
- "Epic에 PR 연결해줘"
- "Epic 브랜치 설정해줘"

## 명령

- `create <제목> [우선순위]` - 새 Epic 생성 (우선순위: low|medium|high, 기본값: medium)
- `update <epic_id> <상태>` - Epic 상태 업데이트 (TODO|IN_PROGRESS|IN_REVIEW|BLOCKED|DONE)
- `complete <epic_id>` - Epic을 완료로 표시 (상태를 DONE으로 설정)
- `block <epic_id>` - Epic 차단 (상태를 BLOCKED로 설정)
- `set-branch <epic_id> <브랜치>` - Epic에 git 브랜치 설정
- `set-pr <epic_id> <pr_url>` - Epic에 PR URL 설정
- `list [필터]` - Epic 나열 (필터: active|completed|blocked, 기본값: active)
- `show <epic_id>` - Epic 상세 정보 표시
- `help` - 도움말 메시지 표시

## 예시

```bash
# 새 Epic 생성
epic-manager.sh create "가상 파일 시스템 API" high

# 브랜치 설정
epic-manager.sh set-branch EPIC-e8a9c2d feature/EPIC-e8a9c2d

# 상태 업데이트
epic-manager.sh update EPIC-e8a9c2d IN_PROGRESS
epic-manager.sh update EPIC-e8a9c2d IN_REVIEW  # PR 생성 후

# PR URL 설정
epic-manager.sh set-pr EPIC-e8a9c2d https://github.com/org/repo/pull/123

# Epic 완료
epic-manager.sh complete EPIC-e8a9c2d

# Epic 나열
epic-manager.sh list active
epic-manager.sh list completed

# Epic 상세 정보 표시
epic-manager.sh show EPIC-e8a9c2d
```

## Execute

!if [ -z "$ARGUMENTS" ]; then
!  /Users/jaehwankim/Workspace/api-monorepo-starter/.pioneer/scripts/epic-manager.sh help
!else
!  /Users/jaehwankim/Workspace/api-monorepo-starter/.pioneer/scripts/epic-manager.sh $ARGUMENTS
!fi
