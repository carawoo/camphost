# 슬래시 커맨드 작성법

> 참고: https://docs.claude.com/en/docs/claude-code/slash-commands.md

## 개요

슬래시 커맨드는 마크다운 파일로 작성되며, `/<command-name> [arguments]` 구문으로 호출됩니다.

## 기본 구조

```markdown
---
description: 커맨드 설명 (선택)
allowed-tools: tool1, tool2 (선택)
---

커맨드 실행 시 Claude에게 지시할 내용
```

## 저장 위치

| 유형 | 경로 | 범위 | 버전 관리 |
|------|------|------|----------|
| **프로젝트 커맨드** | `.claude/commands/` | 현재 프로젝트 (팀 공유) | ✅ 권장 |
| **개인 커맨드** | `~/.claude/commands/` | 모든 프로젝트 (개인용) | ❌ |

**권장 사항**:
- 프로젝트별 워크플로우 커맨드는 `.claude/commands/`에 저장
- 개인 유틸리티 커맨드는 `~/.claude/commands/`에 저장

## YAML 프론트매터

### `description` (선택, 권장)

커맨드 목적을 간단히 설명합니다. `/help` 출력에 표시됩니다.

```markdown
---
description: 코드 성능 최적화 제안 생성
---
```

### `allowed-tools` (선택)

커맨드가 사용할 수 있는 도구를 제한합니다. **Bash 실행 시 필수**입니다.

```markdown
---
description: Git PR 생성
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
description: 파일 검색 및 분석
---

다음 키워드를 코드베이스에서 검색하고 분석하세요: $ARGUMENTS
```

**호출 예시**:
```
/search authentication security
```

**확장 결과**:
```
다음 키워드를 코드베이스에서 검색하고 분석하세요: authentication security
```

### 특정 인자 접근: `$1`, `$2`, ...

```markdown
---
description: PR 생성
allowed-tools: Bash, Read
---

!gh pr create --title "$1" --body "$2"
```

**호출 예시**:
```
/pr "Add feature" "This PR adds a new feature"
```

**확장 결과**:
```bash
gh pr create --title "Add feature" --body "This PR adds a new feature"
```

### 인자가 없는 경우 처리

```markdown
---
description: 테스트 실행
allowed-tools: Bash
---

테스트를 실행합니다.

인자가 제공된 경우: $ARGUMENTS
인자가 없는 경우: 전체 테스트 실행

!yarn test $ARGUMENTS
```

**호출 예시**:
```
/test                 # 전체 테스트
/test src/utils       # 특정 경로만
```

## Bash 실행: `!` 접두사

`!`로 시작하는 줄은 Bash 명령어로 실행됩니다.

**중요**: `allowed-tools`에 `Bash`를 반드시 포함해야 합니다.

```markdown
---
description: Git 상태 확인
allowed-tools: Bash
---

!git status
!git diff --stat
```

**호출 예시**:
```
/git-status
```

### 복잡한 Bash 스크립트

```markdown
---
description: 빌드 및 테스트 실행
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

`@` 접두사로 파일 내용을 커맨드에 포함할 수 있습니다.

```markdown
---
description: 코딩 규칙 검토
---

다음 파일을 읽고 코딩 규칙을 준수하는지 검토하세요:

@.pioneer/agents/developer/memory/coding-rules.md

검토 대상 파일: $ARGUMENTS
```

**호출 예시**:
```
/review src/services/email.service.ts
```

**확장 결과**:
```
다음 파일을 읽고 코딩 규칙을 준수하는지 검토하세요:

[coding-rules.md 파일 내용]

검토 대상 파일: src/services/email.service.ts
```

## 네임스페이싱

하위 디렉토리로 커맨드를 구성할 수 있습니다.

```bash
.claude/commands/
├── git/
│   ├── pr.md          # /git/pr
│   ├── review.md      # /git/review
│   └── status.md      # /git/status
└── test/
    ├── coverage.md    # /test/coverage
    └── unit.md        # /test/unit
```

**호출 예시**:
```
/git/pr "Add feature"
/test/coverage
```

**참고**: 네임스페이싱은 커맨드명이 아닌 **description에만 영향**을 줍니다.

## 실전 예시

### 예시 1: 간단한 유틸리티 커맨드

**파일**: `.claude/commands/optimize.md`

```markdown
---
description: 코드 성능 최적화 제안 생성
---

코드 성능 최적화 제안:

1. 최근 수정된 파일 분석
2. 성능 병목 지점 파악
3. 구체적인 최적화 방안 제시

대상 파일: $ARGUMENTS
```

**호출**:
```
/optimize src/services/*.ts
```

### 예시 2: Git PR 생성

**파일**: `.claude/commands/git/pr.md`

```markdown
---
description: Git PR 생성
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

**호출**:
```
/git/pr "Add email service" "Implements email sending functionality"
```

### 예시 3: 테스트 커버리지 보고서

**파일**: `.claude/commands/test/coverage.md`

```markdown
---
description: 테스트 커버리지 보고서 생성
allowed-tools: Bash, Read
---

테스트 커버리지를 측정하고 보고서를 생성합니다.

!yarn test:coverage

커버리지 보고서를 읽고 개선이 필요한 파일을 찾으세요:
@coverage/lcov-report/index.html

분석 대상: $ARGUMENTS
```

**호출**:
```
/test/coverage
/test/coverage packages/core
```

### 예시 4: 코딩 규칙 검토

**파일**: `.claude/commands/review.md`

```markdown
---
description: 코딩 규칙 준수 여부 검토
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

**호출**:
```
/review src/services/email.service.ts
```

### 예시 5: Epic 시작

**파일**: `.claude/commands/epic.md`

```markdown
---
description: Epic 시작 (브랜치 생성 및 Task 분해)
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

**호출**:
```
/epic "User authentication" high
/epic "Email notifications"  # 기본 우선순위: medium
```

### 예시 6: Health Check

**파일**: `.claude/commands/health-check.md`

```markdown
---
description: Claude Code 구조 검증
---

Claude Code Doctor를 호출하여 전체 구조를 검사합니다:

Use the claude-code-doctor subagent to perform a complete health check of .claude and .pioneer directories.

검사 항목:
- 서브에이전트 정의 파일 (YAML 프론트매터)
- 슬래시 커맨드 파일
- 메모리 파일 구조
- 워크플로우 문서 완성도

상세 보고서를 생성하고 개선 제안을 제공하세요.
```

**호출**:
```
/health-check
```

## 모범 사례

### 1. 명확한 Description

```markdown
# ✅ 좋은 예시
---
description: Git PR 생성 및 리뷰 요청
---

# ❌ 나쁜 예시
---
description: PR
---
```

### 2. Bash 도구 권한 명시

```markdown
# ✅ 올바름
---
allowed-tools: Bash, Read
---

!yarn build

# ❌ 오류 발생
---
# allowed-tools 생략
---

!yarn build  # Bash 권한 없어 실패
```

### 3. 인자 검증

```markdown
---
description: PR 생성
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
description: 코드 리뷰
---

다음 규칙 확인:
- TypeScript ESM: .js 확장자
- DI 패턴: @singleton()
...

# After: 파일 참조로 단순화
---
description: 코드 리뷰
---

@.pioneer/agents/developer/memory/coding-rules.md

위 규칙에 따라 $ARGUMENTS를 검토하세요.
```

### 5. 복합 워크플로우

```markdown
---
description: 전체 빌드 및 배포 파이프라인
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
allowed-tools: Bash
---

!rm -rf $1  # 위험! 사용자가 "/" 입력 가능

# ✅ 안전: 입력 검증
---
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

## 디버깅

### 커맨드가 실행되지 않는 경우

1. **파일명 확인**: `.md` 확장자 필수
2. **YAML 검증**: 프론트매터 형식 확인
3. **도구 권한**: `allowed-tools`에 Bash 포함 여부

### YAML 파싱 오류

```bash
# YAML 구문 검증
sed -n '/^---$/,/^---$/p' .claude/commands/my-command.md | yq eval -
```

### Bash 실행 오류

```markdown
# 디버깅: set -x 사용
!set -x  # 명령어 출력
!yarn build
!set +x
```

## 참고 문서

- [Claude Code Slash Commands 공식 문서](https://docs.claude.com/en/docs/claude-code/slash-commands.md)
- [Claude Code 문서 맵](https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md)
