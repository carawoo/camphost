"use client"

import Link from 'next/link'
import '../admin.css'

export default function InquiriesPage() {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <Link href="/admin/dashboard" className="back-link">← 대시보드로</Link>
            <div className="logo">
              <span className="logo-icon">💬</span>
              <h1>새 문의 확인</h1>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>문의 목록</h3>
          <div className="activity-list">
            <div className="activity-item"><div className="activity-content"><p>아직 등록된 문의가 없습니다.</p></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}


