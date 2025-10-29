import { NextResponse } from 'next/server'
import { supabaseRest } from '@/services/supabaseRest'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 })
    if (!supabaseRest.isEnabled()) return NextResponse.json({ ok: false, error: 'Supabase env not set' }, { status: 500 })

    // Best-effort cascade delete (reservations, inquiries -> campgrounds)
    try { await (supabaseRest as any).delete('reservations', `?campground_id=eq.${id}`) } catch {}
    try { await (supabaseRest as any).delete('inquiries', `?campground_id=eq.${id}`) } catch {}
    try { await (supabaseRest as any).delete('campgrounds', `?id=eq.${id}`) } catch {}

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


