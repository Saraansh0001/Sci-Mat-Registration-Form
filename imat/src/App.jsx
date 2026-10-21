import { useRef, useState } from 'react'
import { supabase, isDemo } from './supabase'

const BATCHES = ['2024', '2025', '2026']
const EMPTY = { fullName: '', batch: '', studentId: '' }

function validate(v) {
  const e = {}
  const name = v.fullName.trim().replace(/\s+/g, ' ')
  if (!name) e.fullName = 'Enter your full name.'
  else if (name.length < 2 || name.length > 80 || !/^\p{L}[\p{L}\s.'-]*$/u.test(name))
    e.fullName = 'Use letters only, between 2 and 80 characters.'
  if (!BATCHES.includes(v.batch)) e.batch = 'Select your batch.'
  if (!v.studentId.trim()) e.studentId = 'Enter your Student ID.'
  else if (!/^\d{4,12}$/.test(v.studentId.trim())) e.studentId = 'Use digits only, 4 to 12 characters.'
  return e
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-mute">{label}</label>
      {children}
      <p id={`${id}-err`} role="alert" className="mt-2 min-h-5 text-sm text-red-400">{error}</p>
    </div>
  )
}

export default function App() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | demo | error
  const [message, setMessage] = useState('')
  const lock = useRef(false)
  const loading = status === 'loading'

  const set = (k) => (ev) => {
    const next = { ...values, [k]: ev.target.value }
    setValues(next)
    if (errors[k]) setErrors((p) => ({ ...p, [k]: validate(next)[k] }))
    if (status === 'error') setStatus('idle')
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    if (lock.current) return // duplicate-submission guard (blocks double clicks / Enter spam)
    const errs = validate(values)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) return document.getElementById(first)?.focus()

    lock.current = true
    setStatus('loading')
    setMessage('')
    const row = {
      full_name: values.fullName.trim().replace(/\s+/g, ' '),
      batch: Number(values.batch),
      student_id: values.studentId.trim(),
    }
    let saved = false
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 700))
        setStatus('demo')
        return
      }
      const { error } = await supabase.from('registrations').insert(row)
      if (!error) {
        saved = true
        setStatus('success')
        return
      }
      setStatus('error')
      setMessage(
        error.code === '23505'
          ? 'This Student ID is already registered. If this is a mistake, contact the society team.'
          : 'Registration failed. Check your connection and try again.'
      )
    } catch {
      setStatus('error')
      setMessage('Registration failed. Check your connection and try again.')
    } finally {
      if (!saved) lock.current = false
    }
  }

  function reset() {
    lock.current = false
    setValues(EMPTY)
    setErrors({})
    setStatus('idle')
    setMessage('')
  }

  const done = status === 'success' || status === 'demo'

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-violet/25 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet/10 blur-[120px]" />

      {isDemo && (
        <div role="status" className="relative z-10 border-b border-line bg-panel px-6 py-2.5 text-center text-sm text-mute">
          Demo mode: Supabase is not configured, so registrations are <span className="font-medium text-white">not saved</span>.
        </div>
      )}

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-2.75rem)] max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20 lg:py-0">
        <section className="rise">
          <h1 className="whitespace-nowrap text-[clamp(3.5rem,18vw,10rem)] font-extrabold leading-[.8] tracking-[-0.06em] bg-gradient-to-b from-white via-volt to-violet bg-clip-text text-transparent">
            Sci-Mat
          </h1>
          <p className="mt-6 text-3xl font-medium tracking-tight sm:text-4xl">Open Society</p>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-mute">
            Join this year's members. Three details and you're on the list.
          </p>
        </section>

        <section className="rise lg:border-l lg:border-line lg:pl-16" style={{ animationDelay: '.15s' }} aria-live="polite">
          {done ? (
            <div className="max-w-md">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" strokeOpacity=".35" />
                <path className="draw" d="M7.5 12.5l3 3 6-7" />
              </svg>
              {status === 'success' ? (
                <>
                  <h2 className="mt-6 text-3xl font-semibold tracking-tight">You're registered.</h2>
                  <p className="mt-3 text-mute">{values.fullName.trim()}, batch {values.batch}, ID {values.studentId.trim()}.</p>
                </>
              ) : (
                <>
                  <h2 className="mt-6 text-3xl font-semibold tracking-tight">Form validated. Nothing saved.</h2>
                  <p className="mt-3 text-mute">Demo mode is on, so this entry was not stored. Add your Supabase credentials to collect real registrations.</p>
                </>
              )}
              <button onClick={reset} className="mt-8 text-sm font-medium text-volt underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt">
                {status === 'success' ? 'Register another student' : 'Try again'}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="max-w-md space-y-3" aria-busy={loading}>
              <h2 className="mb-8 text-3xl font-semibold tracking-tight">Register</h2>

              <Field id="fullName" label="Full name" error={errors.fullName}>
                <input id="fullName" className="field" autoComplete="name" placeholder="Saraansh Gandhi"
                  value={values.fullName} onChange={set('fullName')} disabled={loading}
                  aria-invalid={!!errors.fullName} aria-describedby="fullName-err" />
              </Field>

              <Field id="batch" label="Batch" error={errors.batch}>
                <div className="relative">
                  <select id="batch" className="field pr-8" value={values.batch} onChange={set('batch')} disabled={loading}
                    aria-invalid={!!errors.batch} aria-describedby="batch-err">
                    <option value="" disabled>Select batch</option>
                    {BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <svg aria-hidden className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-mute" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l5 5 5-5" /></svg>
                </div>
              </Field>

              <Field id="studentId" label="Student ID" error={errors.studentId}>
                <input id="studentId" className="field" inputMode="numeric" autoComplete="off" placeholder="240631"
                  value={values.studentId} onChange={set('studentId')} disabled={loading}
                  aria-invalid={!!errors.studentId} aria-describedby="studentId-err" />
              </Field>

              {status === 'error' && (
                <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{message}</p>
              )}

              <button type="submit" disabled={loading}
                className="group relative mt-4 flex w-full items-center justify-center rounded-md bg-violet px-6 py-4 text-base font-semibold text-white shadow-[0_0_0_1px_rgba(167,139,250,.35),0_12px_40px_-12px_rgba(124,58,237,.8)] transition hover:bg-[#8b4df0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Registering
                  </span>
                ) : 'Register'}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
