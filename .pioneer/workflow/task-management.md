# Task 관리 시스템

> 로컬 파일 기반 Task 관리 시스템

**버전**: PDK 2.2.0 | **업데이트**: 2025-10-30

---

## 개요

Pioneer는 **GitHub Issues 대신 로컬 파일 기반 Task 관리**를 사용합니다.

**핵심 특징**:
- **1 Epic = 1 Branch** (Story 계층 없음)
- **로컬 파일**: 빠른 읽기/쓰기, 오프라인 작업
- **UUID 기반 ID**: 충돌 없는 Epic/Task ID
- **Git 통합**: Task 파일도 버전 관리

---

## 구조

### Epic & Task ID

```
EPIC-{7자리 UUID}  예: EPIC-a3f9c2d
TASK-{7자리 UUID}  예: TASK-b3f9c2d
```

**UUID 장점**: 동시 생성 시 충돌 없음, 분산 환경 지원

### 디렉터리

```
.pioneer/
├── epics/EPIC-{id}/
│   ├── epic.md
│   └── tasks/TASK-{id}.md
└── scripts/
    ├── epic-manager.sh
    └── task-manager.sh
```

---

## Epic 파일 구조

Epic 파일은 `.pioneer/epics/EPIC-{id}/epic.md` 경로에 위치하며, 다음 frontmatter를 포함합니다:

```yaml
---
id: EPIC-2c83b63
title: 사용자 알림 서비스
type: epic
status: TODO | IN_PROGRESS | IN_REVIEW | DONE | BLOCKED
priority: low | medium | high | critical
created: 2025-10-29T07:21:37Z
updated: 2025-10-29T09:10:00Z
branch: "feature/EPIC-2c83b63"  # Scrum Master가 브랜치 생성 시 추가
pr_url: "https://github.com/.../pull/28"              # PR 생성 시 추가 (선택)
---
```

**필수 필드**:
- `id`, `title`, `type`, `status`, `priority`, `created`, `updated`

**선택 필드**:
- `branch`: Scrum Master가 Epic 브랜치 생성 시 자동 추가
- `pr_url`: PR 생성 후 수동 또는 자동 추가

### Epic 상태 전환 규칙

| 상태 | 의미 | 전환 시점 | 방법 | 담당 |
|------|------|----------|------|------|
| `TODO` | Epic 생성됨, 작업 미시작 | Epic 생성 | 자동 | epic-manager.sh create |
| `IN_PROGRESS` | Task 진행 중 | 첫 번째 Task가 TODO 이외의 상태로 전환 시 | 자동 | task-manager.sh update |
| `IN_REVIEW` | 모든 Task 완료, PR 대기/리뷰 중 | 모든 유효 Task가 DONE이 된 시점 | 자동 | task-manager.sh complete |
| `DONE` | Epic 완료, PR 병합됨 | PR 병합 후 | 수동 | epic-manager.sh complete |
| `BLOCKED` | Epic 진행 불가 | 심각한 문제 발생 | 수동 | epic-manager.sh block |

**자동 전환 (task-manager.sh의 check_and_update_epic_status 함수)**:
- TODO → IN_PROGRESS: 첫 Task 시작 시
- IN_PROGRESS → IN_REVIEW: 모든 Task (CANCELLED 제외) 완료 시

**수동 전환 (Scrum Master 판단 필요)**:
- IN_REVIEW → DONE: PR 병합 완료 후
- 임의 상태 → BLOCKED: 치명적 문제로 Epic 진행 불가 시

---

## Task 파일 구조

### YAML Frontmatter

| 필드 | 설명 | 예시 |
|------|------|------|
| `id` | Task ID | TASK-abc1234 |
| `title` | Task 제목 | "로그인 API 구현" |
| `task_type` | 작업 타입 | feat, fix, test, docs |
| `status` | 상태 | TODO, IN_PROGRESS, READY_FOR_TEST, TESTING, READY_FOR_COMMIT, BLOCKED, CANCELLED, DONE |
| `priority` | 우선순위 | low, medium, high, critical |
| `epic` | 소속 Epic | EPIC-xyz7890 |

### Task 상태 정의

| 상태 | 의미 | 다음 상태 | 담당 |
|------|------|----------|------|
| `TODO` | 작업 대기 중 | IN_PROGRESS | Scrum Master |
| `IN_PROGRESS` | 구현 진행 중 | READY_FOR_TEST, BLOCKED | Developer |
| `READY_FOR_TEST` | 테스트 작성 대기 | TESTING | Developer → Test Engineer |
| `TESTING` | 테스트 작성 중 | READY_FOR_COMMIT, IN_PROGRESS, BLOCKED | Test Engineer |
| `READY_FOR_COMMIT` | 커밋 대기 | DONE | Test Engineer → Scrum Master |
| `BLOCKED` | 차단됨 (구현 불가) | IN_PROGRESS, CANCELLED | Developer/Test Engineer → Scrum Master |
| `CANCELLED` | 취소됨 (더 이상 불필요) | - | Scrum Master |
| `DONE` | 완료 | - | Scrum Master |

**상세**: [task-types.md](task-types.md) 참조

### 주요 섹션

```markdown
## Description
[Task의 목적과 범위]

## Requirements
- [ ] 요구사항 1
- [ ] 요구사항 2

## Tech Spec
[Developer가 작성]

## Work Log
### YYYY-MM-DD HH:MM - {agent}
- 작업 내용

## Status History
| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-29 14:58 | TODO | scrum-master | Task created |

## Checklist
- [ ] Tech spec written
- [ ] Code implemented
...
```

### Status History 업데이트 방법

**필수**: `task-manager.sh` 스크립트만 사용하세요.

```bash
.pioneer/scripts/task-manager.sh update TASK-{id} <status> <assignee> "note"
```

**예시**:
```bash
# Developer가 구현 완료 시
.pioneer/scripts/task-manager.sh update TASK-abc1234 READY_FOR_TEST test-engineer "구현 완료, 테스트 대기"

# Test Engineer가 테스트 완료 시
.pioneer/scripts/task-manager.sh update TASK-abc1234 READY_FOR_COMMIT scrum-master "테스트 완료, 커밋 대기"
```

**❌ 절대 금지**: 수동으로 Status History 테이블 편집
- 테이블 파싱 오류 위험
- 날짜 형식 불일치 가능
- 스크립트가 자동으로 올바른 위치에 삽입함

**스크립트 동작**:
- Status History 테이블의 마지막 행 다음에 자동 삽입
- Timestamp 자동 생성 (UTC 기준)
- Task frontmatter (status, assignee, updated) 동시 업데이트

---

## CLI 사용법

### Epic 관리

```bash
# Epic 생성
.pioneer/scripts/epic-manager.sh create "사용자 인증" high

# Epic 조회
.pioneer/scripts/epic-manager.sh show EPIC-abc1234

# Epic 완료
.pioneer/scripts/epic-manager.sh complete EPIC-abc1234
```

### Task 관리

```bash
# Task 생성
.pioneer/scripts/task-manager.sh create "로그인 API" high EPIC-abc1234 feat

# Task 상태 업데이트
.pioneer/scripts/task-manager.sh update TASK-def5678 IN_PROGRESS developer "작업 시작"

# Task 완료
.pioneer/scripts/task-manager.sh complete TASK-def5678
```

---

## 워크플로우

**전체 흐름**:
```
Epic 생성 → Task 분해 → 각 Task 작업 → Epic 완료
```

**상세 워크플로우**:
- [Scrum Master Guide](scrum-master-guide.md) - Epic 분해
- [Task 상태 워크플로우](task-status-workflow.md) - 에이전트별 책임
- [Task 타입](task-types.md) - 타입별 작업 범위

---

## Task 상태 흐름

### 정상 흐름

**일반 Task (feat/fix/refactor/chore)**:
```
TODO → IN_PROGRESS → READY_FOR_TEST →
TESTING → READY_FOR_COMMIT → DONE
```

**Test 전용 Task** (상세: [task-status-workflow.md](task-status-workflow.md#test-전용-task-task_type-test)):
```
TODO → TESTING → READY_FOR_COMMIT → DONE
```

**Docs Task**:
```
TODO → IN_PROGRESS → READY_FOR_COMMIT → DONE
```

### 예외 흐름

**차단 상황**:
```
IN_PROGRESS → BLOCKED → IN_PROGRESS (문제 해결 후)
             ↓
        CANCELLED (해결 불가 시)

TESTING → BLOCKED → TESTING (문제 해결 후)
         ↓
    IN_PROGRESS (구현 재작업 필요)
```

**버그 발견 시 (Test Engineer)**:
```
TESTING → IN_PROGRESS (Developer 재작업)
```

**취소**:
```
TODO → CANCELLED
IN_PROGRESS → CANCELLED
BLOCKED → CANCELLED
```

**상세**: [task-status-workflow.md](task-status-workflow.md)

---

## 참고 문서

- [Scrum Master Guide](scrum-master-guide.md) - Epic 분해, Task 생성
- [Task 상태 워크플로우](task-status-workflow.md) - 상태 관리, 에이전트 책임
- [Task 타입](task-types.md) - feat, fix, test, docs 등
- Git 브랜치 규칙 - 1 Epic = 1 Branch 원칙 (CLAUDE.md 참조)
- 커밋 규칙 - Task 완료 시점 커밋 (task-status-workflow.md 참조)

---

## FAQ

### Q1. GitHub Issues vs Pioneer Tasks?
**A**: Pioneer는 로컬 파일 기반으로 빠르고, 오프라인 작업 가능, LLM 친화적입니다.

### Q2. Task별 브랜치를 만들지 않나요?
**A**: 아니요. **1 Epic = 1 Branch** 원칙으로 Epic 브랜치에 모든 Task가 커밋됩니다.

### Q3. Task ID가 충돌하지 않나요?
**A**: UUID 기반이라 동시에 여러 Task를 생성해도 충돌하지 않습니다.

### Q4. Epic이 없으면 Task를 만들 수 없나요?
**A**: 네. **모든 Task는 Epic에 속해야 합니다**. Epic 없이 Task 생성은 금지입니다.

---

**버전**: PDK 2.2.0 | **업데이트**: 2025-10-30

<details>
<summary>버전 히스토리</summary>

- **2.1** (2025-10-29): Claude = Scrum Master, 문서 구조 개선
- **2.0** (2025-10-29): Epic=Branch 원칙, Story 계층 제거
- **1.0** (2025-01-29): 초기 버전

</details>
