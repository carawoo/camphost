-- Add actual check-in and check-out timestamp columns to reservations table
-- These columns record the actual time when a guest checks in/out via kiosk

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS actual_checkin_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_checkout_time TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN public.reservations.actual_checkin_time IS '실제 체크인 수행 시간 (키오스크에서 체크인 버튼 클릭 시점)';
COMMENT ON COLUMN public.reservations.actual_checkout_time IS '실제 체크아웃 수행 시간 (키오스크에서 체크아웃 버튼 클릭 시점)';
