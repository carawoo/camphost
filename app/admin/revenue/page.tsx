'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../admin.css'

interface RevenueData {
  date: string
  reservations: number
  revenue: number
  occupancyRate: number
}

interface MonthlyStats {
  totalRevenue: number
  totalReservations: number
  averageRevenue: number
  occupancyRate: number
  growthRate: number
}

export default function RevenueManagement() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalRevenue: 0,
    totalReservations: 0,
    averageRevenue: 0,
    occupancyRate: 0,
    growthRate: 0
  })
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [campgroundName, setCampgroundName] = useState('')
  const [campgroundId, setCampgroundId] = useState('')

  // URL params 로드
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCampgroundName(params.get('campground') || '오도이촌')
    setCampgroundId(params.get('id') || '')
  }, [])

  // 샘플 데이터 로드
  useEffect(() => {
    const sampleData: RevenueData[] = [
      { date: '2024-01-01', reservations: 5, revenue: 250000, occupancyRate: 80 },
      { date: '2024-01-02', reservations: 3, revenue: 150000, occupancyRate: 60 },
      { date: '2024-01-03', reservations: 7, revenue: 350000, occupancyRate: 90 },
      { date: '2024-01-04', reservations: 4, revenue: 200000, occupancyRate: 70 },
      { date: '2024-01-05', reservations: 6, revenue: 300000, occupancyRate: 85 },
      { date: '2024-01-06', reservations: 8, revenue: 400000, occupancyRate: 95 },
      { date: '2024-01-07', reservations: 2, revenue: 100000, occupancyRate: 40 },
      { date: '2024-01-08', reservations: 5, revenue: 250000, occupancyRate: 80 },
      { date: '2024-01-09', reservations: 6, revenue: 300000, occupancyRate: 85 },
      { date: '2024-01-10', reservations: 4, revenue: 200000, occupancyRate: 70 },
      { date: '2024-01-11', reservations: 7, revenue: 350000, occupancyRate: 90 },
      { date: '2024-01-12', reservations: 9, revenue: 450000, occupancyRate: 100 },
      { date: '2024-01-13', reservations: 8, revenue: 400000, occupancyRate: 95 },
      { date: '2024-01-14', reservations: 3, revenue: 150000, occupancyRate: 60 }
    ]

    const stats: MonthlyStats = {
      totalRevenue: sampleData.reduce((sum, day) => sum + day.revenue, 0),
      totalReservations: sampleData.reduce((sum, day) => sum + day.reservations, 0),
      averageRevenue: Math.round(sampleData.reduce((sum, day) => sum + day.revenue, 0) / sampleData.length),
      occupancyRate: Math.round(sampleData.reduce((sum, day) => sum + day.occupancyRate, 0) / sampleData.length),
      growthRate: 15.2
    }

    setRevenueData(sampleData)
    setMonthlyStats(stats)
  }, [])

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원'
  }

  const getRevenueChartData = () => {
    return revenueData.slice(-7) // 최근 7일
  }

  const getTopPerformingDays = () => {
    return [...revenueData]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* 헤더 */}
        <div className="dashboard-header">
          <div className="header-left">
            <Link href={`/admin/dashboard?campground=${encodeURIComponent(campgroundName)}${campgroundId ? `&id=${campgroundId}` : ''}`} className="back-link">← 대시보드로</Link>
            <div className="logo">
              <span className="logo-icon">💰</span>
              <h1>수익 관리</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="period-selector">
              <button 
                className={selectedPeriod === 'week' ? 'period-btn active' : 'period-btn'}
                onClick={() => setSelectedPeriod('week')}
              >
                주간
              </button>
              <button 
                className={selectedPeriod === 'month' ? 'period-btn active' : 'period-btn'}
                onClick={() => setSelectedPeriod('month')}
              >
                월간
              </button>
              <button 
                className={selectedPeriod === 'year' ? 'period-btn active' : 'period-btn'}
                onClick={() => setSelectedPeriod('year')}
              >
                연간
              </button>
            </div>
          </div>
        </div>

        {/* 주요 통계 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <h3>총 수익</h3>
              <p className="stat-value">{formatCurrency(monthlyStats.totalRevenue)}</p>
              <span className="stat-change positive">+{monthlyStats.growthRate}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>총 예약</h3>
              <p className="stat-value">{monthlyStats.totalReservations}건</p>
              <span className="stat-change positive">+12%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>평균 수익</h3>
              <p className="stat-value">{formatCurrency(monthlyStats.averageRevenue)}</p>
              <span className="stat-change positive">+8%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏠</div>
            <div className="stat-content">
              <h3>점유율</h3>
              <p className="stat-value">{monthlyStats.occupancyRate}%</p>
              <span className="stat-change positive">+5%</span>
            </div>
          </div>
        </div>

        {/* 수익 차트 */}
        <div className="chart-section">
          <div className="chart-header">
            <h3>수익 추이</h3>
            <p>최근 7일간의 수익 현황</p>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {getRevenueChartData().map((day, index) => (
                <div key={day.date} className="chart-bar-container">
                  <div className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ 
                        height: `${(day.revenue / Math.max(...getRevenueChartData().map(d => d.revenue))) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="bar-label">
                    <span>{new Date(day.date).getMonth() + 1}/{new Date(day.date).getDate()}</span>
                    <span className="bar-value">{formatCurrency(day.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 상세 분석 */}
        <div className="analysis-grid">
          {/* 최고 수익일 */}
          <div className="analysis-card">
            <h3>🏆 최고 수익일 TOP 5</h3>
            <div className="top-list">
              {getTopPerformingDays().map((day, index) => (
                <div key={day.date} className="top-item">
                  <div className="rank">{index + 1}</div>
                  <div className="item-content">
                    <div className="item-date">{new Date(day.date).toLocaleDateString('ko-KR')}</div>
                    <div className="item-revenue">{formatCurrency(day.revenue)}</div>
                  </div>
                  <div className="item-stats">
                    <span>{day.reservations}건</span>
                    <span>{day.occupancyRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 객실별 수익 */}
          <div className="analysis-card">
            <h3>🏕️ 객실별 수익</h3>
            <div className="room-revenue-list">
              <div className="room-revenue-item">
                <div className="room-name">A동</div>
                <div className="revenue-bar">
                  <div className="revenue-fill" style={{ width: '85%' }} />
                </div>
                <div className="revenue-amount">{formatCurrency(1250000)}</div>
              </div>
              <div className="room-revenue-item">
                <div className="room-name">B동</div>
                <div className="revenue-bar">
                  <div className="revenue-fill" style={{ width: '70%' }} />
                </div>
                <div className="revenue-amount">{formatCurrency(980000)}</div>
              </div>
              <div className="room-revenue-item">
                <div className="room-name">C동</div>
                <div className="revenue-bar">
                  <div className="revenue-fill" style={{ width: '60%' }} />
                </div>
                <div className="revenue-amount">{formatCurrency(750000)}</div>
              </div>
            </div>
          </div>

          {/* 월별 비교 */}
          <div className="analysis-card">
            <h3>📈 월별 성장률</h3>
            <div className="growth-chart">
              <div className="growth-item">
                <span className="month">1월</span>
                <div className="growth-bar">
                  <div className="growth-fill" style={{ width: '60%' }} />
                </div>
                <span className="growth-rate">+12%</span>
              </div>
              <div className="growth-item">
                <span className="month">2월</span>
                <div className="growth-bar">
                  <div className="growth-fill" style={{ width: '75%' }} />
                </div>
                <span className="growth-rate">+18%</span>
              </div>
              <div className="growth-item">
                <span className="month">3월</span>
                <div className="growth-bar">
                  <div className="growth-fill" style={{ width: '90%' }} />
                </div>
                <span className="growth-rate">+25%</span>
              </div>
            </div>
          </div>

          {/* 수익 예측 */}
          <div className="analysis-card">
            <h3>🔮 수익 예측</h3>
            <div className="forecast-content">
              <div className="forecast-item">
                <span className="forecast-label">다음 주 예상 수익</span>
                <span className="forecast-value">{formatCurrency(2800000)}</span>
              </div>
              <div className="forecast-item">
                <span className="forecast-label">다음 달 예상 수익</span>
                <span className="forecast-value">{formatCurrency(12000000)}</span>
              </div>
              <div className="forecast-item">
                <span className="forecast-label">예상 성장률</span>
                <span className="forecast-value positive">+22%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
