import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn, user } = useAuth()
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
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link to="/signup" className="font-semibold" style={{ color: '#f59e0b' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
