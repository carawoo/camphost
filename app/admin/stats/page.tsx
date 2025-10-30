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
        const ciRows = await supabaseRest.select<any[]>(
          'reservations',
          `?campground_id=eq.${campgroundId}&check_in_date=eq.${today}&status=eq.checked-in&select=id`
        )
        let coRows = await supabaseRest.select<any[]>(
          'reservations',
          `?campground_id=eq.${campgroundId}&check_out_date=eq.${today}&status=eq.checked-out&select=id`
        )
        // 일부 데이터는 check_out_date가 비어 있고 updated_at만 당일로 남을 수 있어 보완
        if (!coRows || coRows.length === 0) {
          try {
            coRows = await supabaseRest.select<any[]>(
              'reservations',
              `?campground_id=eq.${campgroundId}&status=eq.checked-out&updated_at=gte.${today}T00:00:00Z&updated_at=lte.${today}T23:59:59Z&select=id`
            )
          } catch {}
        }
        let iqRows: any[] = []
        try {
          iqRows = (await supabaseRest.select<any[]>(
            'inquiries',
            `?campground_id=eq.${campgroundId}&created_at=gte.${today}T00:00:00Z&created_at=lte.${today}T23:59:59Z&status=eq.new&select=id`
          )) || []
        } catch {}
        setCounts({ checkins: (ciRows || []).length, checkouts: (coRows || []).length, inquiries: (iqRows || []).length })
      } catch {}
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


