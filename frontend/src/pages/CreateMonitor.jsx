import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../stores/authStore'
import {NEON} from '../components/Layout'

const METHODS = ['GET', 'POST', 'PUT', 'DELETE']

function Field({label, type, value, onChange, placeholder, required = true, min}) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-wider mb-2 block" style={{color: NEON}}>&gt; {label}:</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-zinc-100 placeholder:text-zinc-700 focus:border-[var(--neon)] focus:outline-none transition-colors"
        style={{['--neon']: NEON}}
      />
    </label>
  )
}

function SelectField({label, value, onChange, options}) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-wider mb-2 block" style={{color: NEON}}>&gt; {label}:</span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-zinc-100 focus:border-[var(--neon)] focus:outline-none transition-colors appearance-none cursor-pointer"
          style={{['--neon']: NEON}}
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-xs">▼</span>
      </div>
    </label>
  )
}

function SectionHeader({label, optional}) {
  return (
    <div className="text-[11px] text-zinc-500 mb-4 tracking-wider">
      // {label}
      {optional ? <span className="text-zinc-700">&nbsp;[optional]</span> : null}
    </div>
  )
}

const INITIAL_FORM = {
  name: '',
  url: '',
  method: 'GET',
  interval: '60',
  timeoutMS: '',
  retries: '',
  statusCode: '',
  bodyContains: '',
}

function CreateMonitor() {
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  const update = (key) => (e) => setForm((f) => ({...f, [key]: e.target.value}))

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      url: form.url.trim(),
      method: form.method,
      schedule: {interval: parseInt(form.interval, 10)},
    }
    if (form.timeoutMS) payload.timeoutMS = parseInt(form.timeoutMS, 10)
    if (form.retries !== '') payload.retries = parseInt(form.retries, 10)

    const expected = {}
    if (form.statusCode) expected.statusCode = parseInt(form.statusCode, 10)
    if (form.bodyContains) expected.bodyContains = form.bodyContains
    if (Object.keys(expected).length > 0) payload.expectedResponse = expected

    try {
      await axios.post('http://localhost:5000/api/monitors/create', payload, {
        headers: {Authorization: `Bearer ${token}`},
      })
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
        navigate('/login')
        return
      }
      setError(err.response?.data?.message || 'deployment failed')
      setLoading(false)
    }
  }

  return (
    <section className="border-b border-zinc-900">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-[11px] text-zinc-500 mb-2 tracking-wider">// monitors.deploy()</div>
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 tracking-tight leading-none">
          DEPLOY_MONITOR<span className="animate-blink" style={{color: NEON}}>_</span>
        </h1>
        <p className="mt-3 text-[12px] text-zinc-500">initialize a new endpoint observer on the watchtower control plane.</p>

        <form onSubmit={onSubmit} className="mt-12 space-y-12">
          <div>
            <SectionHeader label="target.endpoint" />
            <div className="space-y-4">
              <Field label="name" type="text" value={form.name} onChange={update('name')} placeholder="github-api" />
              <Field label="url" type="url" value={form.url} onChange={update('url')} placeholder="https://api.github.com/users" />
              <SelectField label="method" value={form.method} onChange={update('method')} options={METHODS} />
            </div>
          </div>

          <div>
            <SectionHeader label="schedule.cadence" />
            <Field label="interval_seconds" type="number" value={form.interval} onChange={update('interval')} placeholder="60" min="5" />
          </div>

          <div>
            <SectionHeader label="runtime.behavior" optional />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="timeout_ms" type="number" value={form.timeoutMS} onChange={update('timeoutMS')} placeholder="5000 (default)" required={false} min="100" />
              <Field label="retries" type="number" value={form.retries} onChange={update('retries')} placeholder="2 (default)" required={false} min="0" />
            </div>
          </div>

          <div>
            <SectionHeader label="validation.assertions" optional />
            <div className="space-y-4">
              <Field label="expected_status" type="number" value={form.statusCode} onChange={update('statusCode')} placeholder="200" required={false} min="100" />
              <Field label="body_contains" type="text" value={form.bodyContains} onChange={update('bodyContains')} placeholder='e.g. "success"' required={false} />
            </div>
          </div>

          {error ? (
            <div className="border border-red-900 bg-red-950/30 px-3 py-2 text-[11px] text-red-400 tracking-wider">
              ! ERR: {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-900">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 text-black font-bold tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{backgroundColor: NEON}}
            >
              {loading ? '...DEPLOYING' : 'DEPLOY →'}
            </button>
            <Link
              to="/dashboard"
              className="px-8 py-3 border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors tracking-wider"
            >
              ./cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CreateMonitor
