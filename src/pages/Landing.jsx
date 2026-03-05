import { Link } from 'react-router-dom'
import { Shield, Users, BarChart3, Wine, Zap, ChevronRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

const features = [
  {
    icon: Wine,
    title: 'Real-Time BAC',
    desc: 'Personalized blood alcohol tracking using the Watson et al. 1981 formula, calibrated to your body.',
    color: '#f5c842',
    bg: 'rgba(245,200,66,0.1)',
  },
  {
    icon: Shield,
    title: 'Know Your Limits',
    desc: 'Drink limits fine-tuned over your first 3 sessions. Science says everyone metabolizes differently.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
  },
  {
    icon: Users,
    title: 'Stay Accountable',
    desc: 'Friends get notified when you exceed your limit. Look out for each other on a night out.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
  },
]

export default function Landing() {
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex justify-between items-center px-6 py-4"
        style={{
          backgroundColor: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span className="font-black text-xl tracking-tight">
          <span style={{ color: '#f5c842' }}>Buzz</span>
          <span style={{ color: 'var(--text)' }}>Board</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold px-4 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Log in
          </Link>
          <button
            onClick={toggle}
            className="p-2 rounded-full border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5">
        {/* Hero */}
        <div className="text-center pt-14 pb-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6"
            style={{
              background: 'rgba(245,200,66,0.12)',
              color: '#f5c842',
              border: '1px solid rgba(245,200,66,0.25)',
            }}
          >
            <Zap size={11} fill="#f5c842" />
            Science-backed · Research papers
          </div>

          <h1
            className="text-5xl font-black leading-tight mb-4 tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            Know when<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #f5c842 0%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              to stop.
            </span>
          </h1>

          <p className="text-base leading-relaxed mb-8 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Real-time BAC tracking built for college students. Drink smarter, stay safer, and look out for your crew.
          </p>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #f5c842, #f0b429)',
              color: '#0a0c14',
              boxShadow: '0 8px 24px rgba(245,200,66,0.35)',
            }}
          >
            Get Started Free
            <ChevronRight size={16} />
          </Link>

          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Free forever · No credit card needed
          </p>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-3 gap-0 rounded-2xl mb-8 overflow-hidden border"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          {[
            { val: '0.08%', label: 'Legal limit' },
            { val: '3 sess', label: 'Calibration' },
            { val: '100%', label: 'Free' },
          ].map(({ val, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center py-5 px-3"
              style={{
                borderRight: i < 2 ? '1px solid var(--border)' : undefined,
              }}
            >
              <span className="font-black text-lg" style={{ color: '#f5c842' }}>{val}</span>
              <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="flex flex-col gap-3 mb-8">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl p-5 border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: bg }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="rounded-2xl p-6 mb-4 text-center border"
          style={{
            background: dark
              ? 'linear-gradient(135deg, #1a2035, #111827)'
              : 'linear-gradient(135deg, #f0f2f8, #e8ecf4)',
            borderColor: 'var(--border)',
          }}
        >
          <p className="font-bold mb-1" style={{ color: 'var(--text)' }}>
            Already have an account?
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Sign back in and pick up where you left off.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm border"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text)',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            Log In
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs pb-8" style={{ color: 'var(--text-muted)' }}>
          🛡️ BuzzBoard promotes safe drinking. Never drink and drive.
        </p>
      </div>
    </div>
  )
}
