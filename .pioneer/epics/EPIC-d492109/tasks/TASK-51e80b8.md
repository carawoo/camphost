---
id: TASK-51e80b8
title: TypeScript 코드 생성기 구현
type: task
task_type: feat
status: CANCELLED
priority: high
created: 2025-10-30T04:49:07Z
updated: 2025-10-30T04:59:58Z
assignee: scrum-master
epic: EPIC-d492109
dependencies: ["TASK-dbc665b"]
---

# TASK-51e80b8: TypeScript 코드 생성기 구현

## Description

AST를 입력받아 TypeScript Service 코드를 생성하는 코드 생성기를 구현합니다.

생성 대상:
1. **Service 클래스** (`.service.ts`)
   - tsyringe DI 데코레이터 (`@singleton()`, `@injectable()`)
   - Constructor에 providers 주입
   - State 변수 (private)
   - Methods 구현

2. **Types 파일** (`.types.ts`)
   - Params 인터페이스 (in)
   - Result 인터페이스 (out)
   - Provider 인터페이스

3. **Preconditions 변환**
   - `require(field)` → 필드 존재 검증
   - `validate(field: type)` → 타입별 검증 로직 (email, phone 등)

4. **Effects 변환**
   - `log info/error` → `this.logger.info/error(...)`
   - `call provider` → `await this.provider.method(...)`
   - `state.field += 1` → State 업데이트
   - `return` → Return 문

## Requirements

- [ ] CodeGenerator 클래스 구현
- [ ] Service 클래스 템플릿 생성
- [ ] Types 파일 템플릿 생성
- [ ] Preconditions 코드 변환 로직
- [ ] Effects 코드 변환 로직
- [ ] 생성된 코드 포매팅 (prettier 호환)
- [ ] 주석 생성 (JSDoc)
- [ ] 의존성: TASK-dbc665b (파서)

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

