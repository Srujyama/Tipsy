import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable Web Locks — avoids NavigatorLockAcquireTimeoutError in
    // environments where the lock is held by another context (e.g. extensions)
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
})
