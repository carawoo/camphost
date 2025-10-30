---
id: TASK-1ee0156
title: DSL 시스템 문서화
type: task
task_type: docs
status: DONE
priority: low
created: 2025-10-30T04:49:08Z
updated: 2025-10-30T05:10:10Z
assignee: system
epic: EPIC-d492109
dependencies: []
---

# TASK-1ee0156: DSL 시스템 문서화

## Description

Service DSL 스펙 문서를 작성합니다. 코드 생성기 구현은 나중에 하고, 먼저 DSL 문법과 각 도메인 패키지별 예시를 문서로 작성합니다.

사용자가 제시한 NotificationService DSL 예시를 기반으로:
- DSL 문법 정의
- 각 패키지별 Service DSL 예시 작성
- 향후 Scrum Master 워크플로우 연동 방향 제시

## Requirements

- [ ] **DSL 문법 스펙 문서 작성** (`docs/DSL_SPEC.md` 또는 `.pioneer/dsl/`)
  - `service` 블록: 이름, 버전
  - `providers` 블록: provider 타입 및 인스턴스 정의
  - `state` 블록: 변수명, 타입, 초기값
  - `method` 블록: in (params), out (result), preconditions, effects
  - `preconditions`: require, validate 문법
  - `effects`: log, call provider, state update, return 문법
  - 타입 시스템: email, phone, string, number, boolean, object, array
  - 주석 지원 여부

- [ ] **NotificationService DSL 예시** (`docs/examples/notification.service.dsl`)
  - 사용자가 제시한 DSL 그대로 작성
  - sendEmail, sendSms, sendPush, sendKakao
  - getNotificationCount, resetNotificationCount

- [ ] **각 도메인 패키지별 DSL 예시 작성**
  - `packages/sample-domain/src/user/` → `user.service.dsl` 예시
  - `packages/sample-domain/src/notification/` → `notification.service.dsl` 예시
  - 각 예시는 해당 도메인의 실제 비즈니스 로직 반영

- [ ] **향후 계획 문서** (Phase 2)
  - Scrum Master와의 워크플로우 연동 방향
  - DSL → TypeScript 코드 생성 자동화 방향
  - DSL 파일 변경 감지 및 Claude와의 싱크 방법

- [ ] 의존성: 없음 (문서 작성만 진행)

## Tech Spec

### 설계 개요
- DSL 시스템 문서화 작업
- 문서 위치: 프로젝트 루트 `/docs/` 디렉토리
- 주요 문서:
  1. `docs/DSL_SPEC.md` - DSL 문법 스펙 정의
  2. `docs/examples/notification.service.dsl` - NotificationService DSL 예시
  3. `docs/examples/user.service.dsl` - UserService DSL 예시
  4. `docs/DSL_ROADMAP.md` - 향후 계획 및 로드맵

### DSL 문법 구조
- **service 블록**: 서비스 이름, 버전
- **providers 블록**: 외부 의존성 정의 (email, sms, push, kakao 등)
- **state 블록**: 서비스 내부 상태 변수 정의 (타입, 초기값)
- **method 블록**: 메서드 정의
  - `in`: 입력 파라미터 타입
  - `out`: 반환 타입
  - `preconditions`: 입력 검증 (require, validate)
  - `effects`: 실행 로직 (log, call provider, state update, return)

### 타입 시스템
- 기본 타입: `string`, `number`, `boolean`, `object`, `array`, `Void`
- 커스텀 타입: `email`, `phone` (검증 규칙 내장)
- 선택적 필드: `field?: type` 문법 지원

### Preconditions 문법
- `require(field)`: 필드 존재 검증
- `validate(field: type)`: 타입 검증 (email, phone 등)

### Effects 문법
- `log level { event, ...fields }`: 구조화된 로깅
- `call provider name.method(params) as result`: Provider 호출
- `state.field = value`: 상태 업데이트
- `if/else`: 조건부 로직
- `return value`: 반환값

### 문서 구조
```
docs/
├── DSL_SPEC.md           # DSL 문법 스펙 정의
├── DSL_ROADMAP.md        # 향후 계획
└── examples/
    ├── notification.service.dsl  # Notification 예시
    └── user.service.dsl          # User 예시
```

### 각 도메인 예시
- **NotificationService**: 사용자 제시 DSL 그대로 사용
- **UserService**: 기존 TypeScript 구현 기반 DSL 변환
  - createUser, getUserById, getAllUsers, deleteUser
  - 상태: users Map 관리
  - 입력 검증: email 형식, name 필수

## Work Log

### 2025-10-30 04:49 - scrum-master
- Task created

### 2025-10-30 05:04 - developer
- Tech Spec 작성 완료
- 문서 작성 완료:
  - docs/DSL_SPEC.md (9.3KB) - DSL 문법 스펙 정의
  - docs/DSL_ROADMAP.md (8.0KB) - 향후 계획 및 로드맵
  - docs/examples/notification.service.dsl (3.7KB) - NotificationService 예시
  - docs/examples/user.service.dsl (2.2KB) - UserService 예시
- DSL 문법 정의: service, providers, state, method 블록
- 타입 시스템: 기본 타입 + 커스텀 타입 (email, phone)
- Preconditions: require, validate 문법
- Effects: log, call provider, state update, if/else, return
- 향후 계획: Parser, Code Generator, Scrum Master 연동

### 2025-10-30 05:10 - git-manager
- 문서 커밋 생성 완료 (dcce9a4)
  - Type: docs(dsl)
  - Message: "add Service DSL specification and examples"
  - Files: docs/DSL_SPEC.md, docs/DSL_ROADMAP.md, docs/examples/*.dsl
  - 4 files changed, 1082 insertions(+)
- Task 상태 업데이트: READY_FOR_COMMIT → DONE
- Epic 상태 자동 업데이트: IN_PROGRESS → IN_REVIEW (모든 Task 완료)

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 04:49 | TODO | scrum-master | Task created |
| 2025-10-30 05:04 | IN_PROGRESS | developer | DSL 문서화 작업 시작 |
| 2025-10-30 05:08 | READY_FOR_COMMIT | git-manager | DSL 문서화 완료, 커밋 대기 |
| 2025-10-30 05:10 | DONE | system | Task completed |

## Artifacts

- Branch: feature/EPIC-d492109
- Commit: dcce9a4 (docs(dsl): add Service DSL specification and examples)
- Files Modified:
  - docs/DSL_SPEC.md (487 lines)
  - docs/DSL_ROADMAP.md (375 lines)
  - docs/examples/notification.service.dsl (118 lines)
  - docs/examples/user.service.dsl (102 lines)

## Checklist

- [x] Work completed (Developer)
- [x] Build succeeded (문서 작성만, 빌드 불필요)

