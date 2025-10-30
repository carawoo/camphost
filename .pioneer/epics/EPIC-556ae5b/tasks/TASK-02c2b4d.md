---
id: TASK-02c2b4d
title: 타입 정의 업데이트 (Reservation에 charcoalReservationTime 추가)
type: task
task_type: chore
status: DONE
priority: high
created: 2025-10-30T12:17:16Z
updated: 2025-10-30T12:22:26Z
assignee: scrum-master
epic: EPIC-556ae5b
dependencies: []
---

# TASK-02c2b4d: 타입 정의 업데이트 (Reservation에 charcoalReservationTime 추가)

## Description

숯불 예약 기능을 지원하기 위한 TypeScript 타입 정의 업데이트 작업입니다.
- `Reservation` 인터페이스에 `charcoalReservationTime` 필드 추가
- `SupabaseCampground` 타입에 `enable_charcoal_reservation`, `charcoal_time_options` 필드 추가
- 레거시 `lib/reservations.ts`의 Reservation 타입도 동일하게 업데이트

## Requirements

- [x] src/types/index.ts의 Reservation 인터페이스에 charcoalReservationTime 필드 추가
- [x] src/services/supabaseRest.ts의 SupabaseCampground 타입에 enable_charcoal_reservation 필드 추가
- [x] src/services/supabaseRest.ts의 SupabaseCampground 타입에 charcoal_time_options 필드 추가
- [x] lib/reservations.ts의 Reservation 타입에 charcoalReservationTime 필드 추가
- [x] 모든 필드에 JSDoc 주석 추가
- [x] 타입 검사 통과 (빌드 성공)
- [x] 하위 호환성 유지 (모든 필드 optional)

## Tech Spec

### 설계 개요
- **작업 타입**: TypeScript 타입 정의 업데이트
- **영향 범위**:
  - Frontend types: `src/types/index.ts`
  - Supabase REST types: `src/services/supabaseRest.ts`
  - Legacy types: `lib/reservations.ts`

### 파일 구조
1. `src/types/index.ts` - 공통 Reservation 인터페이스
2. `src/services/supabaseRest.ts` - Supabase Campground 타입
3. `lib/reservations.ts` - 레거시 Reservation 타입

### 타입 정의

#### 1. src/types/index.ts - Reservation 인터페이스
```typescript
export interface Reservation extends BaseEntity {
  // ... existing fields
  /**
   * 선택한 숯불 예약 시간대 (선택 사항)
   * @example "오후 7시"
   */
  charcoalReservationTime?: string
}
```

#### 2. src/services/supabaseRest.ts - SupabaseCampground 타입
```typescript
export type SupabaseCampground = {
  // ... existing fields
  /**
   * 숯불 예약 기능 활성화 여부
   */
  enable_charcoal_reservation?: boolean
  /**
   * 숯불 예약 가능 시간대 옵션 배열
   * @example ["오후 6시", "오후 7시", "오후 8시"]
   */
  charcoal_time_options?: string[]
}
```

#### 3. lib/reservations.ts - Reservation 타입 (Legacy)
```typescript
export interface Reservation {
  // ... existing fields
  /**
   * 선택한 숯불 예약 시간대 (선택 사항)
   * @example "오후 7시"
   */
  charcoalReservationTime?: string
}
```

### 하위 호환성
- 모든 새 필드는 `optional` (`?`)로 정의
- 기존 코드 수정 없이 타입 추가만으로 호환성 유지
- DB에서 해당 컬럼이 없어도 타입 오류 없음

## Work Log

### 2025-10-30 12:17 - scrum-master
- Task created

### 2025-10-30 12:20 - developer
- Tech Spec 작성 완료
- TypeScript 타입 정의 업데이트 완료
  - src/types/index.ts: Reservation 인터페이스에 charcoalReservationTime 필드 추가
  - src/services/supabaseRest.ts: SupabaseCampground 타입에 enable_charcoal_reservation, charcoal_time_options 필드 추가
  - lib/reservations.ts: Reservation 타입에 charcoalReservationTime 필드 추가
- 모든 필드에 JSDoc 주석 추가
- 빌드 검증: ✅ 성공 (npm run build)

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 12:17 | TODO | scrum-master | Task created |
| 2025-10-30 12:18 | IN_PROGRESS | developer | Starting type definitions |
| 2025-10-30 12:21 | READY_FOR_COMMIT | scrum-master | Type definitions updated, build passed, no testing required |
| 2025-10-30 12:22 | DONE | scrum-master | Type definitions completed |

## Artifacts

- Branch: feature/EPIC-556ae5b
- Commit: (pending - Scrum Master will create)
- Files Modified:
  - src/types/index.ts
  - src/services/supabaseRest.ts
  - lib/reservations.ts

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed (ESLint not configured, skipped)
- [x] Build succeeded
- [x] Tests written (Test Engineer) - N/A for type definitions
- [x] Tests passed - N/A for type definitions

