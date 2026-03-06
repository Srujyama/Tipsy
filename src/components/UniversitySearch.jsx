import { useState, useEffect, useRef, useCallback } from 'react'
import { GraduationCap, X, ChevronDown } from 'lucide-react'

// ─── Alias map ────────────────────────────────────────────────────────────────
// Maps every common nickname / abbreviation to the exact CSV name.
// Keys are lowercase. Values are the canonical CSV display name.
const ALIASES = {
  // UC system
  'uc berkeley': 'University of California, Berkeley',
  'cal': 'University of California, Berkeley',
  'berkeley': 'University of California, Berkeley',
  'ucb': 'University of California, Berkeley',
  'ucla': 'University of California, Los Angeles',
  'uc la': 'University of California, Los Angeles',
  'uc san diego': 'University of California, San Diego',
  'ucsd': 'University of California, San Diego',
  'uc davis': 'University of California, Davis',
  'ucd': 'University of California, Davis',
  'uc santa barbara': 'University of California, Santa Barbara',
  'ucsb': 'University of California, Santa Barbara',
  'uc irvine': 'University of California, Irvine',
  'uci': 'University of California, Irvine',
  'uc santa cruz': 'University of California, Santa Cruz',
  'ucsc': 'University of California, Santa Cruz',
  'uc riverside': 'University of California, Riverside',
  'ucr': 'University of California, Riverside',
  'uc merced': 'University of California, Merced',
  // CSU system
  'san jose state': 'San Jose State University',
  'sjsu': 'San Jose State University',
  'cal poly': 'California Polytechnic State University, San Luis Obispo',
  'cal poly slo': 'California Polytechnic State University, San Luis Obispo',
  'cal poly pomona': 'California State Polytechnic University, Pomona',
  'sdsu': 'San Diego State University',
  'sfsu': 'San Francisco State University',
  'csuf': 'California State University, Fullerton',
  'csulb': 'California State University, Long Beach',
  'csun': 'California State University, Northridge',
  // Ivy League & top privates
  'harvard': 'Harvard University',
  'mit': 'Massachusetts Institute of Technology',
  'stanford': 'Stanford University',
  'yale': 'Yale University',
  'princeton': 'Princeton University',
  'columbia': 'Columbia University',
  'upenn': 'University of Pennsylvania',
  'penn': 'University of Pennsylvania',
  'brown': 'Brown University',
  'dartmouth': 'Dartmouth College',
  'cornell': 'Cornell University',
  'duke': 'Duke University',
  'nyu': 'New York University',
  'usc': 'University of Southern California',
  'carnegie mellon': 'Carnegie Mellon University',
  'cmu': 'Carnegie Mellon University',
  'caltech': 'California Institute of Technology',
  'georgia tech': 'Georgia Institute of Technology',
  'gatech': 'Georgia Institute of Technology',
  'jhu': 'Johns Hopkins University',
  'johns hopkins': 'Johns Hopkins University',
  'northwestern': 'Northwestern University',
  'notre dame': 'University of Notre Dame',
  'vanderbilt': 'Vanderbilt University',
  'emory': 'Emory University',
  'georgetown': 'Georgetown University',
  'tufts': 'Tufts University',
  'bu': 'Boston University',
  'bc': 'Boston College',
  'northeastern': 'Northeastern University',
  'rice': 'Rice University',
  'tulane': 'Tulane University',
  'wake forest': 'Wake Forest University',
  'lehigh': 'Lehigh University',
  'villanova': 'Villanova University',
  'fordham': 'Fordham University',
  'american': 'American University',
  'gw': 'George Washington University',
  'gwu': 'George Washington University',
  'george washington': 'George Washington University',
  // Big state schools
  'michigan': 'University of Michigan',
  'umich': 'University of Michigan',
  'u of m': 'University of Michigan',
  'michigan state': 'Michigan State University',
  'msu': 'Michigan State University',
  'ohio state': 'Ohio State University',
  'osu': 'Ohio State University',
  'penn state': 'Pennsylvania State University',
  'psu': 'Pennsylvania State University',
  'unc': 'University of North Carolina at Chapel Hill',
  'unc chapel hill': 'University of North Carolina at Chapel Hill',
  'chapel hill': 'University of North Carolina at Chapel Hill',
  'nc state': 'North Carolina State University',
  'ncsu': 'North Carolina State University',
  'virginia': 'University of Virginia',
  'uva': 'University of Virginia',
  'virginia tech': 'Virginia Polytechnic Institute and State University',
  'vt': 'Virginia Polytechnic Institute and State University',
  'vtech': 'Virginia Polytechnic Institute and State University',
  'florida': 'University of Florida',
  'uf': 'University of Florida',
  'florida state': 'Florida State University',
  'fsu': 'Florida State University',
  'miami': 'University of Miami',
  'ucf': 'University of Central Florida',
  'fiu': 'Florida International University',
  'usf': 'University of South Florida',
  'texas': 'University of Texas at Austin',
  'ut austin': 'University of Texas at Austin',
  'longhorns': 'University of Texas at Austin',
  'texas a&m': 'Texas A&M University',
  'tamu': 'Texas A&M University',
  'a&m': 'Texas A&M University',
  'ut dallas': 'University of Texas at Dallas',
  'utd': 'University of Texas at Dallas',
  'baylor': 'Baylor University',
  'tcu': 'Texas Christian University',
  'smu': 'Southern Methodist University',
  'washington': 'University of Washington',
  'uw': 'University of Washington',
  'uw seattle': 'University of Washington',
  'wsu': 'Washington State University',
  'washington state': 'Washington State University',
  'oregon': 'University of Oregon',
  'oregon state': 'Oregon State University',
  'arizona': 'University of Arizona',
  'u of a': 'University of Arizona',
  'asu': 'Arizona State University, Tempe Campus',
  'arizona state': 'Arizona State University, Tempe Campus',
  'colorado': 'University of Colorado Boulder',
  'cu boulder': 'University of Colorado Boulder',
  'colorado state': 'Colorado State University',
  'utah': 'University of Utah',
  'byu': 'Brigham Young University',
  'illinois': 'University of Illinois at Urbana-Champaign',
  'uiuc': 'University of Illinois at Urbana-Champaign',
  'purdue': 'Purdue University',
  'indiana': 'Indiana University',
  'iu': 'Indiana University',
  'iowa': 'University of Iowa',
  'iowa state': 'Iowa State University',
  'minnesota': 'University of Minnesota, Twin Cities',
  'umn': 'University of Minnesota, Twin Cities',
  'wisconsin': 'University of Wisconsin, Madison',
  'uwm': 'University of Wisconsin, Madison',
  'uw madison': 'University of Wisconsin, Madison',
  'nebraska': 'University of Nebraska, Lincoln',
  'unl': 'University of Nebraska, Lincoln',
  'kansas': 'University of Kansas',
  'ku': 'University of Kansas',
  'kansas state': 'Kansas State University',
  'k-state': 'Kansas State University',
  'missouri': 'University of Missouri',
  'mizzou': 'University of Missouri',
  'oklahoma': 'University of Oklahoma',
  'ou': 'University of Oklahoma',
  'oklahoma state': 'Oklahoma State University',
  'arkansas': 'University of Arkansas',
  'lsu': 'Louisiana State University',
  'mississippi': 'University of Mississippi',
  'ole miss': 'University of Mississippi',
  'mississippi state': 'Mississippi State University',
  'auburn': 'Auburn University',
  'alabama': 'University of Alabama',
  'bama': 'University of Alabama',
  'tennessee': 'University of Tennessee',
  'ut knoxville': 'University of Tennessee',
  'kentucky': 'University of Kentucky',
  'uk': 'University of Kentucky',
  'louisville': 'University of Louisville',
  'georgia': 'University of Georgia',
  'uga': 'University of Georgia',
  'ga tech': 'Georgia Institute of Technology',
  'clemson': 'Clemson University',
  'south carolina': 'University of South Carolina',
  'maryland': 'University of Maryland',
  'umd': 'University of Maryland',
  'rutgers': 'Rutgers, the State University of New Jersey',
  'rutgers nj': 'Rutgers, the State University of New Jersey',
  'stony brook': 'State University of New York at Stony Brook',
  'suny stony brook': 'State University of New York at Stony Brook',
  'buffalo': 'State University of New York at Buffalo',
  'suny buffalo': 'State University of New York at Buffalo',
  'ub': 'State University of New York at Buffalo',
  'pittsburgh': 'University of Pittsburgh',
  'pitt': 'University of Pittsburgh',
  'drexel': 'Drexel University',
  'temple': 'Temple University',
  'connecticut': 'University of Connecticut',
  'uconn': 'University of Connecticut',
  'umass': 'University of Massachusetts Amherst',
  'umass amherst': 'University of Massachusetts Amherst',
  'new hampshire': 'University of New Hampshire',
  'unh': 'University of New Hampshire',
  'vermont': 'University of Vermont',
  'uvm': 'University of Vermont',
  'maine': 'University of Maine',
  'rhode island': 'University of Rhode Island',
  'uri': 'University of Rhode Island',
}

// ─── CSV parser (no library needed) ─────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split('\n')
  const universities = []
  for (const line of lines) {
    if (!line.trim()) continue
    // CSV format: country,name,url  — names may be quoted with commas inside
    const match = line.match(/^([^,]+),"?([^"]+)"?,/)
    if (match) {
      universities.push({ country: match[1].trim(), name: match[2].trim() })
    }
  }
  return universities
}

// ─── Search logic ─────────────────────────────────────────────────────────────
function searchUniversities(query, universities, limit = 8) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase().trim()

  // 1. Check alias map first — exact alias match → inject canonical name
  const aliasMatch = ALIASES[q]

  const results = new Map() // name → score

  for (const u of universities) {
    const name = u.name
    const nameLower = name.toLowerCase()
    let score = 0

    // Exact alias match gets highest priority
    if (aliasMatch && nameLower === aliasMatch.toLowerCase()) {
      score = 1000
    } else if (nameLower === q) {
      score = 900
    } else if (nameLower.startsWith(q)) {
      score = 800
    } else {
      // Check if any alias points to this university and starts with the query
      for (const [alias, canonical] of Object.entries(ALIASES)) {
        if (canonical.toLowerCase() === nameLower && alias.startsWith(q)) {
          score = Math.max(score, 750)
        }
      }
      // Contains the query string
      if (nameLower.includes(q)) {
        score = Math.max(score, 600)
      }
      // All words in query appear somewhere in the name
      const words = q.split(/\s+/).filter(Boolean)
      if (words.length > 1 && words.every(w => nameLower.includes(w))) {
        score = Math.max(score, 500)
      }
      // Partial word match
      if (words.some(w => w.length >= 3 && nameLower.includes(w))) {
        score = Math.max(score, 200)
      }
    }

    if (score > 0) {
      // US schools get +100 priority boost
      const boost = u.country === 'US' ? 100 : 0
      results.set(name, (results.get(name) || 0) + score + boost)
    }
  }

  return [...results.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name)
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function UniversitySearch({ value, onChange, inputStyle, placeholder = 'Search your university…' }) {
  const [universities, setUniversities] = useState([])
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  // Load CSV once
  useEffect(() => {
    fetch('/world-universities.csv')
      .then(r => r.text())
      .then(text => setUniversities(parseCSV(text)))
      .catch(() => {/* silently fail — degrade to plain text */})
  }, [])

  // Sync external value changes (e.g. profile load)
  useEffect(() => {
    if (value !== undefined && value !== query) setQuery(value || '')
  }, [value])

  // Run search whenever query changes
  useEffect(() => {
    if (universities.length === 0) return
    const r = searchUniversities(query, universities)
    setResults(r)
    setOpen(r.length > 0 && focused)
    setHighlightIdx(-1)
  }, [query, universities, focused])

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = useCallback((name) => {
    setQuery(name)
    onChange(name)
    setOpen(false)
    setFocused(false)
  }, [onChange])

  const clear = useCallback(() => {
    setQuery('')
    onChange('')
    setOpen(false)
    inputRef.current?.focus()
  }, [onChange])

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault()
      select(results[highlightIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {/* Input row */}
      <div
        style={{
          ...inputStyle,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.7rem 0.875rem',
          borderColor: focused ? '#f5c842' : inputStyle?.borderColor || 'var(--border)',
          boxShadow: focused ? '0 0 0 3px rgba(245,200,66,0.1)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        <GraduationCap size={15} style={{ color: focused ? '#f5c842' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.2s' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={e => {
            setQuery(e.target.value)
            onChange(e.target.value)
          }}
          onFocus={() => {
            setFocused(true)
            if (results.length > 0) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontSize: '0.875rem',
            minWidth: 0,
          }}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); clear() }}
            style={{ color: 'var(--text-muted)', flexShrink: 0, lineHeight: 0 }}
          >
            <X size={14} />
          </button>
        )}
        {!query && (
          <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.5 }} />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid rgba(245,200,66,0.3)',
            borderRadius: '0.875rem',
            overflow: 'hidden',
            zIndex: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {results.map((name, i) => (
            <button
              key={name}
              type="button"
              onMouseDown={e => { e.preventDefault(); select(name) }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.65rem 0.875rem',
                fontSize: '0.8125rem',
                color: i === highlightIdx ? '#f5c842' : 'var(--text)',
                backgroundColor: i === highlightIdx ? 'rgba(245,200,66,0.08)' : 'transparent',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background-color 0.15s, color 0.15s',
                cursor: 'pointer',
                lineHeight: 1.4,
              }}
              onMouseEnter={() => setHighlightIdx(i)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
