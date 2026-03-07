import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn, signInWithGoogle, signInWithApple, user } = useAuth()
  const { dark, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) toast.error(error.message)
  }

  const inputWrap = (isFocused) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0.7rem 0.875rem',
    backgroundColor: 'var(--bg-input)',
    border: `1px solid ${isFocused ? '#f59e0b' : 'var(--border)'}`,
    borderRadius: '12px',
    transition: 'border-color 0.15s ease',
    boxShadow: isFocused ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 page-enter"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="fixed top-4 right-4">
        <button
          onClick={toggle}
          className="p-2 rounded-lg border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p
            className="text-3xl font-black mb-1"
            style={{ color: 'var(--text)', letterSpacing: '-0.04em' }}
          >
            tipsy
          </p>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Sign in to your account
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <div style={inputWrap(focusedField === 'email')}>
                <Mail size={15} style={{ color: focusedField === 'email' ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  required placeholder="you@email.com"
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div style={inputWrap(focusedField === 'password')}>
                <Lock size={15} style={{ color: focusedField === 'password' ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  required placeholder="Your password"
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
              style={{ background: '#f59e0b', color: '#09090b' }}
            >
              {loading ? 'Signing in…' : (<>Sign in <ArrowRight size={15} /></>)}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>OR</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => signInWithGoogle().then(({ error }) => error && toast.error(error.message))}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 border"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-input)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button
              onClick={() => signInWithApple().then(({ error }) => error && toast.error(error.message))}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 border"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-input)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Continue with Apple
            </button>
          </div>
        </div>

        <p className="text-center mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link to="/forgot-password" className="font-semibold" style={{ color: 'var(--text-muted)' }}>
            Forgot password?
          </Link>
        </p>

        <p className="text-center mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link to="/signup" className="font-semibold" style={{ color: '#f59e0b' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
