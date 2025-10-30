---
id: TASK-a4ef1fb
title: FileStorage 타입 정의
type: task
task_type: feat
status: DONE
priority: high
created: 2025-10-30T07:54:12Z
updated: 2025-10-30T08:06:36Z
assignee: system
epic: EPIC-b7b0ed9
dependencies: []
---

# TASK-a4ef1fb: FileStorage 타입 정의

## Description

파일 스토리지 서비스를 위한 TypeScript 타입을 정의합니다.
관련 다이어그램: docs/c4-model/lv4-code/sample-domain/file-storage.service.puml (신규 생성 예정)

## Requirements

- [ ] FileMetadata 인터페이스 (id, userId, fileName, fileSize, mimeType, uploadedAt)
- [ ] UploadFileInput 인터페이스 (fileName, fileSize, mimeType, content: Buffer)
- [ ] UpdateFileInput 인터페이스 (content: Buffer)
- [ ] FileListQuery 인터페이스 (limit, offset, sortBy, order)
- [ ] FileValidationError 커스텀 에러 클래스
- [ ] 허용 MIME 타입 상수 (ALLOWED_MIME_TYPES)
- [ ] 최대 파일 크기 상수 (MAX_FILE_SIZE = 10MB)

## Tech Spec

### 설계 개요
- 파일: `packages/sample-domain/src/file-storage/file-storage.types.ts`
- TypeScript 타입 정의 및 상수 선언

### 타입 정의
1. **FileMetadata**: 파일 메타데이터 인터페이스
   - id: string (UUID)
   - userId: string (파일 소유자)
   - fileName: string (원본 파일명)
   - fileSize: number (바이트 단위)
   - mimeType: string (파일 형식)
   - uploadedAt: Date (업로드 일시)

2. **UploadFileInput**: 파일 업로드 입력
   - fileName, fileSize, mimeType
   - content: Buffer (파일 내용)

3. **UpdateFileInput**: 파일 업데이트 입력
   - content: Buffer (새로운 파일 내용)

4. **FileListQuery**: 파일 목록 조회 쿼리
   - limit?: number (기본값: 20)
   - offset?: number (기본값: 0)
   - sortBy?: 'uploadedAt' | 'fileName' | 'fileSize'
   - order?: 'asc' | 'desc'

5. **FileValidationError**: 커스텀 에러 클래스
   - message: string
   - code: string (에러 코드)

### 상수 정의
1. **ALLOWED_MIME_TYPES**: 허용된 MIME 타입 배열
   - 이미지: jpeg, png, gif, webp
   - PDF: application/pdf
   - 문서: doc, docx, xls, xlsx, txt

2. **MAX_FILE_SIZE**: 최대 파일 크기
   - 10MB (10 * 1024 * 1024 bytes)

## Work Log

### 2025-10-30 07:54 - scrum-master
- Task created

### 2025-10-30 16:30 - developer
- 설계 완료 (Tech Spec 작성)
- 구현 완료
  - packages/sample-domain/src/file-storage/file-storage.types.ts
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

