import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function EmailConfirm() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Supabase puts the token in the URL hash when redirecting from email confirmation
    // It can come as ?token_hash=... or #access_token=... depending on the flow
    async function handleConfirm() {
      const hash = window.location.hash
      const params = new URLSearchParams(window.location.search)

      // PKCE flow: token_hash + type=email
      const tokenHash = params.get('token_hash')
      const type = params.get('type')

      if (tokenHash && type === 'email') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        })
        if (error) {
          setErrorMsg(error.message)
          setStatus('error')
        } else {
          // Sign out immediately so the user lands on a clean login
          await supabase.auth.signOut()
          setStatus('success')
        }
        return
      }

      // Legacy implicit flow: access_token in hash
      if (hash && hash.includes('access_token')) {
        // Supabase JS SDK automatically handles this via onAuthStateChange
        // Just sign out and show success
        setTimeout(async () => {
          await supabase.auth.signOut()
          setStatus('success')
        }, 800)
        return
      }

      // No token found — maybe they landed here directly
      setStatus('success') // show the sign-in prompt anyway
    }

    handleConfirm()
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #f5c842, #f0a020)', boxShadow: '0 8px 24px rgba(245,200,66,0.4)' }}
          >
            <span className="text-2xl font-black" style={{ color: '#0a0c14' }}>B</span>
          </div>
        </div>

        <div
          className="rounded-3xl border p-8 text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {status === 'verifying' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader size={40} className="animate-spin" color="#f5c842" />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Verifying…</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Confirming your email address</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Email confirmed!</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Your account is verified. Head back to BuzzBoard and sign in with your credentials.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #f5c842, #f0a020)',
                  color: '#0a0c14',
                  boxShadow: '0 6px 20px rgba(245,200,66,0.35)',
                }}
              >
                Sign In →
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.12)' }}
              >
                <XCircle size={32} color="#ef4444" />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Link expired</h2>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                This confirmation link has expired or already been used.
              </p>
              {errorMsg && (
                <p className="text-xs mb-5 font-mono" style={{ color: '#ef4444' }}>{errorMsg}</p>
              )}
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3.5 rounded-xl font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #f5c842, #f0a020)',
                  color: '#0a0c14',
                  boxShadow: '0 6px 20px rgba(245,200,66,0.35)',
                }}
              >
                Try signing up again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
