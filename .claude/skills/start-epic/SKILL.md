---
name: start-epic
description: Complete workflow to start new Epic with C4 Model analysis and Task breakdown. Use when user wants to begin new Epic or feature with full workflow (create Epic → git branch → C4 analysis → Task decomposition). Triggers include "start new epic", "begin new feature", "create epic with tasks", "initialize epic workflow".
allowed-tools: Bash, Read, Edit, Glob
---

# Epic 시작 워크플로우

완전한 워크플로우로 새 Epic을 시작합니다:
1. Epic 생성
2. git 브랜치 생성
3. C4 Model 읽기 (가능한 경우)
4. Epic 분석 및 Task로 분해

## 사용 시점

Claude가 다음과 같은 사용자 의도를 감지하면 자동으로 이 Skill을 호출합니다:
- "새 Epic 시작해줘" (전체 워크플로우)
- "Epic 만들고 Task 분해까지 해줘"
- "새 기능 시작하려고 하는데 Epic부터 설정해줘"
- "Epic 워크플로우 실행해줘"

단순 Epic 생성만 원할 경우 `epic-management` Skill이 호출됩니다.

## 파라미터

- `$1` - Epic 제목 (필수)
- `$2` - 우선순위: low|medium|high (기본값: medium)

## 워크플로우 단계

### 1단계: Epic 생성

!if [ -z "$1" ]; then
!  echo "Error: Epic title is required"
!  echo "Usage: start-epic <title> [priority]"
!  echo "Example: start-epic \"User Authentication\" high"
!  exit 1
!fi

!echo "Creating Epic: $1"
!echo "Priority: ${2:-medium}"
!/Users/jaehwankim/Workspace/api-monorepo-starter/.pioneer/scripts/epic-manager.sh create "$1" "${2:-medium}"

### 2단계: Epic ID 가져오기 및 브랜치 생성

!EPIC_ID=$(ls -t /Users/jaehwankim/Workspace/api-monorepo-starter/.pioneer/epics/ | head -1)
!echo "Epic ID: $EPIC_ID"

!BRANCH_NAME="feature/$EPIC_ID"
!echo "Creating branch: $BRANCH_NAME"
!git checkout -b "$BRANCH_NAME"

!echo "Setting branch in Epic..."
!/Users/jaehwankim/Workspace/api-monorepo-starter/.pioneer/scripts/epic-manager.sh set-branch "$EPIC_ID" "$BRANCH_NAME"

!echo "Updating Epic status to IN_PROGRESS..."
!/Users/jaehwankim/Workspace/api-monorepo-starter/.pioneer/scripts/epic-manager.sh update "$EPIC_ID" IN_PROGRESS

### 3단계: C4 Model 분석

이제 C4 Model 다이어그램을 사용하여 시스템 아키텍처를 분석하겠습니다 (가능한 경우):

@docs/c4-model/00-INDEX.puml

C4 Model 분석을 기반으로 이 Epic을 Task로 분해하는 것을 도와드리겠습니다.

**Epic 생성됨**:
- ID: (위에 표시됨)
- 제목: $1
- 우선순위: ${2:-medium}
- 브랜치: (생성됨)

**다음 단계**:
이 Epic의 요구사항을 설명해 주시면:
1. 영향을 받는 컴포넌트 분석 (C4 다이어그램 사용)
2. Epic을 Task로 분해
3. Task 파일 생성

**참조 메모리** (컨텍스트용):
@.pioneer/workflow/task-types.md
@.pioneer/workflow/task-management.md
@.pioneer/agents/developer/memory/typescript-esm.md
@.pioneer/agents/developer/memory/dependency-injection.md

## 예시

```bash
# 높은 우선순위로 Epic 시작
start-epic "User Authentication System" high

# 기본 우선순위로 Epic 시작 (medium)
start-epic "Email Notification Service"

# 낮은 우선순위로 Epic 시작
start-epic "Documentation Update" low
```

## 다음에 일어나는 일

이 명령을 실행한 후:
1. ✅ Epic 생성됨
2. ✅ Git 브랜치 생성 및 체크아웃됨
3. ✅ Epic 상태가 IN_PROGRESS로 설정됨
4. ⏳ 요구사항 설명
5. ⏳ C4 다이어그램 분석 및 Task로 분해
6. ⏳ Task 생성 및 할당
