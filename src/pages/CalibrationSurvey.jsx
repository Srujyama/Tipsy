import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { calculateLimits } from '../utils/bac'
import toast from 'react-hot-toast'

export default function CalibrationSurvey() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')

  const [drinksConsumed, setDrinksConsumed] = useState('')
  const [feelingRating, setFeelingRating] = useState(3)
  const [couldHandleMore, setCouldHandleMore] = useState(null)
  const [loading, setLoading] = useState(false)

  const sessionNumber = (profile?.calibration_count || 0) + 1

  async function handleSubmit(e) {
    e.preventDefault()
    if (couldHandleMore === null) {
      toast.error('Please answer all questions')
      return
    }

    setLoading(true)

    const { error: calError } = await supabase
      .from('calibration_sessions')
      .insert({
        user_id: profile.id,
        session_number: sessionNumber,
        drinks_consumed: parseInt(drinksConsumed) || 0,
        feeling_rating: feelingRating,
        could_handle_more: couldHandleMore,
      })

    if (calError) {
      toast.error('Failed to save calibration')
      setLoading(false)
      return
    }

    const newCount = sessionNumber
    const updates = { calibration_count: newCount }

    if (newCount >= 3) {
      const baseLimits = calculateLimits(profile.weight_lbs, profile.biological_gender, profile.height_inches || null, profile.age || null)
      const { data: sessions } = await supabase
        .from('calibration_sessions')
        .select('*')
        .eq('user_id', profile.id)
        .order('session_number')

      if (sessions && sessions.length >= 3) {
        const handleMoreCount = sessions.filter((s) => s.could_handle_more).length
        const avgFeeling = sessions.reduce((s, c) => s + c.feeling_rating, 0) / sessions.length

        let adjustment = 0
        if (handleMoreCount >= 2 && avgFeeling >= 3) adjustment = 1
        else if (handleMoreCount === 0 && avgFeeling <= 2) adjustment = -1

        updates.calculated_low_limit = Math.max(1, baseLimits.low + adjustment)
        updates.calculated_med_limit = Math.max(2, baseLimits.med + adjustment)
        updates.calculated_high_limit = Math.min(baseLimits.high + adjustment, baseLimits.high)
      }
    }

    await updateProfile(updates)
    setLoading(false)
    toast.success(
      newCount >= 3
        ? 'Calibration complete! Your limits have been updated.'
        : `Calibration ${newCount}/3 saved.`
    )
    navigate(sessionId ? `/session/${sessionId}` : '/dashboard')
  }

  const feelings = [
    { value: 1, label: 'Awful' },
    { value: 2, label: 'Bad' },
    { value: 3, label: 'Okay' },
    { value: 4, label: 'Good' },
    { value: 5, label: 'Great' },
  ]

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text)' }}>Calibration</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Session {sessionNumber} of 3 — Help us fine-tune your limits
      </p>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i < sessionNumber ? '#f59e0b' : 'var(--border)' }}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drinks Consumed */}
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            How many drinks did you have tonight?
          </label>
          <input
            type="number"
            value={drinksConsumed}
            onChange={(e) => setDrinksConsumed(e.target.value)}
            min="0" max="30"
            required
            placeholder="0"
            className="w-full px-4 py-3 rounded-xl font-bold text-center text-lg"
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Feeling Rating */}
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            How did you feel overall?
          </label>
          <div className="flex gap-2">
            {feelings.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFeelingRating(value)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold border transition-all"
                style={
                  feelingRating === value
                    ? { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: '#f59e0b', color: '#f59e0b' }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-input)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Could Handle More */}
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Could you have handled more drinks?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setCouldHandleMore(val)}
                className="py-3 rounded-xl border font-semibold text-sm transition-all"
                style={
                  couldHandleMore === val
                    ? { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: '#f59e0b', color: '#f59e0b' }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-input)' }
                }
              >
                {val ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 font-bold rounded-2xl disabled:opacity-50 text-sm"
          style={{ backgroundColor: '#f59e0b', color: '#09090b' }}
        >
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
