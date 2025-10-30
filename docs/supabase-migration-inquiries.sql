-- Create inquiries table for guest-admin communication
-- This table stores inquiries from guests via kiosk and replies from campground admins

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campground_id UUID NOT NULL REFERENCES public.campgrounds(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
  reply_message TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS inquiries_campground_id_idx ON public.inquiries(campground_id);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_guest_phone_idx ON public.inquiries(guest_phone);

-- Add comments for documentation
COMMENT ON TABLE public.inquiries IS '캠퍼-사장님 문의 시스템';
COMMENT ON COLUMN public.inquiries.campground_id IS '캠핑장 ID';
COMMENT ON COLUMN public.inquiries.guest_name IS '문의자 이름';
COMMENT ON COLUMN public.inquiries.guest_phone IS '문의자 연락처';
COMMENT ON COLUMN public.inquiries.reservation_id IS '예약 ID (선택)';
COMMENT ON COLUMN public.inquiries.message IS '문의 내용';
COMMENT ON COLUMN public.inquiries.status IS '상태: pending(대기), replied(답변완료), closed(종료)';
COMMENT ON COLUMN public.inquiries.reply_message IS '사장님 답변';
COMMENT ON COLUMN public.inquiries.replied_at IS '답변 시간';

-- Enable Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow campground admins to read their own inquiries
CREATE POLICY "Campground admins can read their inquiries"
  ON public.inquiries FOR SELECT
  USING (campground_id IN (
    SELECT id FROM public.campgrounds
    WHERE owner_id = auth.uid()
  ));

-- Allow campground admins to update their inquiries (for replying)
CREATE POLICY "Campground admins can update their inquiries"
  ON public.inquiries FOR UPDATE
  USING (campground_id IN (
    SELECT id FROM public.campgrounds
    WHERE owner_id = auth.uid()
  ));

-- Allow anyone to insert inquiries (for kiosk usage)
CREATE POLICY "Anyone can insert inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

-- Allow guests to read their own inquiries by phone number
CREATE POLICY "Guests can read their own inquiries"
  ON public.inquiries FOR SELECT
  USING (true);
