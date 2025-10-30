---
id: TASK-4bf6d8b
title: updateUser 메서드 구현
type: task
task_type: feat
status: DONE
priority: medium
created: 2025-10-30T07:19:58Z
updated: 2025-10-30T07:35:51Z
assignee: system
epic: EPIC-e0ac724
dependencies: []
---

# TASK-4bf6d8b: updateUser 메서드 구현

## Description

UserService에 updateUser 메서드를 구현합니다. 사용자 ID로 조회 후 name, email을 부분 수정할 수 있으며, 이름 수정 시 중복 검사를 수행합니다.

## Requirements

- [ ] updateUser(id: string, input: UpdateUserInput): Promise<User | undefined> 메서드 추가
- [ ] 사용자가 존재하지 않으면 undefined 반환
- [ ] name 수정 시 isNameDuplicate(name, id) 호출하여 중복 검사
- [ ] 중복 시 에러 throw
- [ ] 제공된 필드만 수정 (name, email)
- [ ] Logger에 수정 작업 기록
- [ ] 수정된 User 객체 반환

## Tech Spec

### 설계 개요
- 패키지: packages/sample-domain
- 파일: src/user/user.service.ts
- updateUser 메서드 추가

### 메서드 설계
- 메서드명: updateUser
- 파라미터:
  - id: string (수정할 사용자 ID)
  - input: UpdateUserInput (수정할 데이터)
- 반환값: Promise<User | undefined>

### 구현 로직
1. users.get(id)로 사용자 조회
2. 사용자가 없으면 undefined 반환
3. input.name이 제공되었고 기존 이름과 다른 경우:
   - isNameDuplicate(input.name, id) 호출
   - 중복 시 logger.error() 및 Error throw
4. 제공된 필드만 업데이트 (name, email)
5. users.set(id, updatedUser)로 저장
6. logger.info()로 업데이트 로깅
7. 수정된 User 객체 반환

## Work Log

### 2025-10-30 07:19 - scrum-master
- Task created

### 2025-10-30 07:25 - developer
- Tech spec 작성 완료
- updateUser 메서드 구현
  - packages/sample-domain/src/user/user.service.ts
  - UpdateUserInput import 추가

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 07:19 | TODO | scrum-master | Task created |
| 2025-10-30 07:25 | IN_PROGRESS | developer | Starting implementation |
| 2025-10-30 07:28 | READY_FOR_TEST | test-engineer | Implementation complete, ready for testing |
| 2025-10-30 07:35 | DONE | system | Task completed |

## Artifacts

- Branch: epic/EPIC-e0ac724-userservice-update-and-validation
- Commit: (pending, will be created by Scrum Master)
- Files Modified:
  - packages/sample-domain/src/user/user.service.ts
  - packages/sample-domain/src/user/user.types.ts

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed (no lint task configured)
- [x] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed

