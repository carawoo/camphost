-- Migration: Add Charcoal Reservation Feature
-- Date: 2025-10-30
-- Description:
--   숯불 예약 기능을 추가하기 위한 DB 스키마 변경
--   - campgrounds 테이블: 숯불 예약 활성화 여부 및 시간대 옵션 설정
--   - reservations 테이블: 예약 시 선택한 숯불 시간대 저장

-- ============================================================
-- 1. Add columns to campgrounds table
-- ============================================================

-- enable_charcoal_reservation: 숯불 예약 기능 활성화 여부
-- charcoal_time_options: 드롭다운에 표시될 시간대 옵션 배열
ALTER TABLE public.campgrounds
ADD COLUMN IF NOT EXISTS enable_charcoal_reservation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS charcoal_time_options TEXT[] DEFAULT ARRAY['오후 6시', '오후 7시', '오후 8시', '오후 9시'];

-- Add comments to campgrounds columns
COMMENT ON COLUMN public.campgrounds.enable_charcoal_reservation IS '숯불 예약 기능 활성화 여부 (true: 활성화, false: 비활성화)';
COMMENT ON COLUMN public.campgrounds.charcoal_time_options IS '숯불 예약 가능 시간대 옵션 배열 (예: ["오후 6시", "오후 7시", "오후 8시"])';

-- ============================================================
-- 2. Add column to reservations table
-- ============================================================

-- charcoal_reservation_time: 게스트가 선택한 숯불 예약 시간 (선택 사항)
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS charcoal_reservation_time TEXT DEFAULT NULL;

-- Add comment to reservations column
COMMENT ON COLUMN public.reservations.charcoal_reservation_time IS '선택한 숯불 예약 시간대 (선택 사항, NULL 가능)';

-- ============================================================
-- 3. Example data for testing
-- ============================================================

-- Example: Enable charcoal reservation for a campground with custom time options
-- UPDATE public.campgrounds
-- SET
--   enable_charcoal_reservation = true,
--   charcoal_time_options = ARRAY['오후 6시', '오후 7시', '오후 8시', '오후 9시', '오후 10시']
-- WHERE id = 'your-campground-id';

-- Example: Create a reservation with charcoal time
-- INSERT INTO public.reservations
--   (guest_name, phone, room_number, check_in_date, check_out_date, guests, total_amount, status, charcoal_reservation_time)
-- VALUES
--   ('김철수', '010-1234-5678', 'A동-101', '2025-11-01', '2025-11-03', 4, 150000, 'confirmed', '오후 7시');

-- ============================================================
-- Rollback Instructions (if needed)
-- ============================================================

-- To rollback this migration, run:
-- ALTER TABLE public.campgrounds DROP COLUMN IF EXISTS enable_charcoal_reservation;
-- ALTER TABLE public.campgrounds DROP COLUMN IF EXISTS charcoal_time_options;
-- ALTER TABLE public.reservations DROP COLUMN IF EXISTS charcoal_reservation_time;
