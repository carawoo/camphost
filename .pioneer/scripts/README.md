# Pioneer CLI Scripts - 기술 참조

> epic-manager.sh 및 task-manager.sh를 위한 완전한 명령 문서

워크플로우 중심 문서는 다음을 참조하세요: [.pioneer/workflow/cli-reference.md](../workflow/cli-reference.md)

---

## 개요

Pioneer는 Epic과 Task를 관리하기 위한 두 가지 bash 스크립트를 제공합니다:

- **epic-manager.sh**: Epic 생성 및 관리 (고수준 기능)
- **task-manager.sh**: Task 생성 및 관리 (개별 작업 항목)

**요구사항**:
- Bash 4.0+
- macOS 또는 Linux (Windows: WSL 또는 Git Bash 사용)
- 선택사항: PR body 자동 동기화를 위한 `gh` CLI

---

## epic-manager.sh

Epic 라이프사이클 관리: 생성, 상태 업데이트, Git 브랜치 및 PR 연결.

### 명령

#### create

자동 생성된 UUID로 새 Epic을 생성합니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh create "<제목>" [우선순위]
```

**파라미터**:
- `title` (필수): Epic 제목 (공백 포함 시 따옴표로 묶음)
- `priority` (선택): `low`, `medium` (기본값), 또는 `high`

**반환값**: Epic ID (EPIC-xxxxxxx)

**예시**:
```bash
# 높은 우선순위 Epic 생성
.pioneer/scripts/epic-manager.sh create "User Authentication" high

# 중간 우선순위 Epic 생성 (기본값)
.pioneer/scripts/epic-manager.sh create "Add Slack notifications"

# 스크립팅을 위한 Epic ID 캡처
EPIC_ID=$(.pioneer/scripts/epic-manager.sh create "File Upload API" high)
echo "Created $EPIC_ID"
```

**출력**:
```
✅ Created EPIC-e8a9c2d: User Authentication
ℹ File: /path/to/.pioneer/epics/EPIC-e8a9c2d/epic.md
EPIC-e8a9c2d
```

**생성된 파일**:
- `.pioneer/epics/EPIC-{id}/epic.md` - Epic 메타데이터
- `.pioneer/epics/EPIC-{id}/tasks/` - 빈 task 디렉토리

---

#### update

Epic 상태를 업데이트합니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh update <epic_id> <status>
```

**파라미터**:
- `epic_id` (필수): Epic ID (예: EPIC-abc1234)
- `status` (필수): `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE` 중 하나

**예시**:
```bash
# Epic 시작
.pioneer/scripts/epic-manager.sh update EPIC-e8a9c2d IN_PROGRESS

# 리뷰 준비 표시 (모든 task 완료 후)
.pioneer/scripts/epic-manager.sh update EPIC-e8a9c2d IN_REVIEW

# 완료 표시 (PR 병합 후)
.pioneer/scripts/epic-manager.sh update EPIC-e8a9c2d DONE

# Epic 차단
.pioneer/scripts/epic-manager.sh update EPIC-e8a9c2d BLOCKED
```

**Epic 상태 흐름**:
```
TODO → IN_PROGRESS → IN_REVIEW → DONE
                ↓         ↑
             BLOCKED ─────┘
```

**자동 전환**:
- `TODO` → `IN_PROGRESS`: 첫 번째 task 시작 시
- `IN_PROGRESS` → `IN_REVIEW`: 모든 task가 DONE일 때
- `IN_REVIEW` → `IN_PROGRESS`: 어떤 task든 재오픈되면

---

#### complete

Epic을 DONE으로 표시하는 단축 명령입니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh complete <epic_id>
```

**동등한 명령**: `epic-manager.sh update <epic_id> DONE`

**예시**:
```bash
.pioneer/scripts/epic-manager.sh complete EPIC-e8a9c2d
```

**사용 시점**: PR이 main 브랜치로 병합된 후

---

#### block

Epic을 BLOCKED로 표시하는 단축 명령입니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh block <epic_id>
```

**동등한 명령**: `epic-manager.sh update <epic_id> BLOCKED`

**예시**:
```bash
.pioneer/scripts/epic-manager.sh block EPIC-e8a9c2d
```

**사용 시점**: 외부 의존성으로 진행이 차단된 경우 (예: API 접근 대기, 디자인 승인 대기)

---

#### set-branch

Epic을 Git 브랜치에 연결합니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh set-branch <epic_id> <branch>
```

**파라미터**:
- `epic_id` (필수): Epic ID
- `branch` (필수): Git 브랜치 이름

**예시**:
```bash
.pioneer/scripts/epic-manager.sh set-branch EPIC-e8a9c2d feature/EPIC-e8a9c2d

# 권장 워크플로우:
EPIC_ID=$(.pioneer/scripts/epic-manager.sh create "New Feature" high)
BRANCH="feature/$EPIC_ID"
git checkout -b "$BRANCH"
.pioneer/scripts/epic-manager.sh set-branch "$EPIC_ID" "$BRANCH"
```

**목적**: Epic 메타데이터를 Git 브랜치에 연결하여 추적성 확보

---

#### set-pr

Epic을 Pull Request에 연결합니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh set-pr <epic_id> <pr_url>
```

**파라미터**:
- `epic_id` (필수): Epic ID
- `pr_url` (필수): 전체 GitHub PR URL

**예시**:
```bash
.pioneer/scripts/epic-manager.sh set-pr EPIC-e8a9c2d "https://github.com/org/repo/pull/123"

# 자동화된 워크플로우:
gh pr create --title "feat: User Auth" --body-file .pioneer/epics/EPIC-e8a9c2d/epic.md
PR_URL=$(gh pr view --json url -q .url)
.pioneer/scripts/epic-manager.sh set-pr EPIC-e8a9c2d "$PR_URL"
```

**목적**: Task 완료 시 PR body 자동 동기화 활성화

**PR Body 동기화**: `gh` CLI가 설치되어 있으면, Task 완료 시 PR 설명이 자동으로 업데이트됩니다.

---

#### list

Epic 목록을 필터링하여 조회합니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh list [filter]
```

**파라미터**:
- `filter` (선택): `all`, `active` (기본값), `completed`, `blocked`

**필터 정의**:
- `active`: TODO, IN_PROGRESS, IN_REVIEW
- `completed`: DONE
- `blocked`: BLOCKED
- `all`: 필터링 없음

**예시**:
```bash
# 활성 Epic (기본값)
.pioneer/scripts/epic-manager.sh list
.pioneer/scripts/epic-manager.sh list active

# 모든 Epic
.pioneer/scripts/epic-manager.sh list all

# 완료된 Epic
.pioneer/scripts/epic-manager.sh list completed

# 차단된 Epic
.pioneer/scripts/epic-manager.sh list blocked
```

**출력**:
```
ℹ Epics (filter: active):
  - EPIC-e8a9c2d: User Authentication [IN_PROGRESS]
    Branch: feature/EPIC-e8a9c2d
  - EPIC-f3b8a1c: Slack Integration [TODO]
```

---

#### show

Epic의 전체 세부 정보를 표시합니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh show <epic_id>
```

**예시**:
```bash
.pioneer/scripts/epic-manager.sh show EPIC-e8a9c2d
```

**출력**: epic.md 파일의 전체 내용 (YAML frontmatter + markdown body)

**사용 사례**: Epic 설명, Task 목록, 체크리스트 검토

---

#### help

사용법 정보를 표시합니다.

**문법**:
```bash
.pioneer/scripts/epic-manager.sh help
.pioneer/scripts/epic-manager.sh  # (명령 없음)
```

---

## task-manager.sh

Task 라이프사이클 관리: 생성, 상태 업데이트, 진행 상황 추적.

### 명령

#### create

Epic 하위에 새 Task를 생성합니다.

**문법**:
```bash
.pioneer/scripts/task-manager.sh create "<제목>" [우선순위] <epic_id> [타입]
```

**파라미터**:
- `title` (필수): Task 제목 (공백 포함 시 따옴표로 묶음)
- `priority` (선택): `low`, `medium` (기본값), 또는 `high`
- `epic_id` (필수): 상위 Epic ID (예: EPIC-abc1234)
- `type` (선택): Task 타입 (기본값: `feat`)

**Task 타입**:
- `feat`: 새로운 기능 (구현 + 테스트)
- `fix`: 버그 수정 (구현 + 테스트)
- `test`: 테스트 커버리지 개선 (테스트만)
- `refactor`: 코드 리팩토링 (구현 + 테스트)
- `docs`: 문서화 (테스트 없음)
- `style`: 코드 포매팅 (테스트 없음)
- `perf`: 성능 개선 (구현 + 테스트)
- `chore`: 빌드/설정 변경 (상황에 따라)

**반환값**: Task ID (TASK-xxxxxxx)

**예시**:
```bash
# Feature task (기본 타입)
.pioneer/scripts/task-manager.sh create "Login API" high EPIC-e8a9c2d feat

# 버그 수정 task
.pioneer/scripts/task-manager.sh create "Fix token expiry" high EPIC-e8a9c2d fix

# 테스트 전용 task (기존 코드용)
.pioneer/scripts/task-manager.sh create "UserService coverage" medium EPIC-e8a9c2d test

# 문서화 task
.pioneer/scripts/task-manager.sh create "API docs" medium EPIC-e8a9c2d docs

# Task ID 캡처
TASK_ID=$(.pioneer/scripts/task-manager.sh create "Logout API" high EPIC-e8a9c2d feat)
```

**출력**:
```
✅ Created TASK-a3f9c2d: Login API
ℹ File: /path/to/.pioneer/epics/EPIC-e8a9c2d/tasks/TASK-a3f9c2d.md
TASK-a3f9c2d
```

**중요**:
- feat/fix/refactor task는 **테스트가 자동으로 포함됩니다**
- 새 기능에 대해 별도의 테스트 task를 생성하지 마세요
- test 타입은 **기존 코드의 커버리지 개선에만** 사용

---

#### update

Task 상태와 담당자를 업데이트합니다.

**문법**:
```bash
.pioneer/scripts/task-manager.sh update <task_id> <상태> <담당자> [메모]
```

**파라미터**:
- `task_id` (필수): Task ID (예: TASK-abc1234)
- `status` (필수): 새 상태 (아래 상태 값 참조)
- `assignee` (필수): Agent 이름 (예: `developer`, `test-engineer`, `scrum-master`)
- `note` (선택): 상태 변경 메모 (기본값: "Status changed")

**상태 값**:
- `TODO`: 시작 전
- `IN_PROGRESS`: 작업 중
- `READY_FOR_TEST`: 구현 완료, 테스트 필요
- `TESTING`: 테스트 작성 중
- `READY_FOR_COMMIT`: 완료, 커밋 대기
- `BLOCKED`: 진행 불가
- `CANCELLED`: 더 이상 필요 없음
- `DONE`: 커밋 완료

**예시**:
```bash
# Developer가 작업 시작
.pioneer/scripts/task-manager.sh update TASK-a3f9c2d IN_PROGRESS developer "Starting implementation"

# Developer가 구현 완료
.pioneer/scripts/task-manager.sh update TASK-a3f9c2d READY_FOR_TEST test-engineer "Implementation complete, ready for tests"

# Test Engineer가 테스트 시작
.pioneer/scripts/task-manager.sh update TASK-a3f9c2d TESTING test-engineer "Writing tests"

# Test Engineer가 완료
.pioneer/scripts/task-manager.sh update TASK-a3f9c2d READY_FOR_COMMIT scrum-master "Tests passing"

# Scrum Master가 커밋하고 완료
.pioneer/scripts/task-manager.sh update TASK-a3f9c2d DONE scrum-master "Committed in abc123"

# Task 차단
.pioneer/scripts/task-manager.sh update TASK-a3f9c2d BLOCKED scrum-master "Waiting for API access"

# Task 취소
.pioneer/scripts/task-manager.sh update TASK-a3f9c2d CANCELLED scrum-master "No longer needed"
```

**Task 타입별 상태 전환**:

feat/fix/refactor/perf:
```
TODO → IN_PROGRESS → READY_FOR_TEST → TESTING → READY_FOR_COMMIT → DONE
```

docs/style:
```
TODO → IN_PROGRESS → READY_FOR_COMMIT → DONE
```

test:
```
TODO → TESTING → READY_FOR_COMMIT → DONE
```

**자동 업데이트**:
- YAML frontmatter의 `status`, `assignee`, `updated` 업데이트
- Status History 테이블에 행 추가
- Epic task 목록 동기화 (체크박스 + 상태)
- Epic 진행률 업데이트
- PR body 동기화 (gh CLI 설치 및 PR 존재 시)

---

#### complete

Task를 DONE으로 표시 (단축 명령).

**문법**:
```bash
.pioneer/scripts/task-manager.sh complete <task_id>
```

**동등한 명령**: `task-manager.sh update <task_id> DONE system "Task completed"`

**예시**:
```bash
.pioneer/scripts/task-manager.sh complete TASK-a3f9c2d
```

**자동 업데이트**:
- 상태를 DONE으로 설정
- Epic 동기화 (체크박스, 진행률, PR body)
- 모든 task 완료 시 Epic을 IN_REVIEW로 자동 전환 가능

**사용 시점**: Scrum Master가 task를 커밋한 후

---

#### reopen

완료된 Task를 재오픈 (PR 피드백용).

**문법**:
```bash
.pioneer/scripts/task-manager.sh reopen <task_id> [메모]
```

**파라미터**:
- `task_id` (필수): Task ID
- `note` (선택): 재오픈 이유 (기본값: "PR feedback - reopening task")

**예시**:
```bash
# 기본 메모로 재오픈
.pioneer/scripts/task-manager.sh reopen TASK-a3f9c2d

# 사용자 지정 메모로 재오픈
.pioneer/scripts/task-manager.sh reopen TASK-a3f9c2d "PR feedback: add error handling"
```

**자동 업데이트**:
- 상태를 DONE에서 IN_PROGRESS로 변경
- 담당자를 현재 agent로 설정 (PIONEER_AGENT 환경 변수 또는 USER 사용)
- Epic 동기화 (체크박스 해제, 진행률 되돌림)
- Epic을 IN_REVIEW에서 IN_PROGRESS로 자동 전환 가능
- PR body 동기화

**사용 사례**: 새 task를 만들지 않고 코드 리뷰 의견 반영

---

#### list

Task 목록을 필터링하여 조회합니다.

**문법**:
```bash
.pioneer/scripts/task-manager.sh list [필터] [epic_id]
```

**파라미터**:
- `filter` (선택): `all`, `active` (기본값), `completed`, `blocked`, `cancelled`
- `epic_id` (선택): 특정 Epic의 task만 표시

**필터 정의**:
- `active`: DONE을 제외한 모든 상태
- `completed`: DONE
- `blocked`: BLOCKED
- `cancelled`: CANCELLED
- `all`: 필터링 없음

**예시**:
```bash
# 특정 Epic의 활성 task
.pioneer/scripts/task-manager.sh list active EPIC-e8a9c2d

# 특정 Epic의 모든 task
.pioneer/scripts/task-manager.sh list all EPIC-e8a9c2d

# Epic의 완료된 task
.pioneer/scripts/task-manager.sh list completed EPIC-e8a9c2d

# 모든 Epic의 활성 task
.pioneer/scripts/task-manager.sh list active

# 모든 차단된 task (주의 필요)
.pioneer/scripts/task-manager.sh list blocked

# 모든 취소된 task
.pioneer/scripts/task-manager.sh list cancelled
```

**출력** (Epic ID 지정 시):
```
ℹ Tasks for Epic EPIC-e8a9c2d (filter: active):
  - TASK-a3f9c2d: Login API [IN_PROGRESS] (@developer)
  - TASK-b8e1f4a: Logout API [TODO] (@scrum-master)
```

**출력** (모든 Epic):
```
ℹ All Tasks (filter: active):
  - TASK-a3f9c2d: Login API [IN_PROGRESS] (@developer) (Epic: EPIC-e8a9c2d)
  - TASK-c9f2e5b: Slack API [TESTING] (@test-engineer) (Epic: EPIC-f3b8a1c)
```

---

#### show

Task의 전체 세부 정보를 표시합니다.

**문법**:
```bash
.pioneer/scripts/task-manager.sh show <task_id>
```

**예시**:
```bash
.pioneer/scripts/task-manager.sh show TASK-a3f9c2d
```

**출력**: task 파일의 전체 내용 (YAML frontmatter + markdown 섹션)

**사용 사례**: task 요구사항, 기술 스펙, 작업 로그, 상태 이력 검토

**자동 위치 파악**: Task는 모든 Epic에서 자동으로 찾습니다 (Epic ID 지정 불필요)

---

#### help

사용법 정보를 표시합니다.

**문법**:
```bash
.pioneer/scripts/task-manager.sh help
.pioneer/scripts/task-manager.sh  # (명령 없음)
```

---

## 환경 변수

### PIONEER_AGENT

상태 업데이트 시 사용할 agent 이름을 설정합니다.

**사용법**:
```bash
export PIONEER_AGENT=developer
.pioneer/scripts/task-manager.sh update TASK-abc IN_PROGRESS developer "Starting work"
```

**값**: `developer`, `test-engineer`, `scrum-master`

**기본값**: 설정되지 않은 경우 `$USER`로 대체

**사용 사례**: 자동화 스크립트, 멀티 에이전트 시스템

---

## 자동 동기화 기능

### Epic 진행률 동기화

Task 상태가 변경되면 상위 Epic이 자동으로 업데이트됩니다:

**동기화되는 필드**:
- Task 체크박스 (`[ ]` 또는 `[x]`)
- Task 상태 텍스트 (`TODO`, `IN_PROGRESS` 등)
- 진행률 백분율 (`3/5 Tasks (60%)`)

**예시**:

변경 전:
```markdown
## Tasks

- [ ] TASK-abc: Login API [high] - TODO
- [ ] TASK-def: Logout API [medium] - TODO

**Total**: 0/2 Tasks (0%)
```

변경 후 (TASK-abc 완료):
```markdown
## Tasks

- [x] TASK-abc: Login API [high] - DONE
- [ ] TASK-def: Logout API [medium] - TODO

**Total**: 1/2 Tasks (50%)
```

---

### Epic 상태 자동 전환

Task 상태에 따라 Epic 상태가 자동으로 업데이트됩니다:

**전환 규칙**:
- 어떤 task든 시작 → Epic이 `IN_PROGRESS`가 됨
- 모든 task DONE → Epic이 `IN_REVIEW`가 됨
- 어떤 task든 재오픈 → Epic이 `IN_PROGRESS`로 되돌아감

**예시**:
```bash
# Epic은 TODO로 시작
.pioneer/scripts/epic-manager.sh create "Feature X" high
# EPIC-abc [TODO]

# 첫 번째 task 시작
.pioneer/scripts/task-manager.sh update TASK-123 IN_PROGRESS developer
# EPIC-abc [IN_PROGRESS] ← 자동 업데이트

# 마지막 task 완료
.pioneer/scripts/task-manager.sh complete TASK-456
# EPIC-abc [IN_REVIEW] ← 자동 업데이트

# PR 피드백으로 task 재오픈
.pioneer/scripts/task-manager.sh reopen TASK-456
# EPIC-abc [IN_PROGRESS] ← 자동 업데이트
```

---

### PR Body 동기화

`gh` CLI가 설치되고 PR URL이 설정되어 있으면, Task 완료 시 PR 설명이 자동으로 동기화됩니다.

**요구사항**:
- `gh` CLI 설치 및 인증 완료
- `epic-manager.sh set-pr`로 PR URL 설정

**동기화되는 항목**:
- Epic 설명
- Task 목록 (체크박스 포함)
- 진행률 백분율

**예시**:
```bash
# PR 생성
gh pr create --title "feat: User Auth" --body-file .pioneer/epics/EPIC-abc/epic.md
PR_URL=$(gh pr view --json url -q .url)

# Epic에 PR 연결
.pioneer/scripts/epic-manager.sh set-pr EPIC-abc "$PR_URL"

# Task 완료
.pioneer/scripts/task-manager.sh complete TASK-123
# PR 설명 자동 업데이트 ✅
```

**수동 동기화** (gh CLI 사용 불가 시):
```bash
.pioneer/scripts/epic-manager.sh show EPIC-abc > /tmp/pr-body.md
# GitHub PR에 수동으로 복사
```

---

## 파일 구조

### Epic 파일 형식

**위치**: `.pioneer/epics/EPIC-{id}/epic.md`

**구조**:
```markdown
---
id: EPIC-abc1234
title: User Authentication
type: epic
status: IN_PROGRESS
priority: high
created: 2025-10-30T08:00:00Z
updated: 2025-10-30T09:30:00Z
branch: "feature/EPIC-abc1234"
pr_url: "https://github.com/org/repo/pull/123"
---

# Epic: User Authentication

## Description

[Epic 설명]

## Tasks

- [x] TASK-123: Login API [high] - DONE
- [ ] TASK-456: Logout API [medium] - IN_PROGRESS

**Total**: 1/2 Tasks (50%)

## Checklist

- [x] All Tasks completed (CANCELLED excluded)
- [x] Build succeeded
- [x] All tests passed
- [ ] PR created
- [ ] Code reviewed and approved
- [ ] PR merged to main
```

---

### Task 파일 형식

**위치**: `.pioneer/epics/EPIC-{id}/tasks/TASK-{id}.md`

**구조**:
```markdown
---
id: TASK-abc1234
title: Login API
type: task
task_type: feat
status: IN_PROGRESS
priority: high
created: 2025-10-30T08:00:00Z
updated: 2025-10-30T09:30:00Z
assignee: developer
epic: EPIC-abc1234
dependencies: []
---

# TASK-abc1234: Login API

## Description

[Task 설명]

## Requirements

- [ ] 요구사항 1
- [ ] 요구사항 2

## Tech Spec

[Developer가 추가한 기술 스펙]

## Work Log

### 2025-10-30 08:00 - scrum-master
- Task 생성됨

### 2025-10-30 09:30 - developer
- 구현 시작

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 08:00 | TODO | scrum-master | Task created |
| 2025-10-30 09:30 | IN_PROGRESS | developer | Starting implementation |

## Artifacts

- Branch: feature/EPIC-abc1234
- Commit: abc123def
- Files Modified: src/auth/login.ts

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed
- [x] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed
```

---

## 문제 해결

### Command Not Found

**증상**:
```bash
bash: .pioneer/scripts/epic-manager.sh: No such file or directory
```

**해결책**:
```bash
# 프로젝트 루트에 있는지 확인
pwd
# 다음과 같이 표시되어야 함: /path/to/api-monorepo-starter

# 파일이 존재하는지 확인
ls .pioneer/scripts/
```

---

### Permission Denied

**증상**:
```bash
bash: .pioneer/scripts/epic-manager.sh: Permission denied
```

**해결책**:
```bash
# 스크립트를 실행 가능하게 만들기
chmod +x .pioneer/scripts/epic-manager.sh
chmod +x .pioneer/scripts/task-manager.sh
```

---

### sed: invalid command

**증상** (macOS에서):
```
sed: 1: "file.md": invalid command code f
```

**원인**: macOS에서 Linux sed 문법 사용

**해결책**: 스크립트가 `$OSTYPE`을 통해 OS를 자동 감지합니다. 스크립트가 최신 버전인지 확인하세요.

---

### Epic/Task Not Found

**증상**:
```
❌ Epic not found: EPIC-abc1234
```

**해결책**:
```bash
# 모든 Epic 나열
.pioneer/scripts/epic-manager.sh list all

# ID 철자 확인 (복사-붙여넣기 권장)
.pioneer/scripts/epic-manager.sh show EPIC-abc1234

# 파일이 존재하는지 확인
ls .pioneer/epics/EPIC-abc1234/epic.md
```

---

### PR Body Not Syncing

**증상**: Task 완료 시 PR 설명이 업데이트되지 않음

**해결책**:
```bash
# gh CLI 설치 확인
gh --version

# gh CLI 설치
brew install gh  # macOS
# 또는: sudo apt install gh  # Linux
# 또는: https://cli.github.com/

# gh CLI 인증
gh auth login

# PR URL이 설정되었는지 확인
.pioneer/scripts/epic-manager.sh show EPIC-abc | grep pr_url

# 수동 동기화
.pioneer/scripts/epic-manager.sh show EPIC-abc > /tmp/body.md
gh pr edit 123 --body-file /tmp/body.md
```

---

### Epic Status Stuck

**증상**: Epic 상태가 자동 업데이트되지 않음

**해결책**:
```bash
# Task 상태 확인
.pioneer/scripts/task-manager.sh list all EPIC-abc

# IN_PROGRESS를 위해 최소 하나의 task가 활성 상태인지,
# 또는 IN_REVIEW를 위해 모든 task가 DONE인지 확인

# 문제가 지속되면 수동 업데이트
.pioneer/scripts/epic-manager.sh update EPIC-abc IN_PROGRESS
```

---

### UUID Generation Fails

**증상**:
```
EPIC-: Epic created
```

**원인**: `uuidgen`을 사용할 수 없고 `/dev/urandom`도 실패

**해결책**:
```bash
# uuidgen 설치 (보통 사전 설치됨)
# macOS: 내장
# Linux: sudo apt install uuid-runtime

# 확인
uuidgen
```

---

### Special Characters in Title

**증상**: 제목이 잘리거나 명령이 실패함

**해결책**: 항상 제목을 따옴표로 묶으세요
```bash
# 잘못됨
.pioneer/scripts/epic-manager.sh create Add User's Profile high

# 올바름
.pioneer/scripts/epic-manager.sh create "Add User's Profile" high
```

---

## 고급 사용법

### 스크립팅 예시: 자동화된 Epic 설정

```bash
#!/bin/bash
# setup-feature.sh - 표준 task가 포함된 Epic 생성

set -e

FEATURE_NAME="$1"
PRIORITY="${2:-high}"

if [ -z "$FEATURE_NAME" ]; then
  echo "Usage: setup-feature.sh \"<feature name>\" [priority]"
  exit 1
fi

# Epic 생성
EPIC_ID=$(.pioneer/scripts/epic-manager.sh create "$FEATURE_NAME" "$PRIORITY")
echo "Created Epic: $EPIC_ID"

# 브랜치 생성
BRANCH="feature/$EPIC_ID"
git checkout -b "$BRANCH"
.pioneer/scripts/epic-manager.sh set-branch "$EPIC_ID" "$BRANCH"

# 표준 task 생성
IMPL_TASK=$(.pioneer/scripts/task-manager.sh create "${FEATURE_NAME} - Implementation" high "$EPIC_ID" feat)
DOCS_TASK=$(.pioneer/scripts/task-manager.sh create "${FEATURE_NAME} - Documentation" medium "$EPIC_ID" docs)
TEST_TASK=$(.pioneer/scripts/task-manager.sh create "${FEATURE_NAME} - Integration Tests" high "$EPIC_ID" test)

echo "Created tasks: $IMPL_TASK, $DOCS_TASK, $TEST_TASK"

# Epic 시작
.pioneer/scripts/epic-manager.sh update "$EPIC_ID" IN_PROGRESS

echo "✅ Epic $EPIC_ID ready on branch $BRANCH"
```

**사용법**:
```bash
./setup-feature.sh "User Authentication" high
```

---

### 스크립팅 예시: 대량 Task 업데이트

```bash
#!/bin/bash
# complete-all-tasks.sh - Epic의 모든 task를 DONE으로 표시

EPIC_ID="$1"

if [ -z "$EPIC_ID" ]; then
  echo "Usage: complete-all-tasks.sh EPIC-abc1234"
  exit 1
fi

# 모든 활성 task 찾기
TASKS=$(.pioneer/scripts/task-manager.sh list active "$EPIC_ID" | grep TASK- | awk '{print $2}' | cut -d: -f1)

for task in $TASKS; do
  echo "Completing $task..."
  .pioneer/scripts/task-manager.sh complete "$task"
done

echo "✅ All tasks completed for $EPIC_ID"
```

---

### Git Hooks와의 통합

**Pre-commit hook** (task 상태 검증):
```bash
#!/bin/bash
# .git/hooks/pre-commit

# 커밋 메시지에서 Task ID 추출
TASK_ID=$(git log -1 --pretty=%B | grep -o 'TASK-[a-z0-9]\{7\}' | head -1)

if [ -z "$TASK_ID" ]; then
  echo "❌ Commit message must include Task ID (TASK-xxxxxxx)"
  exit 1
fi

# task가 READY_FOR_COMMIT 상태인지 확인
STATUS=$(.pioneer/scripts/task-manager.sh show "$TASK_ID" | grep '^status:' | awk '{print $2}')

if [ "$STATUS" != "READY_FOR_COMMIT" ] && [ "$STATUS" != "DONE" ]; then
  echo "❌ Task $TASK_ID is not READY_FOR_COMMIT (current: $STATUS)"
  exit 1
fi

echo "✅ Task $TASK_ID is ready for commit"
```

---

### CI/CD 통합

**GitHub Actions** (병합 시 Epic 자동 종료):
```yaml
name: Close Epic on Merge

on:
  pull_request:
    types: [closed]

jobs:
  close-epic:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Extract Epic ID from branch
        id: epic
        run: |
          BRANCH="${{ github.event.pull_request.head.ref }}"
          EPIC_ID=$(echo "$BRANCH" | grep -o 'EPIC-[a-z0-9]\{7\}')
          echo "epic_id=$EPIC_ID" >> $GITHUB_OUTPUT

      - name: Complete Epic
        run: |
          .pioneer/scripts/epic-manager.sh complete ${{ steps.epic.outputs.epic_id }}

      - name: Commit Epic status
        run: |
          git add .pioneer/epics/
          git commit -m "chore: close Epic ${{ steps.epic.outputs.epic_id }}"
          git push
```

---

## 모범 사례

### 1. 항상 제목을 따옴표로 묶기
```bash
# 잘못됨
.pioneer/scripts/epic-manager.sh create Add User Auth high

# 올바름
.pioneer/scripts/epic-manager.sh create "Add User Auth" high
```

### 2. 스크립트에서 ID 캡처하기
```bash
# 잘못됨 - ID 손실
.pioneer/scripts/epic-manager.sh create "Feature X" high

# 올바름 - ID 캡처됨
EPIC_ID=$(.pioneer/scripts/epic-manager.sh create "Feature X" high)
git checkout -b "feature/$EPIC_ID"
```

### 3. Task 생성 전 Epic 존재 확인
```bash
# Epic이 존재하는지 확인
if ! .pioneer/scripts/epic-manager.sh show "$EPIC_ID" &>/dev/null; then
  echo "Epic $EPIC_ID not found"
  exit 1
fi

# 이제 안전하게 task 생성 가능
.pioneer/scripts/task-manager.sh create "Task X" high "$EPIC_ID" feat
```

### 4. 필터를 사용하여 작업에 집중하기
```bash
# 일일 스탠드업: 무엇이 활성 상태인가?
.pioneer/scripts/epic-manager.sh list active
.pioneer/scripts/task-manager.sh list active

# 무엇이 차단되었나?
.pioneer/scripts/task-manager.sh list blocked
```

### 5. Epic을 Git에 조기 연결
```bash
EPIC_ID=$(.pioneer/scripts/epic-manager.sh create "Feature" high)
BRANCH="feature/$EPIC_ID"

git checkout -b "$BRANCH"
.pioneer/scripts/epic-manager.sh set-branch "$EPIC_ID" "$BRANCH"
.pioneer/scripts/epic-manager.sh update "$EPIC_ID" IN_PROGRESS
```

---

## 참고 자료

- [CLI Reference](../workflow/cli-reference.md) - 워크플로우 중심 문서
- [Task Types](../workflow/task-types.md) - Task 타입 정의
- [Task Status Workflow](../workflow/task-status-workflow.md) - 상태 상태 머신
- [Scrum Master Guide](../workflow/scrum-master-guide.md) - Epic/Task 관리 워크플로우
