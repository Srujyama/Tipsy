import { getBACStatus } from '../utils/bac'

const colorMap = {
  'buzz-safe': '#10b981',
  'buzz-primary': '#f5c842',
  'buzz-warning': '#f97316',
  'buzz-danger': '#ef4444',
}

export default function BACMeter({ bac }) {
  const safeBac = isNaN(bac) || bac == null ? 0 : bac
  const status = getBACStatus(safeBac)
  const percentage = Math.min(safeBac / 0.12, 1)
  const strokeColor = colorMap[status.color] || '#10b981'

  const radius = 88
  const circumference = Math.PI * radius
  const offset = circumference - percentage * circumference

  // Tick marks at 0, 0.02, 0.04, 0.06, 0.08, 0.10, 0.12
  const ticks = [0, 0.02, 0.04, 0.06, 0.08, 0.10, 0.12]

  function tickPosition(val) {
    const t = val / 0.12
    const angle = Math.PI + t * Math.PI // 180deg to 360deg (left to right)
    const cx = 110, cy = 110
    const innerR = 74, outerR = 82
    return {
      x1: cx + innerR * Math.cos(angle),
      y1: cy + innerR * Math.sin(angle),
      x2: cx + outerR * Math.cos(angle),
      y2: cy + outerR * Math.sin(angle),
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="124" viewBox="0 0 220 124">
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f5c842" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={`M 22 110 A 88 88 0 0 1 198 110`}
          fill="none"
          stroke="var(--bg-input)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Gradient track (full, clipped by dash) */}
        <path
          d={`M 22 110 A 88 88 0 0 1 198 110`}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Tick marks */}
        {ticks.map((val) => {
          const { x1, y1, x2, y2 } = tickPosition(val)
          return (
            <line
              key={val}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--border)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )
        })}

        {/* Needle dot */}
        {safeBac > 0 && (() => {
          const angle = Math.PI + percentage * Math.PI
          const cx = 110, cy = 110
          const nx = cx + 88 * Math.cos(angle)
          const ny = cy + 88 * Math.sin(angle)
          return (
            <circle
              cx={nx} cy={ny} r="5"
              fill={strokeColor}
              style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 6px ${strokeColor})` }}
            />
          )
        })()}
      </svg>

      {/* Value display */}
      <div className="-mt-16 text-center pointer-events-none">
        <p
          className="text-4xl font-black tabular-nums leading-none"
          style={{ color: strokeColor, textShadow: `0 0 20px ${strokeColor}40`, transition: 'color 0.4s ease' }}
        >
          {safeBac.toFixed(3)}
        </p>
        <p
          className="text-sm font-semibold mt-1"
          style={{ color: strokeColor, transition: 'color 0.4s ease' }}
        >
          {status.message}
        </p>
      </div>
    </div>
  )
}
