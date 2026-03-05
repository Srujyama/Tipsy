import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { calculateLimits } from '../utils/bac'
import toast from 'react-hot-toast'

export default function Onboarding() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [gender, setGender] = useState('')
  const [feet, setFeet] = useState('')
  const [inches, setInches] = useState('')
  const [weight, setWeight] = useState('')
  const [university, setUniversity] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const heightInches = parseInt(feet) * 12 + parseInt(inches || 0)
    const weightLbs = parseInt(weight)

    if (!gender || !heightInches || !weightLbs) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    const limits = calculateLimits(weightLbs, gender)

    const { error } = await updateProfile({
      biological_gender: gender,
      height_inches: heightInches,
      weight_lbs: weightLbs,
      university_name: university || null,
      calculated_low_limit: limits.low,
      calculated_med_limit: limits.med,
      calculated_high_limit: limits.high,
      onboarding_complete: true,
    })

    setLoading(false)
    if (error) {
      toast.error('Failed to save profile: ' + error.message)
    } else {
      toast.success('Profile set up!')
      navigate('/dashboard')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    color: 'var(--text)',
    outline: 'none',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-1">
            <span className="text-buzz-primary">Buzz</span>
            <span style={{ color: 'var(--text)' }}>Board</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Let's personalize your experience</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-20 rounded-full transition-colors ${
                s <= step ? 'bg-buzz-primary' : ''
              }`}
              style={s > step ? { backgroundColor: 'var(--border)' } : {}}
            />
          ))}
        </div>

        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  Biological Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-3 rounded-xl border text-center capitalize font-semibold transition-all ${
                        gender === g
                          ? 'border-buzz-primary bg-buzz-primary/10 text-buzz-primary'
                          : ''
                      }`}
                      style={gender !== g ? { borderColor: 'var(--border)', color: 'var(--text)' } : {}}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Used for BAC calculation (Watson et al. 1981 body water ratios)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Height</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    min="3" max="8"
                    placeholder="Feet"
                    style={{ ...inputStyle, width: '50%' }}
                    onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                  <input
                    type="number"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    min="0" max="11"
                    placeholder="Inches"
                    style={{ ...inputStyle, width: '50%' }}
                    onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Weight (lbs)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="80" max="500"
                  placeholder="Weight in pounds"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!gender || !feet || !weight) {
                    toast.error('Please fill in gender, height, and weight')
                    return
                  }
                  setStep(2)
                }}
                className="w-full py-3 bg-buzz-primary text-gray-950 font-bold rounded-xl hover:bg-amber-400 transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  University <span className="font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. State University"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>For leaderboard grouping</p>
              </div>

              {feet && weight && gender && (() => {
                const limits = calculateLimits(parseInt(weight), gender)
                return (
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                    <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Your Estimated Limits</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-buzz-safe">Low (feeling it)</span>
                        <span className="font-bold" style={{ color: 'var(--text)' }}>{limits.low} drinks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-buzz-primary">Medium (buzzed)</span>
                        <span className="font-bold" style={{ color: 'var(--text)' }}>{limits.med} drinks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-buzz-danger">High (legal limit)</span>
                        <span className="font-bold" style={{ color: 'var(--text)' }}>{limits.high} drinks</span>
                      </div>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      Fine-tuned over your first 3 sessions
                    </p>
                  </div>
                )
              })()}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border font-semibold transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-buzz-primary text-gray-950 font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
