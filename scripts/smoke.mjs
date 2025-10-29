/*
  Simple E2E smoke test (no browser):
  - Reads dashboard_metrics before
  - Inserts a new campground via Supabase REST
  - Verifies admin/kiosk pages render the new name
  - Verifies dashboard_metrics.total increases by 1
  Usage: node scripts/smoke.mjs
  Requires env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  Assumes dev server is running at http://localhost:3000
*/

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const rest = async (path, init) => {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  })
  if (!res.ok) throw new Error(`Supabase REST error: ${res.status} ${await res.text()}`)
  return await res.json()
}

const now = Date.now()
const cgName = `오도이촌_${now}`
const contactPhone = '010-9999-0000'
const contactEmail = 'test@odoichon.com'

const getMetrics = async () => {
  const rows = await rest('/dashboard_metrics?select=*')
  return rows[0]
}

;(async () => {
  const before = await getMetrics()
  console.log('metrics before:', before)

  // insert campground
  const inserted = await rest('/campgrounds?select=*', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      name: cgName,
      owner_name: '스모크테스트',
      owner_email: contactEmail,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      address: '경기도 스모크',
      description: '자동 테스트 생성',
      status: 'active',
      subscription_plan: 'basic'
    })
  })
  console.log('inserted:', inserted[0]?.id)

  // allow propagation
  await new Promise(r => setTimeout(r, 800))

  // check admin page
  const adminRes = await fetch(`${BASE}/admin/dashboard?campground=${encodeURIComponent(cgName)}`)
  const adminHtml = await adminRes.text()
  if (!adminHtml.includes(cgName)) throw new Error('Admin page does not include campground name')

  // check kiosk page
  const kioskRes = await fetch(`${BASE}/kiosk?campground=${encodeURIComponent(cgName)}`)
  const kioskHtml = await kioskRes.text()
  if (!kioskHtml.includes(cgName)) throw new Error('Kiosk page does not include campground name')

  // metrics increased
  const after = await getMetrics()
  console.log('metrics after:', after)
  if ((after.total_campgrounds || 0) < (before.total_campgrounds || 0) + 1) {
    throw new Error('dashboard_metrics total_campgrounds did not increase')
  }

  console.log('SMOKE TEST PASSED ✅')
  process.exit(0)
})().catch(err => {
  console.error('SMOKE TEST FAILED ❌\n', err)
  process.exit(1)
})


