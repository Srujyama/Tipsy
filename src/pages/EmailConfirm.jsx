import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function EmailConfirm() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function handleConfirm() {
      const hash = window.location.hash
      const params = new URLSearchParams(window.location.search)

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
          await supabase.auth.signOut()
          setStatus('success')
        }
        return
      }

      if (hash && hash.includes('access_token')) {
        setTimeout(async () => {
          await supabase.auth.signOut()
          setStatus('success')
        }, 800)
        return
      }

      setStatus('success')
    }

    handleConfirm()
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#f59e0b' }}
          >
            <span className="text-2xl font-black" style={{ color: '#09090b' }}>t</span>
          </div>
        </div>

        <div
          className="rounded-3xl border p-8 text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {status === 'verifying' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader size={40} className="animate-spin" color="#f59e0b" />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Verifying...</h2>
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
                Your account is verified. Head back to Tipsy and sign in with your credentials.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl font-bold text-sm"
                style={{ backgroundColor: '#f59e0b', color: '#09090b' }}
              >
                Sign In
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
                style={{ backgroundColor: '#f59e0b', color: '#09090b' }}
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
