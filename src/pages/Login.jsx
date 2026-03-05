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
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-input)',
    border: `1.5px solid ${isFocused ? '#f5c842' : 'var(--border)'}`,
    borderRadius: '0.875rem',
    transition: 'border-color 0.2s ease',
    boxShadow: isFocused ? '0 0 0 3px rgba(245,200,66,0.12)' : 'none',
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Theme toggle */}
      <div className="fixed top-4 right-4">
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #f5c842, #f0a020)', boxShadow: '0 8px 24px rgba(245,200,66,0.4)' }}
          >
            <span className="text-2xl font-black" style={{ color: '#0a0c14' }}>B</span>
          </div>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text)' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Sign in to your BuzzBoard account
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <div style={inputWrap(focusedField === 'email')}>
                <Mail size={16} style={{ color: focusedField === 'email' ? '#f5c842' : 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="you@email.com"
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div style={inputWrap(focusedField === 'password')}>
                <Lock size={16} style={{ color: focusedField === 'password' ? '#f5c842' : 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Your password"
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{
                background: 'linear-gradient(135deg, #f5c842, #f0a020)',
                color: '#0a0c14',
                boxShadow: '0 6px 20px rgba(245,200,66,0.35)',
              }}
            >
              {loading ? 'Signing in...' : (<>Log In <ArrowRight size={16} /></>)}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold" style={{ color: '#f5c842' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
