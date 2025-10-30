---
id: TASK-dbc665b
title: DSL 파서 및 AST 정의
type: task
task_type: feat
status: CANCELLED
priority: high
created: 2025-10-30T04:49:06Z
updated: 2025-10-30T04:59:57Z
assignee: scrum-master
epic: EPIC-d492109
dependencies: []
---

# TASK-dbc665b: DSL 파서 및 AST 정의

## Description

`.service.dsl` 파일을 파싱하여 AST(Abstract Syntax Tree)로 변환하는 파서를 구현합니다.

사용자가 제시한 DSL 예시를 기반으로:
- `service` 블록 파싱 (이름, 버전)
- `providers` 블록 파싱 (email, sms, push, kakao 등)
- `state` 블록 파싱 (변수명, 타입, 초기값)
- `method` 블록 파싱 (in, out, preconditions, effects)
- `preconditions`: require, validate 등
- `effects`: log, call provider, state update, return 등

## Requirements

- [ ] DSL 문법 정의 (EBNF 또는 주석으로)
- [ ] Lexer 구현 (토큰화)
- [ ] Parser 구현 (AST 생성)
- [ ] AST 타입 정의 (TypeScript interface)
- [ ] 파서 에러 핸들링 (라인 번호, 에러 메시지)
- [ ] 기본 검증 (구문 오류, 필수 필드 누락)
- [ ] 패키지 위치: `packages/shared-core/src/dsl/` (또는 별도 `packages/dsl-generator/`)
- [ ] 의존성: 최소화 (가능하면 zero-dependency parser)

## Tech Spec

[Tech spec will be added by Developer]

## Work Log

### 2025-10-30 04:49 - scrum-master
- Task created

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 04:49 | TODO | scrum-master | Task created |
| 2025-10-30 04:59 | CANCELLED | scrum-master | 코드 생성기 구현 불필요, 문서 작성만 진행 |

## Artifacts

- Branch:
- Commit:
- Files Modified:

## Checklist

- [ ] Tech spec written (Developer)
- [ ] Code implemented (Developer)
- [ ] Type check passed
- [ ] Lint passed
- [ ] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed

