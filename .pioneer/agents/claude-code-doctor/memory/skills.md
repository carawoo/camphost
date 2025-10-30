# Skills 작성법

> 참고: https://docs.claude.com/en/docs/claude-code/skills

## 개요

Skills는 마크다운 파일로 작성되며, Claude가 대화 중 자동으로 감지하여 호출하는 model-invoked 기능입니다.

### Skills vs Slash Commands 비교

| 구분 | Skills | Slash Commands |
|------|--------|----------------|
| **호출 방식** | Claude가 자동 감지 | 사용자가 `/command` 형태로 명시적 호출 |
| **Trigger** | description에 키워드 포함하여 자동 감지 | 명령어 이름으로 직접 호출 |
| **YAML 필수 필드** | `name` 필수 | `name` 선택 (description만으로도 가능) |
| **사용 목적** | 반복적인 작업 자동화 | 명시적인 워크플로우 실행 |

**예시**:
- Skills: "PR을 만들어줘" → Claude가 `create-pr` skill 자동 호출
- Slash Commands: `/pr "Add feature"` → 사용자가 명시적으로 호출

## 기본 구조

```markdown
---
name: skill-name
description: Skill 설명 (trigger keywords 포함)
allowed-tools: tool1, tool2 (선택)
---

Skill 실행 시 Claude에게 지시할 내용
```

**필수 필드**:
- `name`: Skill 식별자 (kebab-case 권장)
- `description`: Skill 목적 및 trigger keywords

## 저장 위치

| 유형 | 경로 | 범위 | 버전 관리 |
|------|------|------|----------|
| **프로젝트 Skill** | `.claude/skills/{skill-name}/SKILL.md` | 현재 프로젝트 (팀 공유) | ✅ 권장 |
| **개인 Skill** | `~/.claude/skills/{skill-name}/SKILL.md` | 모든 프로젝트 (개인용) | ❌ |

**중요**:
- Skills는 반드시 `{skill-name}/SKILL.md` 구조를 따라야 합니다
- Slash Commands는 `.claude/commands/{command-name}.md` 구조를 사용합니다

**권장 사항**:
- 프로젝트별 자동화 워크플로우는 `.claude/skills/`에 저장
- 개인 유틸리티 도구는 `~/.claude/skills/`에 저장

## YAML 프론트매터

### `name` (필수)

Skill 식별자입니다. Claude가 이 이름으로 Skill을 인식합니다.

```markdown
---
name: create-pull-request
---
```

**네이밍 컨벤션**:
- kebab-case 사용 (예: `create-pr`, `run-tests`)
- 동사 + 명사 형태 권장 (예: `analyze-code`, `deploy-app`)

### `description` (필수)

Skill 목적을 설명하고, **trigger keywords**를 포함하여 Claude가 자동으로 감지할 수 있도록 합니다.

```markdown
---
name: create-pull-request
description: Create a GitHub pull request. Triggers on: "create pr", "make pull request", "open pr"
---
```

**Trigger Keywords 작성 팁**:
- 사용자가 자주 사용하는 표현 포함
- 동의어 및 약어 추가 (예: "pr", "pull request")
- 다양한 동사 포함 (예: "create", "make", "open")

### `allowed-tools` (선택)

Skill이 사용할 수 있는 도구를 제한합니다. **Bash 실행 시 필수**입니다.

```markdown
---
name: create-pull-request
description: Create a GitHub pull request
allowed-tools: Read, Bash, Grep
---
```

**사용 가능한 도구**:
```
Read, Write, Edit, Bash, Glob, Grep, TodoWrite, Task, WebFetch, WebSearch, AskUserQuestion
```

## 인자 사용

### 모든 인자 받기: `$ARGUMENTS`

```markdown
---
name: search-code
description: Search codebase for keywords. Triggers on: "search for", "find code"
---

다음 키워드를 코드베이스에서 검색하고 분석하세요: $ARGUMENTS
```

**사용 예시**:
```
사용자: "authentication security를 검색해줘"
Claude: search-code skill 호출 → $ARGUMENTS = "authentication security"
```

### 특정 인자 접근: `$1`, `$2`, ...

```markdown
---
name: create-pull-request
description: Create a GitHub pull request. Triggers on: "create pr", "make pull request"
allowed-tools: Bash, Read
---

!gh pr create --title "$1" --body "$2"
```

**사용 예시**:
```
사용자: "Add feature라는 제목으로 PR 만들어줘"
Claude: create-pull-request skill 호출 → $1 = "Add feature"
```

## Bash 실행: `!` 접두사

`!`로 시작하는 줄은 Bash 명령어로 실행됩니다.

**중요**: `allowed-tools`에 `Bash`를 반드시 포함해야 합니다.

```markdown
---
name: check-git-status
description: Check Git status and diff. Triggers on: "git status", "check repo status"
allowed-tools: Bash
---

!git status
!git diff --stat
```

### 복잡한 Bash 스크립트

```markdown
---
name: build-and-test
description: Build and test the project. Triggers on: "build and test", "run full pipeline"
allowed-tools: Bash
---

!set -e
!echo "Building..."
!yarn build
!echo "Testing..."
!yarn test
!echo "✅ Build and test completed"
```

## 파일 참조: `@` 접두사

`@` 접두사로 파일 내용을 Skill에 포함할 수 있습니다.

```markdown
---
name: review-code
description: Review code against coding standards. Triggers on: "review code", "check standards"
---

다음 파일을 읽고 코딩 규칙을 준수하는지 검토하세요:

@.pioneer/agents/developer/memory/coding-rules.md

검토 대상 파일: $ARGUMENTS
```

**사용 예시**:
```
사용자: "email.service.ts 코드 리뷰해줘"
Claude: review-code skill 호출 → coding-rules.md 읽고 → email.service.ts 검토
```

## 실전 예시

### 예시 1: PR 생성 Skill

**파일**: `.claude/skills/create-pr/SKILL.md`

```markdown
---
name: create-pull-request
description: Create a GitHub pull request. Triggers on "create pr", "make pull request", "open pr", "new pr"
allowed-tools: Bash, Read, Grep
---

다음 단계로 PR을 생성합니다:

1. Git 상태 확인
!git status

2. 최근 커밋 확인
!git log -5 --oneline

3. PR 생성
!gh pr create --title "$1" --body "$2"
```

**사용 예시**:
```
사용자: "Add email service라는 제목으로 PR 만들어줘"
Claude: create-pull-request skill 자동 호출
```

### 예시 2: 테스트 실행 Skill

**파일**: `.claude/skills/run-tests/SKILL.md`

```markdown
---
name: run-tests
description: Run tests with optional path. Triggers on "run tests", "test", "execute tests"
allowed-tools: Bash
---

테스트를 실행합니다.

인자가 제공된 경우: $ARGUMENTS
인자가 없는 경우: 전체 테스트 실행

!yarn test $ARGUMENTS
```

**사용 예시**:
```
사용자: "테스트 실행해줘"
Claude: run-tests skill 호출 → yarn test 실행
```

### 예시 3: 코드 리뷰 Skill

**파일**: `.claude/skills/review-code/SKILL.md`

```markdown
---
name: review-code
description: Review code for coding standards compliance. Triggers on "review", "check code", "code review"
---

다음 코딩 규칙을 참고하여 파일을 검토하세요:

@.pioneer/agents/developer/memory/coding-rules.md
@.pioneer/agents/developer/memory/typescript-esm.md

검토 항목:
- TypeScript ESM: `.js` 확장자 사용
- DI 패턴: `@singleton()`, `@injectable()` 데코레이터
- 타입 안전성: `any` 금지
- 에러 처리: try-catch 사용

검토 대상: $ARGUMENTS
```

**사용 예시**:
```
사용자: "email.service.ts 리뷰해줘"
Claude: review-code skill 호출 → 코딩 규칙 검토
```

### 예시 4: Epic 시작 Skill

**파일**: `.claude/skills/start-epic/SKILL.md`

```markdown
---
name: start-epic
description: Start a new Epic with branch creation and task breakdown. Triggers on "start epic", "create epic", "new epic"
allowed-tools: Bash, Read, Write, Edit
---

Epic을 시작합니다.

Epic 제목: $1
우선순위: ${2:-medium}

1. Epic 생성
!.pioneer/scripts/epic-manager.sh create "$1" "${2:-medium}"

2. Epic 파일 읽기 및 Task 분해
Epic을 분석하여 Task로 분해하세요.
```

**사용 예시**:
```
사용자: "User authentication이라는 high 우선순위 Epic 시작해줘"
Claude: start-epic skill 호출 → Epic 생성 → Task 분해
```

### 예시 5: Health Check Skill

**파일**: `.claude/skills/health-check/SKILL.md`

```markdown
---
name: health-check
description: Validate Claude Code structure and configuration. Triggers on "health check", "validate structure", "check configuration"
---

Claude Code Doctor를 호출하여 전체 구조를 검사합니다:

Use the claude-code-doctor subagent to perform a complete health check of .claude and .pioneer directories.

검사 항목:
- 서브에이전트 정의 파일 (YAML 프론트매터)
- Skills 파일 구조
- 메모리 파일 구조
- 워크플로우 문서 완성도

상세 보고서를 생성하고 개선 제안을 제공하세요.
```

**사용 예시**:
```
사용자: "프로젝트 구조 검증해줘"
Claude: health-check skill 호출 → Claude Code Doctor 실행
```

## 모범 사례

### 1. 명확한 Description + Trigger Keywords

```markdown
# ✅ 좋은 예시
---
name: create-pull-request
description: Create a GitHub pull request. Triggers on "create pr", "make pull request", "open pr", "new pr"
---

# ❌ 나쁜 예시
---
name: create-pull-request
description: PR
---
```

### 2. Bash 도구 권한 명시

```markdown
# ✅ 올바름
---
name: build-project
description: Build the project. Triggers on "build", "compile"
allowed-tools: Bash, Read
---

!yarn build

# ❌ 오류 발생
---
name: build-project
description: Build the project
# allowed-tools 생략
---

!yarn build  # Bash 권한 없어 실패
```

### 3. 인자 검증

```markdown
---
name: create-pull-request
description: Create a GitHub pull request. Triggers on "create pr"
allowed-tools: Bash
---

제목: $1
본문: ${2:-No description provided}

!if [ -z "$1" ]; then
!  echo "Error: PR title is required"
!  exit 1
!fi

!gh pr create --title "$1" --body "${2:-No description provided}"
```

### 4. 파일 참조로 중복 제거

```markdown
# Before: 코딩 규칙을 매번 복사
---
name: review-code
description: Review code
---

다음 규칙 확인:
- TypeScript ESM: .js 확장자
- DI 패턴: @singleton()
...

# After: 파일 참조로 단순화
---
name: review-code
description: Review code against coding standards
---

@.pioneer/agents/developer/memory/coding-rules.md

위 규칙에 따라 $ARGUMENTS를 검토하세요.
```

### 5. 복합 워크플로우

```markdown
---
name: full-pipeline
description: Run full build and deploy pipeline. Triggers on "full pipeline", "build and deploy", "deploy"
allowed-tools: Bash, Read
---

!set -e  # 에러 시 중단

echo "1. 타입 체크..."
!yarn type-check

echo "2. 린트..."
!yarn lint

echo "3. 빌드..."
!yarn build

echo "4. 테스트..."
!yarn test

echo "5. 배포..."
!yarn deploy $ARGUMENTS

echo "✅ 파이프라인 완료"
```

## 주의사항

### 보안

```markdown
# ⚠️ 주의: 사용자 입력을 직접 Bash에 전달하지 마세요
---
name: delete-files
allowed-tools: Bash
---

!rm -rf $1  # 위험! 사용자가 "/" 입력 가능

# ✅ 안전: 입력 검증
---
name: delete-files
allowed-tools: Bash
---

!if [[ "$1" =~ ^[a-zA-Z0-9_/-]+$ ]]; then
!  rm -rf "$1"
!else
!  echo "Invalid path"
!fi
```

### 인자 인용

```markdown
# ❌ 공백이 포함된 인자 처리 실패
!gh pr create --title $1

# ✅ 인용으로 공백 처리
!gh pr create --title "$1"
```

### 경로 처리

```markdown
# 상대 경로는 작업 디렉토리 기준
@./CLAUDE.md                    # 현재 디렉토리
@.pioneer/workflow/guide.md     # 현재 디렉토리 기준 상대 경로

# 절대 경로도 사용 가능
@/Users/name/project/file.md
```

## Skills vs Slash Commands 선택 가이드

### Skills 사용 시기

- Claude가 자동으로 감지해야 하는 반복 작업
- 자연어 대화 중 실행되어야 하는 기능
- 예: "PR 만들어줘", "테스트 실행해줘"

**디렉토리 구조**:
```bash
.claude/skills/
├── create-pr/
│   └── SKILL.md
├── run-tests/
│   └── SKILL.md
└── review-code/
    └── SKILL.md
```

### Slash Commands 사용 시기

- 사용자가 명시적으로 호출하는 복잡한 워크플로우
- 다단계 프로세스 (Epic 시작, Health Check 등)
- 예: `/epic "User auth"`, `/health-check`

**디렉토리 구조**:
```bash
.claude/commands/
├── epic.md
├── health-check.md
└── git/
    ├── pr.md
    └── status.md
```

## 디버깅

### Skill이 실행되지 않는 경우

1. **파일 구조 확인**: `{skill-name}/SKILL.md` 형식 필수
2. **YAML 검증**: `name` 필드 필수, `description`에 trigger keywords 포함
3. **도구 권한**: `allowed-tools`에 Bash 포함 여부

### YAML 파싱 오류

```bash
# YAML 구문 검증
sed -n '/^---$/,/^---$/p' .claude/skills/create-pr/SKILL.md | yq eval -
```

### Bash 실행 오류

```markdown
# 디버깅: set -x 사용
!set -x  # 명령어 출력
!yarn build
!set +x
```

## 참고 문서

- [Claude Code Skills 공식 문서](https://docs.claude.com/en/docs/claude-code/skills)
- [Claude Code 문서 맵](https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md)
