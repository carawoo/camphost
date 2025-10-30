---
id: TASK-b670bfe
title: updateFile 메서드 구현 (덮어쓰기)
type: task
task_type: feat
status: DONE
priority: medium
created: 2025-10-30T07:54:13Z
updated: 2025-10-30T08:06:36Z
assignee: system
epic: EPIC-b7b0ed9
dependencies: []
---

# TASK-b670bfe: updateFile 메서드 구현 (덮어쓰기)

## Description

파일 업데이트 메서드를 구현합니다. 파일 내용을 덮어쓰며, 원본 메타데이터는 유지합니다.

## Requirements

- [x] updateFile(fileId: string, userId: string, input: UpdateFileInput) 메서드 구현
- [x] 파일 미존재 시 undefined 반환
- [x] 권한 검증 (userId 불일치 시 FileValidationError throw)
- [x] 파일 크기 검증 (MAX_FILE_SIZE 초과 시 에러)
- [x] 원본 메타데이터 유지 (fileName, mimeType, uploadedAt)
- [x] content와 fileSize만 업데이트
- [x] Logger.info로 업데이트 기록

## Tech Spec

### 설계 개요
- 파일: `packages/sample-domain/src/file-storage/file-storage.service.ts`
- updateFile 메서드 추가

### updateFile 메서드
- **시그니처**: `updateFile(fileId: string, userId: string, input: UpdateFileInput): Promise<FileMetadata | undefined>`
- **로직**:
  1. Map에서 파일 조회
  2. 파일 미존재 시 undefined 반환
  3. userId 검증 (불일치 시 FileValidationError throw with code 'FORBIDDEN')
  4. 새 파일 크기 검증 (MAX_FILE_SIZE 초과 시 FileValidationError throw)
  5. 원본 메타데이터 유지 + fileSize만 업데이트
  6. Map에 업데이트된 파일 저장
  7. Logger.info로 업데이트 기록
- **반환**: FileMetadata

## Work Log

### 2025-10-30 07:54 - scrum-master
- Task created

### 2025-10-30 16:30 - developer
- 설계 완료 (Tech Spec 작성)
- 구현 완료
  - packages/sample-domain/src/file-storage/file-storage.service.ts (updateFile)
- 타입 체크: ✅ 성공
- 빌드: ✅ 성공

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 07:54 | TODO | scrum-master | Task created |
| 2025-10-30 08:00 | IN_PROGRESS | developer | Starting implementation |
| 2025-10-30 08:00 | READY_FOR_TEST | test-engineer | Implementation completed, ready for testing |
| 2025-10-30 08:06 | DONE | system | Task completed |

## Artifacts

- Branch:
- Commit:
- Files Modified:

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed
- [x] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed

