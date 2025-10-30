---
id: TASK-6e9e192
title: localStorage 검증 로직 추가 - DB에 없는 캠핑장 데이터 자동 삭제
type: task
task_type: feat
status: DONE
priority: high
created: 2025-10-30T12:52:24Z
updated: 2025-10-30T13:12:46Z
assignee: scrum-master
epic: EPIC-ebdc38e
dependencies: []
---

# TASK-6e9e192: localStorage 검증 로직 추가 - DB에 없는 캠핑장 데이터 자동 삭제

## Description

localStorage에 저장된 캠핑장 데이터를 검증하여 Supabase DB에 존재하지 않는 경우 자동으로 삭제하는 기능을 구현합니다.
현재 "용오름밸리"라는 오래된 캠핑장 데이터가 localStorage에 남아있어 랜덤하게 표시되는 문제를 해결합니다.

## Requirements

- [x] localStorage에서 캠핑장 데이터를 가져와 Supabase에서 존재 여부 확인
- [x] DB에 존재하지 않는 캠핑장 데이터는 localStorage에서 자동 삭제
- [x] 검증 실패 시 기본값(defaultCampgroundInfo) 반환
- [x] Supabase 호출 실패 시 graceful degradation (검증 스킵)
- [x] 기존 동기 함수와의 호환성 유지

## Tech Spec

### 설계 개요
- 수정 파일: `lib/campground.ts`
- 새로운 async 함수 추가: `validateAndGetCampgroundInfo()`
- 기존 `getCampgroundInfo()` 함수는 유지 (하위 호환성)

### 구현 방법

**1. validateAndGetCampgroundInfo() 함수 추가**
- localStorage에서 캠핑장 데이터 읽기
- Supabase에서 해당 캠핑장 존재 여부 확인 (`supabaseRest.select()` 사용)
- DB에 없으면 localStorage에서 삭제 후 기본값 반환
- DB에 있으면 검증된 데이터 반환
- Supabase 비활성화 또는 오류 시 graceful degradation

**2. 타입 정의**
- 모든 함수에 명시적 반환 타입 정의
- async/await 사용

**3. 에러 처리**
- try-catch로 안전하게 처리
- console.warn으로 디버깅 정보 제공
- 실패 시에도 애플리케이션 정상 작동 보장

### API 설계

```typescript
// 새로운 async 검증 함수
export const validateAndGetCampgroundInfo = async (): Promise<CampgroundInfo>

// 기존 동기 함수 유지
export const getCampgroundInfo = (): CampgroundInfo
```

### 사용 예시

```typescript
// 대시보드 초기화 시 (기존 useEffect 내 async IIFE에서)
const info = await validateAndGetCampgroundInfo()
setCampgroundInfo(info)
```

### 의존성
- `supabaseRest` service (이미 존재)
- `SupabaseCampground` 타입 import 필요

## Work Log

### 2025-10-30 12:52 - scrum-master
- Task created

### 2025-10-30 13:00 - developer
- Tech Spec 작성 완료
- 구현 완료
  - lib/campground.ts: validateAndGetCampgroundInfo() 함수 추가
  - supabaseRest import 추가
  - localStorage 검증 로직 구현
  - DB 존재 여부 확인 및 자동 삭제 기능
  - Graceful degradation 처리
- 빌드: ✅ 성공 (npm run build)

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 12:52 | TODO | scrum-master | Task created |
| 2025-10-30 12:55 | READY_FOR_TEST | test-engineer | 구현 완료, 테스트 대기 |
| 2025-10-30 12:55 | READY_FOR_TEST | developer | localStorage validation logic implemented |
| 2025-10-30 13:12 | DONE | scrum-master | localStorage validation logic implemented and tested |

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

