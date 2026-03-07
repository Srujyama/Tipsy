import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { Moon, Sun, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    // Supabase puts recovery tokens in the URL hash – just check we have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
    })
  }, [])

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

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 2500)
    }
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center max-w-sm">
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Invalid or expired link</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>This password reset link has expired or is invalid.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: '#f59e0b', color: '#09090b' }}
          >
            Request new link
          </button>
        </div>
      </div>
    )
  }

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
          <p className="text-3xl font-black mb-1" style={{ color: 'var(--text)', letterSpacing: '-0.04em' }}>
            tipsy
          </p>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            New password
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Enter your new password below
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {done ? (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.12)' }}
              >
                <CheckCircle size={28} style={{ color: '#10b981' }} />
              </div>
              <p className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>Password updated!</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Redirecting you to the app…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                  New Password
                </label>
                <div style={inputWrap(focusedField === 'password')}>
                  <Lock size={15} style={{ color: focusedField === 'password' ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="Min 6 characters"
                    style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                  Confirm Password
                </label>
                <div style={inputWrap(focusedField === 'confirm')}>
                  <Lock size={15} style={{ color: focusedField === 'confirm' ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="Repeat password"
                    style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                  />
                </div>
                {confirm && password !== confirm && (
                  <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>Passwords don't match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (confirm && password !== confirm)}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                style={{ background: '#f59e0b', color: '#09090b' }}
              >
                {loading ? 'Updating…' : (<>Update password <ArrowRight size={15} /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
