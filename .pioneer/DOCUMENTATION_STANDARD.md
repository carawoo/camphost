# Pioneer 문서 표준

> Pioneer 시스템 문서 작성 가이드

---

## 문서 구조

### 1. Workflow 문서 (`.pioneer/workflow/`)

**목적**: Claude (Scrum Master)가 참조하는 전체 워크플로우

**구조**:
```markdown
# {문서 제목}

> {한 줄 설명}

---

## {섹션 1}
...

## {섹션 2}
...

---

## 참고 문서

- [관련 문서 1](링크)
- [관련 문서 2](링크)
```

**파일**:
- `scrum-master-guide.md` - Epic 분해, Task 생성
- `task-management.md` - Task 시스템 개요
- `task-status-workflow.md` - 상태 관리, 에이전트 책임
- `task-types.md` - Task type 정의

### 2. Agent Workflow (`.pioneer/agents/{agent}/workflow.md`)

**목적**: Agent가 실행 시 참조하는 작업 프로세스

**구조** (YAML frontmatter 필수):
```markdown
---
name: {agent-name}
description: {한 줄 설명}
tools: {도구 목록}
model: inherit
---

# {Agent Name} Agent

당신은 **{Agent Name}** 역할을 수행하는 AI 에이전트입니다.

## 핵심 역할

{역할 설명}

## 작업 프로세스

### 1. {단계명}
...

## 중요 규칙

1. **규칙 1**
2. **규칙 2**

## 출력 형식

```
{출력 예시}
```

## 참고 문서

- `memory/{문서}.md` - {설명}

## 주의사항

- **주의 1**
- **주의 2**
```

**파일**:
- `.pioneer/agents/developer/workflow.md`
- `.pioneer/agents/test-engineer/workflow.md`
- `.pioneer/agents/claude-code-doctor/workflow.md`

### 3. Agent Memory (`.pioneer/agents/{agent}/memory/*.md`)

**목적**: Agent의 기술적 지식/규칙

**구조**:
```markdown
# {주제}

> {한 줄 설명}

## {섹션 1}

### {하위 섹션}
...

## 예시

```{언어}
{코드 예시}
```

## 체크리스트

- [ ] 항목 1
- [ ] 항목 2
```

**파일 예**:
- `typescript-esm.md` - TypeScript ESM import 규칙
- `dependency-injection.md` - DI 패턴 사용법
- `epic-branch-rule.md` - Git 브랜치 규칙

---

## 작성 규칙

### 1. 제목

- **Level 1 (`#`)**: 파일 제목 (1개만)
- **Level 2 (`##`)**: 주요 섹션
- **Level 3 (`###`)**: 하위 섹션
- Level 4 이하는 최소화

### 2. 용어 통일

| 올바른 표현 | 잘못된 표현 |
|------------|-----------|
| `READY_FOR_COMMIT` | ~~READY_FOR_TEST~~ |
| `{task_type}/EPIC-{id}` | ~~feature/EPIC-{id}-{slug}~~ |
| Claude (Scrum Master) | ~~Scrum Master agent~~ |
| Developer | ~~Developer agent~~ (agent 생략) |
| Epic 분해 | ~~Epic 분석~~ (둘 다 사용 가능하나 통일) |

### 3. 상태 이름

**Task 상태** (정확히 사용):
- `TODO`
- `IN_PROGRESS`
- `READY_FOR_TEST`
- `TESTING`
- `READY_FOR_COMMIT`
- `BLOCKED`
- `CANCELLED`
- `DONE`

**Epic 상태**:
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW` (PR 대기)
- `DONE`
- `BLOCKED` (특수)

### 4. 경로 표기

**절대 경로** (프로젝트 루트 기준):
```markdown
`.pioneer/epics/EPIC-{id}/epic.md`
`.claude/agents/developer.md`
```

**상대 경로** (같은 디렉터리 또는 하위):
```markdown
[Task 타입](task-types.md)
[DI 패턴](memory/dependency-injection.md)
```

### 5. 코드 블록

**명령어**:
```bash
.pioneer/scripts/epic-manager.sh create "제목" high
```

**설정/파일**:
```markdown
## Description
[설명]
```

**TypeScript**:
```typescript
import { injectable } from 'tsyringe';
```

### 6. 강조

- **굵게**: 중요 용어, 규칙
- `코드`: 명령어, 파일명, 변수명
- *기울임*: 사용 최소화

### 7. 목록

**순서 있음** (프로세스):
```markdown
1. 첫 번째 단계
2. 두 번째 단계
```

**순서 없음** (항목):
```markdown
- 항목 1
- 항목 2
```

**체크리스트**:
```markdown
- [ ] 미완료
- [x] 완료
```

### 8. 구분선

섹션 간 구분:
```markdown
---
```

---

## 문서 간 관계

### 참조 체인

```
CLAUDE.md (진입점)
  ↓
.pioneer/workflow/ (전체 워크플로우)
  ↓
.pioneer/agents/{agent}/workflow.md (Agent 작업 프로세스)
  ↓
.pioneer/agents/{agent}/memory/*.md (기술적 상세)
```

### 순환 참조 금지

❌ **잘못된 예**:
```
task-management.md → task-types.md → task-management.md
```

✅ **올바른 예**:
```
task-management.md → task-types.md (단방향)
```

---

## 체크리스트

문서 작성 시:
- [ ] 제목이 명확한가?
- [ ] 한 줄 설명이 있는가?
- [ ] 섹션 구조가 일관적인가?
- [ ] 용어가 통일되었는가?
- [ ] 경로가 정확한가?
- [ ] 순환 참조가 없는가?
- [ ] 예시가 충분한가?
- [ ] 참고 문서 링크가 있는가?

문서 업데이트 시:
- [ ] 관련 문서도 함께 업데이트했는가?
- [ ] 깨진 링크가 없는가?
- [ ] 모순된 내용이 없는가?

---

## 버전 관리

**문서 버전 표기** (선택):
```markdown
**버전**: 2.1 | **업데이트**: 2025-10-29
```

**변경 이력** (주요 변경만):
```markdown
## 변경 이력

- **2.1** (2025-10-29): Claude = Scrum Master
- **2.0** (2025-10-29): Epic=Branch 원칙
```
