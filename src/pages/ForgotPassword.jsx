import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { Moon, Sun, Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const { dark, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

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
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
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
            Reset password
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            We'll email you a reset link
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {sent ? (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.12)' }}
              >
                <CheckCircle size={28} style={{ color: '#10b981' }} />
              </div>
              <p className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>Check your inbox</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                We sent a reset link to <span className="font-semibold" style={{ color: '#f59e0b' }}>{email}</span>
              </p>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                Didn't get it? Check spam or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold underline"
                  style={{ color: '#f59e0b' }}
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                  Email
                </label>
                <div style={inputWrap(focusedField === 'email')}>
                  <Mail size={15} style={{ color: focusedField === 'email' ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }} />
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                style={{ background: '#f59e0b', color: '#09090b' }}
              >
                {loading ? 'Sending…' : (<>Send reset link <ArrowRight size={15} /></>)}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link to="/login" className="font-semibold flex items-center justify-center gap-1" style={{ color: '#f59e0b' }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
