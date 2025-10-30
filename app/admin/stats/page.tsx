"use client"

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import '../admin.css'
import { supabaseRest } from '@/services/supabaseRest'

type Counts = { checkins: number; checkouts: number; inquiries: number }

const fmt = (d: Date) => d.toISOString().slice(0, 10)

export default function TodayStats() {
  const [campgroundName, setCampgroundName] = useState('')
  const [campgroundId, setCampgroundId] = useState<string>('')
  const [counts, setCounts] = useState<Counts>({ checkins: 0, checkouts: 0, inquiries: 0 })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const name = params.get('campground') || ''
    setCampgroundName(name)
    ;(async () => {
      try {
        if (supabaseRest.isEnabled()) {
          const idParam = params.get('id')
          let rows: any[] | null = null
          if (idParam && /^[0-9a-fA-F-]{36}$/.test(idParam)) {
            rows = await supabaseRest.select<any[]>('campgrounds', `?id=eq.${idParam}&select=id`)
          }
          if (!rows || rows.length === 0) {
            rows = await supabaseRest.select<any[]>('campgrounds', `?name=eq.${encodeURIComponent(name)}&select=id`)
          }
          const row = rows && rows[0]
          if (row?.id) setCampgroundId(row.id)
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!campgroundId || !supabaseRest.isEnabled()) return
      const today = fmt(new Date())
      try {
        // 체크인: actual_checkin_time이 오늘인 것 (실제 체크인 시간 기준)
        const ciRows = await supabaseRest.select<any[]>(
          'reservations',
          `?campground_id=eq.${campgroundId}&status=eq.checked-in&actual_checkin_time=gte.${today}T00:00:00Z&actual_checkin_time=lte.${today}T23:59:59Z&select=id`
        )

        // 체크아웃: actual_checkout_time이 오늘인 것 (실제 체크아웃 시간 기준)
        const coRows = await supabaseRest.select<any[]>(
          'reservations',
          `?campground_id=eq.${campgroundId}&status=eq.checked-out&actual_checkout_time=gte.${today}T00:00:00Z&actual_checkout_time=lte.${today}T23:59:59Z&select=id`
        )

        // 신규 문의
        let iqRows: any[] = []
        try {
          iqRows = (await supabaseRest.select<any[]>(
            'inquiries',
            `?campground_id=eq.${campgroundId}&created_at=gte.${today}T00:00:00Z&created_at=lte.${today}T23:59:59Z&status=eq.new&select=id`
          )) || []
        } catch {}

        setCounts({ checkins: (ciRows || []).length, checkouts: (coRows || []).length, inquiries: (iqRows || []).length })
      } catch (error) {
        console.error('[Stats] Failed to load today stats:', error)
      }
    }
    load()
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(load, 10000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [campgroundId])

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <Link href={`/admin/dashboard?campground=${encodeURIComponent(campgroundName)}${campgroundId ? `&id=${campgroundId}` : ''}`} className="back-link">← 대시보드로</Link>
            <div className="logo">
              <span className="logo-icon">📊</span>
              <h1>오늘의 통계</h1>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>금일 요약</h3>
          <div className="action-buttons">
            <div className="stat-card"><span>체크인</span><strong style={{ marginLeft: 8 }}>{counts.checkins}</strong></div>
            <div className="stat-card"><span>체크아웃</span><strong style={{ marginLeft: 8 }}>{counts.checkouts}</strong></div>
            <div className="stat-card"><span>신규 문의</span><strong style={{ marginLeft: 8 }}>{counts.inquiries}</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}


