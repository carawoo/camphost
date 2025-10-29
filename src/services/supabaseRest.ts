/* Lightweight Supabase REST helper without supabase-js dependency */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function isEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
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
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase REST error: ${res.status} ${text}`)
  }
  return (await res.json()) as T
}

export const supabaseRest = {
  isEnabled,
  async select<T>(table: string, query: string) {
    // query example: `?name=eq.오도이촌&select=*`
    return await rest<T>(`/${table}${query}`)
  },
  async insert<T>(table: string, payload: unknown) {
    return await rest<T>(`/${table}?select=*`, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    })
  },
  async upsert<T>(table: string, payload: unknown) {
    return await rest<T>(`/${table}?select=*`, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload)
    })
  },
  async update<T>(table: string, payload: unknown, query: string) {
    // query example: `?id=eq.xxx`
    return await rest<T>(`/${table}${query}&select=*`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    })
  },
  async delete<T>(table: string, query: string) {
    return await rest<T>(`/${table}${query}`, {
      method: 'DELETE'
    })
  }
}

export type SupabaseCampground = {
  id: string
  name: string
  owner_name: string | null
  owner_email: string | null
  contact_phone: string | null
  contact_email: string | null
  address: string | null
  description: string | null
  guidelines?: string | null
  admin_password?: string | null
  status: 'active' | 'pending' | 'suspended' | 'terminated'
  subscription_plan: 'basic' | 'premium' | 'enterprise'
  admin_url: string
  kiosk_url: string
  created_at: string
  updated_at: string
}

