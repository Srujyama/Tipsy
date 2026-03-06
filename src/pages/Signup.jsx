import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Signup() {
  const { signUp, user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [alreadyExists, setAlreadyExists] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password, displayName)
    setLoading(false)
    if (error) {
      if (
        error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('user already exists') ||
        error.message?.toLowerCase().includes('email address is already')
      ) {
        toast.error('An account with that email already exists.')
        setAlreadyExists(true)
      } else {
        toast.error(error.message)
      }
    } else {
      setEmailSent(true)
    }
  }

  const inputWrap = (isFocused) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-input)',
    border: `1.5px solid ${isFocused ? '#f59e0b' : 'var(--border)'}`,
    borderRadius: '0.875rem',
    transition: 'border-color 0.2s ease',
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--bg)' }}
    >
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
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#f59e0b' }}
          >
            <span className="text-2xl font-black" style={{ color: '#09090b' }}>t</span>
          </div>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text)' }}>
            Create account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Join Tipsy — it's free
          </p>
        </div>

        {emailSent ? (
          <div
            className="rounded-3xl border p-8 text-center"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <CheckCircle size={32} color="#10b981" />
            </div>
            <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Check your email</h2>
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              We sent a confirmation link to
            </p>
            <p className="text-sm font-bold mb-5" style={{ color: '#f59e0b' }}>{email}</p>
            <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Click the link in the email to verify your account, then come back here and sign in with your credentials.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: '#f59e0b', color: '#09090b' }}
            >
              Go to Sign In <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div
              className="rounded-3xl border p-6"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Display Name
                  </label>
                  <div style={inputWrap(focusedField === 'name')}>
                    <User size={16} style={{ color: focusedField === 'name' ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder="Your name"
                      style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Email
                  </label>
                  <div style={inputWrap(focusedField === 'email')}>
                    <Mail size={16} style={{ color: focusedField === 'email' ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }} />
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Password
                  </label>
                  <div style={inputWrap(focusedField === 'password')}>
                    <Lock size={16} style={{ color: focusedField === 'password' ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                  style={{ backgroundColor: '#f59e0b', color: '#09090b' }}
                >
                  {loading ? 'Creating account...' : (<>Create Account <ArrowRight size={16} /></>)}
                </button>
              </form>
            </div>

            {alreadyExists && (
              <div
                className="mt-3 rounded-2xl border p-4 flex items-center justify-between gap-3"
                style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text)' }}>
                  Already have an account?
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl font-bold text-sm shrink-0"
                  style={{ backgroundColor: '#f59e0b', color: '#09090b' }}
                >
                  Sign In
                </button>
              </div>
            )}

            <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold" style={{ color: '#f59e0b' }}>
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
