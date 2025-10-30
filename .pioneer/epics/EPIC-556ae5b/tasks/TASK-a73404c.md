---
id: TASK-a73404c
title: Supabase DB 스키마 변경 (숯불 예약 관련 컬럼 추가)
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

# TASK-a73404c: Supabase DB 스키마 변경 (숯불 예약 관련 컬럼 추가)

## Description

숯불 예약 기능을 지원하기 위한 Supabase 데이터베이스 스키마 변경 작업입니다.
- `campgrounds` 테이블에 숯불 예약 활성화 여부 및 시간대 옵션 컬럼 추가
- `reservations` 테이블에 선택한 숯불 예약 시간 컬럼 추가

## Requirements

- [x] campgrounds 테이블에 enable_charcoal_reservation 컬럼 추가 (BOOLEAN, default: false)
- [x] campgrounds 테이블에 charcoal_time_options 컬럼 추가 (TEXT[], default: ['오후 6시', '오후 7시', '오후 8시', '오후 9시'])
- [x] reservations 테이블에 charcoal_reservation_time 컬럼 추가 (TEXT, nullable)
- [x] SQL 파일에 컬럼 설명 주석 추가
- [x] SQL 파일에 테스트용 예제 쿼리 포함
- [x] Rollback 방법 문서화

## Tech Spec

### 설계 개요
- **작업 타입**: DB 스키마 변경 (SQL Migration)
- **영향 범위**: Supabase 데이터베이스
  - `campgrounds` 테이블: 2개 컬럼 추가
  - `reservations` 테이블: 1개 컬럼 추가

### 파일 구조
1. `docs/database/migrations/add-charcoal-reservation.sql` - SQL migration 파일

### 스키마 설계

#### campgrounds 테이블 변경
```sql
ALTER TABLE public.campgrounds
ADD COLUMN IF NOT EXISTS enable_charcoal_reservation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS charcoal_time_options TEXT[] DEFAULT ARRAY['오후 6시', '오후 7시', '오후 8시', '오후 9시'];
```

**컬럼 설명**:
- `enable_charcoal_reservation`: 캠핑장별 숯불 예약 기능 활성화/비활성화 스위치
- `charcoal_time_options`: 캠핑장이 설정한 시간대 옵션 배열 (드롭다운에 표시)

#### reservations 테이블 변경
```sql
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS charcoal_reservation_time TEXT DEFAULT NULL;
```

**컬럼 설명**:
- `charcoal_reservation_time`: 게스트가 선택한 시간대 (선택 사항이므로 NULL 허용)

### 데이터 예시
```sql
-- 캠핑장 설정 예시
UPDATE campgrounds
SET
  enable_charcoal_reservation = true,
  charcoal_time_options = ARRAY['오후 6시', '오후 7시', '오후 8시', '오후 9시', '오후 10시']
WHERE id = 'campground-id';

-- 예약 생성 예시 (숯불 예약 포함)
INSERT INTO reservations
  (..., charcoal_reservation_time)
VALUES
  (..., '오후 7시');
```

### Rollback 방법
```sql
ALTER TABLE public.campgrounds DROP COLUMN IF EXISTS enable_charcoal_reservation;
ALTER TABLE public.campgrounds DROP COLUMN IF EXISTS charcoal_time_options;
ALTER TABLE public.reservations DROP COLUMN IF EXISTS charcoal_reservation_time;
```

## Work Log

### 2025-10-30 12:17 - scrum-master
- Task created

### 2025-10-30 12:20 - developer
- Tech Spec 작성 완료
- SQL migration 파일 생성 완료: `docs/database/migrations/add-charcoal-reservation.sql`
- campgrounds 테이블: 2개 컬럼 추가 (enable_charcoal_reservation, charcoal_time_options)
- reservations 테이블: 1개 컬럼 추가 (charcoal_reservation_time)
- 컬럼 주석 및 예제 쿼리, Rollback 방법 포함
- SQL 파일 생성 완료 (테스트 불필요)

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 12:17 | TODO | scrum-master | Task created |
| 2025-10-30 12:18 | IN_PROGRESS | developer | Starting DB schema changes |
| 2025-10-30 12:21 | READY_FOR_COMMIT | scrum-master | SQL migration file created, no testing required |
| 2025-10-30 12:22 | DONE | scrum-master | DB schema completed |

## Artifacts

- Branch: feature/EPIC-556ae5b
- Commit: (pending - Scrum Master will create)
- Files Created:
  - docs/database/migrations/add-charcoal-reservation.sql

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed (N/A - SQL file only)
- [x] Lint passed (N/A - SQL file only)
- [x] Build succeeded (N/A - SQL file only)
- [x] Tests written (Test Engineer) - N/A for SQL migration
- [x] Tests passed - N/A for SQL migration

