# 서브에이전트 구조 및 작성 규칙

> 참고: https://docs.claude.com/en/docs/claude-code/sub-agents.md

## 기본 구조

서브에이전트는 **Markdown 파일 + YAML 프론트매터** 형식으로 정의됩니다.

```markdown
---
name: agent-name
description: 에이전트의 목적과 호출 시점 설명
tools: tool1, tool2, tool3
model: sonnet
---

# Agent Name

시스템 프롬프트 내용
```

## YAML 프론트매터 필드

### 필수 필드

#### `name` (필수)
- **형식**: 소문자 + 하이픈 (`-`)만 사용
- **규칙**: 영문자로 시작, 숫자 사용 가능
- **예시**:
  ```yaml
  name: code-reviewer          # ✅ 올바름
  name: test-runner-v2         # ✅ 올바름
  name: Code-Reviewer          # ❌ 대문자 사용 불가
  name: code_reviewer          # ❌ 언더스코어 불가
  name: code reviewer          # ❌ 공백 불가
  ```

#### `description` (필수)
- **목적**: 에이전트 자동 위임 시 매칭 기준
- **작성법**: 호출 시점과 역할을 자연어로 명확히 기술
- **팁**: "PROACTIVELY 사용", "반드시 호출" 등의 구문 포함 시 자동 위임 확률 증가
- **예시**:
  ```yaml
  # ✅ 좋은 예시
  description: 코드 작성 완료 후 PROACTIVELY 호출하여 코드 품질을 검토하고 개선 제안을 제공합니다.

  # ✅ 좋은 예시
  description: Task 요구사항을 기반으로 설계하고 실제 코드를 구현하며 빌드를 검증합니다. Scrum Master가 Task를 생성한 후 호출하세요.

  # ⚠️ 개선 필요
  description: 코드 리뷰를 합니다.  # 너무 간단, 호출 시점 불명확
  ```

### 선택 필드

#### `tools` (선택)
- **기본값**: 생략 시 메인 스레드의 모든 도구 상속 (보안 위험)
- **권장**: 필요한 도구만 명시적으로 나열 (보안 강화)
- **형식**: 쉼표로 구분된 도구 목록

**사용 가능한 도구**:
```yaml
tools: Read, Write, Edit, Bash, Glob, Grep, TodoWrite, Task, WebFetch, WebSearch, AskUserQuestion
```

**예시**:
```yaml
# 읽기 전용 에이전트
tools: Read, Glob, Grep

# 코드 작성 에이전트
tools: Read, Write, Edit, Bash, Glob, Grep

# 분석 전용 에이전트
tools: Read, Grep, WebFetch

# 모든 도구 사용 (기본값, 명시적 선언 불필요)
# tools: (생략)
```

#### `model` (선택)
- **기본값**: `inherit` (부모 세션의 모델 상속)
- **옵션**: `sonnet`, `opus`, `haiku`, `inherit`
- **선택 가이드**:
  - `haiku`: 빠른 응답이 필요한 단순 작업 (비용 최소화)
  - `sonnet`: 일반적인 작업 (기본값, 균형잡힌 성능)
  - `opus`: 복잡한 분석 및 추론이 필요한 작업 (최고 성능)

**예시**:
```yaml
# 빠른 테스트 실행
model: haiku

# 일반 작업 (기본값 상속)
model: inherit

# 복잡한 아키텍처 설계
model: opus
```

## 저장 위치 및 우선순위

| 유형 | 경로 | 범위 | 우선순위 | 버전 관리 |
|------|------|------|---------|----------|
| **프로젝트 에이전트** | `.claude/agents/` | 현재 프로젝트 | **최상위** | ✅ 권장 |
| **사용자 에이전트** | `~/.claude/agents/` | 모든 프로젝트 | 중간 | ❌ 개인용 |
| **CLI 정의 에이전트** | (동적 생성) | 현재 세션 | 하위 | N/A |

**권장 사항**:
- 프로젝트별 에이전트는 `.claude/agents/`에 저장하여 팀과 공유
- 개인 워크플로우 에이전트는 `~/.claude/agents/`에 저장
- 프로젝트 에이전트를 Git에 포함하여 팀 전체가 동일한 워크플로우 사용

## 프롬프트 작성 가이드

### 구조 템플릿

```markdown
# {Agent Name}

당신은 **{Agent Name}** 역할을 수행하는 AI 에이전트입니다.

## 작업 시작 전 필수 단계

**1단계**: Workflow 문서 읽기
```
.pioneer/agents/{agent-name}/workflow.md
```

**2단계**: Memory 폴더의 모든 문서 확인
```bash
.pioneer/agents/{agent-name}/memory/*.md
```

## 핵심 역할

{1-2문장으로 역할 요약}

## 작업 프로세스

### 1. {첫 번째 단계}

{상세 설명}

### 2. {두 번째 단계}

{상세 설명}

## 중요 규칙

1. {규칙 1}
2. {규칙 2}

## 제약사항

- ❌ {금지 사항 1}
- ❌ {금지 사항 2}
- ✅ {권장 사항}

## 출력 형식

{작업 완료 후 출력 형식}

## 참고 문서

{관련 문서 링크}
```

### 작성 원칙

1. **명확한 역할 정의**: 무엇을 하는 에이전트인지 한 문장으로 요약
2. **단계별 프로세스**: 작업을 순차적 단계로 분해하여 설명
3. **구체적인 예시**: 코드 예시, 명령어 예시 포함
4. **명시적 제약**: 금지 사항과 권장 사항 명확히 구분
5. **출력 형식 지정**: 일관된 결과물을 위한 템플릿 제공

## 자동 위임 vs 명시적 호출

### 자동 위임 (Auto-delegation)

Claude Code가 자동으로 적절한 에이전트를 선택하여 호출합니다.

**동작 원리**:
- 작업 설명 분석
- `description` 필드와 매칭
- 현재 문맥 고려

**최적화 팁**:
```yaml
# ✅ 자동 위임 확률 높임
description: 코드 작성 완료 후 PROACTIVELY 호출하여 코드 품질을 검토합니다.

# ✅ 자동 위임 확률 높임
description: Epic 시작 시 반드시 호출하여 브랜치를 생성합니다.

# ⚠️ 자동 위임 확률 낮음
description: 코드 리뷰를 합니다.
```

### 명시적 호출 (Explicit invocation)

사용자가 직접 에이전트를 지정하여 호출합니다.

**호출 방법**:
```
> Use the code-reviewer subagent to check my recent changes
> Have the debugger subagent investigate this error
```

## 에이전트 관리

### CLI 명령어

```bash
# 사용 가능한 에이전트 목록 확인
/agents

# 새 에이전트 생성 (대화형)
/agents
> Create new agent

# 기존 에이전트 편집
/agents
> Edit agent: {agent-name}
```

### 도구 권한 변경

```markdown
# 전: 모든 도구 접근 가능
---
name: my-agent
description: ...
---

# 후: 필요한 도구만 접근
---
name: my-agent
description: ...
tools: Read, Grep  # 읽기 전용으로 제한
---
```

## 모범 사례

### 1. 단일 책임 원칙

각 에이전트는 하나의 명확한 책임만 가져야 합니다.

```yaml
# ✅ 좋은 예시
name: code-reviewer
description: 코드 품질 검토 전담

name: test-runner
description: 테스트 실행 전담

# ❌ 나쁜 예시
name: code-helper
description: 코드 작성, 리뷰, 테스트, 배포 등 모든 작업 수행
```

### 2. 상세한 프롬프트

```markdown
# ✅ 좋은 예시
## 작업 프로세스

### 1. Task 파일 읽기
`.pioneer/epics/EPIC-{id}/tasks/TASK-{id}.md` 파일을 Read 도구로 읽습니다.

### 2. Tech Spec 작성
다음 템플릿으로 Tech Spec 섹션을 Edit 도구로 작성합니다:
```markdown
## Tech Spec
...
```

# ❌ 나쁜 예시
작업을 수행합니다.
```

### 3. 필요한 도구만 제한

```yaml
# ✅ 보안 강화
name: log-analyzer
tools: Read, Grep  # 읽기 전용

# ⚠️ 보안 위험
name: log-analyzer
# tools 생략 - 모든 도구 접근 가능 (Write, Bash 등)
```

### 4. 적절한 모델 선택

```yaml
# 단순 작업 - haiku (빠름, 저렴)
name: test-runner
model: haiku

# 일반 작업 - inherit (기본값)
name: developer
model: inherit

# 복잡한 작업 - opus (느림, 비쌈, 고품질)
name: architect
model: opus
```

### 5. 프로젝트 에이전트를 버전 관리에 포함

```bash
# .gitignore
# ❌ 에이전트를 제외하지 마세요
# .claude/

# ✅ 에이전트를 포함하세요 (팀 공유)
git add .claude/agents/
git commit -m "Add custom agents for project workflow"
```

## 실전 예시

### 예시 1: 코드 리뷰어

```markdown
---
name: code-reviewer
description: 코드 작성 완료 후 PROACTIVELY 호출하여 코드 품질, 보안, 성능을 검토하고 개선 제안을 제공합니다.
tools: Read, Glob, Grep
model: inherit
---

# Code Reviewer

당신은 **Code Reviewer** 역할을 수행하는 AI 에이전트입니다.

## 핵심 역할

최근 작성된 코드를 분석하여 품질, 보안, 성능 측면에서 검토하고 구체적인 개선 제안을 제공합니다.

## 작업 프로세스

### 1. 최근 변경 파일 확인

```bash
git diff --name-only HEAD~1 HEAD
```

### 2. 코드 검토 항목

- **코드 품질**: 가독성, 유지보수성, 일관성
- **보안**: SQL Injection, XSS, 인증/인가
- **성능**: N+1 쿼리, 메모리 누수, 불필요한 연산
- **타입 안전성**: `any` 사용, 타입 가드

### 3. 검토 보고서 작성

{상세 템플릿}

## 제약사항

- ❌ 코드 수정 금지 (제안만 제공)
- ❌ Git 커밋 금지
- ✅ 구체적인 개선 방안 제시
```

### 예시 2: 테스트 러너

```markdown
---
name: test-runner
description: 테스트 실행 및 결과 분석을 전담합니다. 코드 변경 후 자동으로 호출하여 테스트를 실행하세요.
tools: Bash, Read, Grep
model: haiku
---

# Test Runner

당신은 **Test Runner** 역할을 수행하는 AI 에이전트입니다.

## 핵심 역할

테스트를 실행하고 결과를 분석하여 실패 원인을 파악합니다.

## 작업 프로세스

### 1. 테스트 실행

```bash
yarn test
```

### 2. 결과 분석

- 성공: 통과한 테스트 개수 보고
- 실패: 실패 원인 상세 분석

## 제약사항

- ❌ 테스트 코드 수정 금지
- ❌ Git 커밋 금지
- ✅ 실패 원인 분석 및 보고
```

## 디버깅

### 에이전트가 호출되지 않는 경우

1. **Description 개선**: 호출 시점을 더 명확히 기술
2. **명시적 호출**: `Use the {agent-name} subagent to ...` 사용
3. **YAML 검증**: 프론트매터 형식 확인

### YAML 파싱 오류

```bash
# YAML 구문 검증 (yq 설치 필요)
sed -n '/^---$/,/^---$/p' .claude/agents/my-agent.md | yq eval -
```

### 도구 접근 오류

```yaml
# 도구를 명시적으로 추가
---
name: my-agent
tools: Read, Write, Bash  # Bash를 추가
---
```

## 참고 문서

- [Claude Code Sub-agents 공식 문서](https://docs.claude.com/en/docs/claude-code/sub-agents.md)
- [Claude Code 문서 맵](https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md)
