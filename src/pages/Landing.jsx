import { Link } from 'react-router-dom'
import { Shield, Users, Zap } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Real-time BAC',
    desc: 'Personalized blood alcohol tracking using the Watson 1981 formula, calibrated to your weight and body.',
    color: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Know your limits',
    desc: 'Your limits sharpen across your first three sessions. Science knows everyone metabolizes differently.',
    color: '#22c55e',
  },
  {
    icon: Users,
    title: 'Stay accountable',
    desc: "Friends see when you exceed your limit. Look out for each other — that's the point.",
    color: '#a78bfa',
  },
]

export default function Landing() {
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex justify-between items-center px-6 py-4"
        style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>
          tipsy
        </span>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Sign in
          </Link>
          <button
            onClick={toggle}
            className="p-2 rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5">
        {/* Hero */}
        <div className="pt-16 pb-12 text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-7"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Zap size={10} fill="var(--accent)" />
            Science-backed BAC tracking
          </div>

          <h1
            className="text-5xl font-black mb-4"
            style={{ color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1.05 }}
          >
            Drink smarter.<br />
            <span style={{ color: 'var(--accent)' }}>Stay safer.</span>
          </h1>

          <p className="text-base leading-relaxed mb-8 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Real-time BAC for college students. Know when you're at your limit before you go past it.
          </p>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm"
            style={{ background: 'var(--accent)', color: '#09090b' }}
          >
            Get started free
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Free · No card needed
          </p>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-3 rounded-2xl mb-8 overflow-hidden"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          {[
            { val: '0.08%', label: 'Legal limit' },
            { val: '3', label: 'Calibration nights' },
            { val: 'Free', label: 'Always' },
          ].map(({ val, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center py-5"
              style={{ borderRight: i < 2 ? '1px solid var(--border)' : undefined }}
            >
              <span className="font-black text-base" style={{ color: 'var(--accent)', letterSpacing: '-0.02em' }}>{val}</span>
              <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-2.5 mb-10">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl p-4"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}14` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text)' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA bottom */}
        <div
          className="rounded-2xl p-5 mb-4 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>Already have an account?</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Pick up where you left off.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Sign in
          </Link>
        </div>

        <p className="text-center text-xs pb-8" style={{ color: 'var(--text-muted)' }}>
          Tipsy — never drink and drive.
        </p>
      </div>
    </div>
  )
}
