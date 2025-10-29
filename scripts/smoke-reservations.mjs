// scripts/smoke-reservations.mjs
// Verifies live data flow for reservations using Supabase REST

// Lightweight Supabase REST client (duplicated to avoid TS import at runtime)
const supabaseRest = {
  isEnabled: () => !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  _base: () => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`,
  _headers: () => ({
    'Content-Type': 'application/json',
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'Prefer': 'return=representation'
  }),
  async select(table, query = '') {
    const res = await fetch(`${this._base()}/${table}${query}`, { headers: this._headers() })
    if (!res.ok) throw new Error(`Select ${table} failed: ${res.status}`)
    return res.json()
  },
  async insert(table, data) {
    const res = await fetch(`${this._base()}/${table}`, { method: 'POST', headers: this._headers(), body: JSON.stringify(data) })
    if (!res.ok) throw new Error(`Insert ${table} failed: ${res.status}`)
    return res.json()
  },
  async upsert(table, data, onConflict) {
    const q = onConflict ? `?on_conflict=${onConflict}` : ''
    const res = await fetch(`${this._base()}/${table}${q}`, { method: 'POST', headers: this._headers(), body: JSON.stringify(data) })
    if (!res.ok) throw new Error(`Upsert ${table} failed: ${res.status}`)
    return res.json()
  },
  async update(table, data, query = '') {
    const res = await fetch(`${this._base()}/${table}${query}`, { method: 'PATCH', headers: this._headers(), body: JSON.stringify(data) })
    if (!res.ok) throw new Error(`Update ${table} failed: ${res.status}`)
    return res.json()
  }
}

async function main() {
  if (!supabaseRest.isEnabled()) {
    console.error('Supabase env not set. Aborting.')
    process.exit(1)
  }

  const campgroundName = process.env.SMOKE_CAMPGROUND || '오도이촌'
  let campgroundId
  try {
    const rows = await supabaseRest.select('campgrounds', `?name=eq.${encodeURIComponent(campgroundName)}&select=id,name`)
    if (rows && rows[0]) {
      campgroundId = rows[0].id
    } else {
      // create minimal campground if missing
      const inserted = await supabaseRest.upsert('campgrounds', {
        id: `smoke_${Date.now()}`,
        name: campgroundName,
        owner_name: '스모크',
        owner_email: 'smoke@example.com',
        status: 'active',
        subscription_plan: 'basic'
      }, 'id')
      campgroundId = inserted?.id
    }
  } catch (e) {
    console.error('Failed to ensure campground:', e.message)
    process.exit(1)
  }

  // 1) Insert reservation
  const guestName = `스모크테스트-${Date.now()}`
  const phone = '010-0000-0000'
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 10)
  try {
    await supabaseRest.insert('reservations', {
      campground_id: campgroundId,
      guest_name: guestName,
      phone,
      room_number: 'A-101',
      check_in_date: today,
      check_out_date: tomorrow,
      guests: 2,
      total_amount: 100000,
      status: 'confirmed'
    })
  } catch (e) {
    console.error('Insert reservation failed:', e.message)
    process.exit(1)
  }

  // 2) Verify select by guest + phone
  let inserted
  try {
    const rows = await supabaseRest.select('reservations', `?campground_id=eq.${campgroundId}&guest_name=eq.${encodeURIComponent(guestName)}&phone=eq.${encodeURIComponent(phone)}&select=*`)
    inserted = rows && rows[0]
    if (!inserted) throw new Error('Inserted reservation not found')
  } catch (e) {
    console.error('Verification select failed:', e.message)
    process.exit(1)
  }

  // 3) Update to checked-in and verify
  try {
    await supabaseRest.update('reservations', { status: 'checked-in' }, `?id=eq.${inserted.id}`)
    const rows = await supabaseRest.select('reservations', `?id=eq.${inserted.id}&select=status`)
    if (!rows || !rows[0] || rows[0].status !== 'checked-in') throw new Error('Status did not update')
  } catch (e) {
    console.error('Update verification failed:', e.message)
    process.exit(1)
  }

  console.log('RESERVATIONS SMOKE PASSED ✅')
}

main()


