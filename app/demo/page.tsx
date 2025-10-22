import DemoHeader from '@/components/DemoHeader'
import CheckinDemo from '@/components/CheckinDemo'
import OndamDemo from '@/components/OndamDemo'
import WeaveDemo from '@/components/WeaveDemo'

export default function DemoPage() {
  return (
    <>
      <DemoHeader />
      <main className="demo-main">
        <section className="demo-hero">
          <div className="wrap">
            <h1>오도이촌이 대신합니다</h1>
            <p className="demo-subtitle">무인 체크인 · 온담(문의함) · 위브(리포트) — 3가지만으로 시작.</p>
          </div>
        </section>

        <CheckinDemo />
        <OndamDemo />
        <WeaveDemo />
      </main>
    </>
  )
}
