# CLI Reference

> Epic/Task 관리 워크플로우 빠른 참조

---

## 빠른 시작

Pioneer는 Epic과 Task를 관리하는 두 가지 방법을 제공합니다:

### Skills (대부분의 사용자에게 권장)

**Skills는 Claude가 자동으로 호출합니다** - 자연어로 요청하면 됩니다:

```
"새 Epic 만들어줘: 인증 기능"
"Task 시작해줘 TASK-abc1234"
"Epic 상태 보여줘 EPIC-e8a9c2d"
```

**장점**: 자연어 인터페이스, Claude가 자동 판단, 워크플로우 중심, 오류 가능성 낮음
**단점**: 미리 정의된 워크플로우로 제한됨

참고: `.claude/skills/`에서 사용 가능한 Skills 확인
- `epic-management` - Epic 관리
- `task-management` - Task 관리
- `start-epic` - Epic 시작 워크플로우
- `health-check` - 구조 검증

### CLI Scripts (고급 사용자 / 자동화)

전체 제어를 위해 bash 스크립트 직접 사용:

```bash
.pioneer/scripts/epic-manager.sh create "User Authentication" high
.pioneer/scripts/task-manager.sh create "Login API" high EPIC-e8a9c2d feat
```

**장점**: 완전한 제어, 스크립트 작성 가능, 자동화 친화적
**단점**: 명령 문법 지식 필요, 오류 가능성 높음

참고: 전체 명령 참조는 [.pioneer/scripts/README.md](../scripts/README.md)

---

## 일반적인 워크플로우

### 1. 새 Epic 시작하기

**목표**: Epic 생성, 브랜치 생성, 작업 시작

**Skills 사용** (권장):
```
"Start new epic: Add Slack notifications"
```

**CLI 사용**:
```bash
# 1. Epic 생성
EPIC_ID=$(.pioneer/scripts/epic-manager.sh create "Add Slack notifications" high)

# 2. 브랜치 생성
git checkout -b "feature/$EPIC_ID"

# 3. Epic 메타데이터에 브랜치 설정
.pioneer/scripts/epic-manager.sh set-branch "$EPIC_ID" "feature/$EPIC_ID"

# 4. Epic 상태 업데이트
.pioneer/scripts/epic-manager.sh update "$EPIC_ID" IN_PROGRESS
```

**이유**: Skills는 브랜치 네이밍과 상태 업데이트를 자동화합니다. CLI는 각 단계를 완전히 제어할 수 있습니다.

---

### 2. Epic에 Task 생성하기

**목표**: Epic을 올바른 타입의 Task로 분해

**Skills 사용** (권장):
```
"Create feat task for EPIC-abc1234: Implement SlackProvider"
"Create test task for EPIC-abc1234: Add UserService test coverage"
```

**CLI 사용**:
```bash
# Feature task (구현 + 테스트)
.pioneer/scripts/task-manager.sh create "Implement SlackProvider" high EPIC-abc1234 feat

# Test 전용 task (기존 코드용)
.pioneer/scripts/task-manager.sh create "Improve UserService coverage" medium EPIC-abc1234 test

# 문서화 task (테스트 불필요)
.pioneer/scripts/task-manager.sh create "API documentation" medium EPIC-abc1234 docs
```

**이유**: Task 타입이 워크플로우를 결정합니다 (feat/fix → Developer + Test Engineer, docs → Developer만).

**중요**:
- feat/fix/refactor task는 구현과 테스트를 모두 포함
- 새 기능에 대한 별도 테스트 task 생성하지 마세요
- test 타입은 기존 코드의 커버리지 개선용으로만 사용

참고: 타입 정의는 [task-types.md](task-types.md)

---

### 3. Task 작업하기

**목표**: 작업 진행에 따라 task 상태 업데이트

**Skills 사용** (권장):
```
"Start working on TASK-abc1234"
"Mark TASK-abc1234 ready for test"
"Complete TASK-abc1234"
```

**CLI 사용**:
```bash
# Developer가 작업 시작
.pioneer/scripts/task-manager.sh update TASK-abc1234 IN_PROGRESS developer "Starting implementation"

# Developer 완료, 테스트 준비
.pioneer/scripts/task-manager.sh update TASK-abc1234 READY_FOR_TEST test-engineer "Implementation complete"

# Test Engineer 테스트 완료
.pioneer/scripts/task-manager.sh update TASK-abc1234 READY_FOR_COMMIT scrum-master "Tests passing"

# Scrum Master 커밋 (검토 후)
# ... git commit ...
.pioneer/scripts/task-manager.sh update TASK-abc1234 DONE scrum-master "Committed"
```

**이유**: 상태 업데이트는 진행 상황을 추적하고 워크플로우 전환을 트리거합니다.

**워크플로우 전환**:
- feat/fix/refactor: TODO → IN_PROGRESS → READY_FOR_TEST → TESTING → READY_FOR_COMMIT → DONE
- docs/style: TODO → IN_PROGRESS → READY_FOR_COMMIT → DONE
- test: TODO → TESTING → READY_FOR_COMMIT → DONE

참고: 상태 머신은 [task-status-workflow.md](task-status-workflow.md)

---

### 4. Epic 진행 상황 확인

**목표**: Epic 전체 상태 및 남은 task 확인

**Skills 사용** (권장):
```
"Show status for EPIC-abc1234"
```

**CLI 사용**:
```bash
# Epic 상세 정보 표시 (task 목록 및 진행률 포함)
.pioneer/scripts/epic-manager.sh show EPIC-abc1234

# 이 Epic의 모든 활성 task 나열
.pioneer/scripts/task-manager.sh list active EPIC-abc1234

# 완료된 task 나열
.pioneer/scripts/task-manager.sh list completed EPIC-abc1234
```

**이유**: PR 생성 전 진행 상황 추적.

**Epic 진행률 자동 업데이트**: task가 완료되면:
- Epic.md 표시: `**Total**: 3/5 Tasks (60%)`
- Epic 상태 자동 업데이트: IN_PROGRESS → IN_REVIEW (모든 task 완료 시)

---

### 5. Pull Request 생성

**목표**: 모든 task 완료 후 코드 리뷰를 위해 Epic 제출

**Skills 사용** (권장):
```
"Create PR for EPIC-abc1234"
```

**CLI 사용**:
```bash
# 1. 모든 task가 DONE인지 확인
.pioneer/scripts/task-manager.sh list all EPIC-abc1234

# 2. gh CLI로 PR 생성
gh pr create --title "feat: Add Slack notifications" --body-file .pioneer/epics/EPIC-abc1234/epic.md

# 3. Epic에 PR URL 설정
.pioneer/scripts/epic-manager.sh set-pr EPIC-abc1234 "https://github.com/org/repo/pull/123"

# 4. Epic 상태가 IN_REVIEW로 자동 업데이트
```

**이유**: PR body는 Epic 설명 및 task 목록과 동기화됩니다.

**PR body 자동 동기화**: task 완료 시 PR 설명이 자동으로 업데이트됩니다 (gh CLI 설치된 경우).

---

### 6. PR 피드백 처리 (Task 재오픈)

**목표**: task를 재오픈하여 리뷰 코멘트 반영

**Skills 사용** (권장):
```
"Reopen TASK-abc1234 for PR feedback"
```

**CLI 사용**:
```bash
# Task 재오픈 (DONE → IN_PROGRESS)
.pioneer/scripts/task-manager.sh reopen TASK-abc1234 "PR feedback: add error handling"

# 변경 사항 작업...

# 상태 다시 업데이트
.pioneer/scripts/task-manager.sh update TASK-abc1234 READY_FOR_TEST test-engineer "Feedback addressed"

# Epic 상태가 IN_REVIEW에서 IN_PROGRESS로 자동 복귀
```

**이유**: Task를 재오픈하면 Epic 상태가 자동으로 업데이트되어 조기 병합을 방지합니다.

**자동 업데이트**:
- Task: DONE → IN_PROGRESS
- Epic: IN_REVIEW → IN_PROGRESS (task가 재오픈된 경우)
- PR body: task가 더 이상 완료되지 않았음을 표시하도록 동기화

---

### 7. Epic 완료

**목표**: PR 병합 후 Epic을 완료로 표시

**Skills 사용** (권장):
```
"Complete EPIC-abc1234"
```

**CLI 사용**:
```bash
# PR이 main에 병합된 후
.pioneer/scripts/epic-manager.sh complete EPIC-abc1234
```

**이유**: 별도의 완료 단계로 병합된 Epic과 리뷰 중인 Epic을 추적할 수 있습니다.

**Epic 라이프사이클**:
```
TODO → IN_PROGRESS → IN_REVIEW → DONE
         ↑              ↓
         └──────────────┘
         (PR 피드백으로 task 재오픈)
```

---

### 8. 활성 작업 나열

**목표**: 모든 Epic에서 진행 중인 작업 확인

**Skills 사용** (권장):
```
"Show active epics"
"Show my active tasks"
```

**CLI 사용**:
```bash
# 활성 Epic (TODO, IN_PROGRESS, IN_REVIEW)
.pioneer/scripts/epic-manager.sh list active

# 모든 활성 task (DONE 제외)
.pioneer/scripts/task-manager.sh list active

# 차단된 task (주의 필요)
.pioneer/scripts/task-manager.sh list blocked
```

**이유**: 일일 스탠드업 가시성, 차단 요소 식별.

---

### 9. Task 차단

**목표**: 의존성이나 명확화가 필요할 때 task를 차단으로 표시

**Skills 사용** (권장):
```
"Block TASK-abc1234: waiting for API keys"
```

**CLI 사용**:
```bash
# Task 차단
.pioneer/scripts/task-manager.sh update TASK-abc1234 BLOCKED scrum-master "Waiting for external API keys"

# 나중에: 차단 해제 및 재개
.pioneer/scripts/task-manager.sh update TASK-abc1234 IN_PROGRESS developer "API keys received"
```

**이유**: 차단 요소를 명시적으로 추적하여 task가 잊혀지는 것을 방지합니다.

**Scrum Master 개입**: 차단된 task는 검토하여 해결하거나 취소해야 합니다.

---

## Skills vs CLI 사용 시점

### Skills를 사용할 때:
- 새 Epic 시작 (브랜치 자동 생성)
- 일반적인 task 타입 생성 (feat, test, docs)
- Task 상태 업데이트 (의도가 더 명확함)
- 가드레일 필요 (Skills가 입력 검증)
- Claude와 대화식으로 작업

### CLI를 사용할 때:
- 워크플로우 자동화 (CI/CD 스크립트)
- 대량 작업 (여러 task 생성)
- 커스텀 task 타입 또는 특수 케이스
- 복잡한 워크플로우 스크립팅
- 파라미터에 대한 완전한 제어 필요

### 예시: 자동화 스크립트

```bash
#!/bin/bash
# 새 기능을 위한 자동화된 Epic 설정

EPIC_ID=$(.pioneer/scripts/epic-manager.sh create "$FEATURE_NAME" high)
BRANCH="feature/$EPIC_ID"

git checkout -b "$BRANCH"
.pioneer/scripts/epic-manager.sh set-branch "$EPIC_ID" "$BRANCH"
.pioneer/scripts/epic-manager.sh update "$EPIC_ID" IN_PROGRESS

# 표준 task 생성
.pioneer/scripts/task-manager.sh create "API implementation" high "$EPIC_ID" feat
.pioneer/scripts/task-manager.sh create "API documentation" medium "$EPIC_ID" docs
.pioneer/scripts/task-manager.sh create "Integration tests" high "$EPIC_ID" test

echo "Epic $EPIC_ID created on branch $BRANCH"
```

---

## 상태 참조

### Epic 상태

| 상태 | 의미 | 자동 전환? |
|--------|---------|------------------|
| TODO | 생성됨, 시작 안 함 | 아니오 |
| IN_PROGRESS | 최소 하나의 task 진행 중 | 예 (첫 task 시작 시) |
| IN_REVIEW | 모든 task 완료, PR 생성됨 | 예 (마지막 task 완료 시) |
| BLOCKED | 외부 차단 요소 | 아니오 (수동만) |
| DONE | PR 병합됨 | 아니오 (수동만) |

### Task 상태

| 상태 | 의미 | 누가 업데이트? |
|--------|---------|--------------|
| TODO | 생성됨, 시작 안 함 | Scrum Master |
| IN_PROGRESS | 작업 중 | Developer/Test Engineer |
| READY_FOR_TEST | 구현 완료, 테스트 필요 | Developer |
| TESTING | 테스트 작성 중 | Test Engineer |
| READY_FOR_COMMIT | 완료, 커밋 대기 | Test Engineer |
| BLOCKED | 진행 불가 | 모든 agent |
| CANCELLED | 더 이상 필요 없음 | Scrum Master |
| DONE | 커밋됨 | Scrum Master |

참고: 상세한 상태 머신은 [task-status-workflow.md](task-status-workflow.md)

---

## Task 타입 참조

| 타입 | 테스트 포함? | 워크플로우 |
|------|----------------|----------|
| feat | 예 (자동) | Developer → Test Engineer |
| fix | 예 (자동) | Developer → Test Engineer |
| refactor | 예 (자동) | Developer → Test Engineer |
| perf | 예 (자동) | Developer → Test Engineer |
| test | 테스트만 | Test Engineer만 |
| docs | 아니오 | Developer만 |
| style | 아니오 | Developer만 |
| chore | 상황에 따라 | 상황별 |

**중요**: feat/fix/refactor에 대한 별도 테스트 task를 생성하지 마세요. 테스트는 자동으로 포함됩니다.

참고: 전체 타입 정의는 [task-types.md](task-types.md)

---

## 파일 위치

| 경로 | 목적 |
|------|---------|
| `.pioneer/epics/EPIC-{id}/epic.md` | Epic 메타데이터 및 task 목록 |
| `.pioneer/epics/EPIC-{id}/tasks/TASK-{id}.md` | Task 상세 정보 및 상태 이력 |
| `.pioneer/scripts/epic-manager.sh` | Epic 관리 CLI |
| `.pioneer/scripts/task-manager.sh` | Task 관리 CLI |
| `.claude/skills/` | Claude Code Skills (4개 제공) |

---

## 문제 해결

### "Epic not found"

```bash
# Epic ID 확인
.pioneer/scripts/epic-manager.sh list all

# Epic 디렉토리 존재 확인
ls .pioneer/epics/EPIC-abc1234/
```

### "Task not found"

```bash
# Task는 Epic 전체에서 자동으로 찾아집니다
.pioneer/scripts/task-manager.sh show TASK-abc1234

# 수동 검색
find .pioneer/epics -name "TASK-abc1234.md"
```

### Epic 상태가 자동 업데이트되지 않음

```bash
# Task 상태 수동 확인
.pioneer/scripts/task-manager.sh list all EPIC-abc1234

# Epic은 task 전환 시 자동 업데이트됨
# 막힌 경우, 수동 업데이트:
.pioneer/scripts/epic-manager.sh update EPIC-abc1234 IN_PROGRESS
```

### PR body가 동기화되지 않음

```bash
# gh CLI 필요
gh --version

# 누락된 경우 설치:
brew install gh  # macOS
# or: sudo apt install gh  # Linux

# 수동 PR body 업데이트
.pioneer/scripts/epic-manager.sh show EPIC-abc1234 > /tmp/pr-body.md
gh pr edit 123 --body-file /tmp/pr-body.md
```

---

## 전체 명령 참조

전체 문법 및 사용 가능한 모든 명령은 다음을 참조하세요:

[.pioneer/scripts/README.md](../scripts/README.md)
