import {useEffect, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../stores/authStore'
import {NEON} from '../components/Layout'

const METHODS = ['GET', 'POST', 'PUT', 'DELETE']

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

function KvRow({item, onUpdate, onRemove}) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={item.key}
        onChange={(e) => onUpdate('key', e.target.value)}
        placeholder="key"
        className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder:text-zinc-700 focus:border-[var(--neon)] focus:outline-none transition-colors text-sm"
        style={{['--neon']: NEON}}
      />
      <input
        type="text"
        value={item.value}
        onChange={(e) => onUpdate('value', e.target.value)}
        placeholder="value"
        className="flex-[2] min-w-0 bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder:text-zinc-700 focus:border-[var(--neon)] focus:outline-none transition-colors text-sm"
        style={{['--neon']: NEON}}
      />
      <button
        type="button"
        onClick={onRemove}
        className="px-3 py-2 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900 transition-colors text-sm"
        aria-label="remove"
      >
        ×
      </button>
    </div>
  )
}

function KeyValueList({label, optional, items, setItems}) {
  const update = (id) => (field, val) =>
    setItems((prev) => prev.map((x) => (x.id === id ? {...x, [field]: val} : x)))
  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id))
  const add = () => setItems((prev) => [...prev, {id: crypto.randomUUID(), key: '', value: ''}])

  return (
    <div>
      <SectionHeader label={label} optional={optional} />
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-[11px] text-zinc-700 tracking-wider py-2">// none</div>
        ) : null}
        {items.map((item) => (
          <KvRow
            key={item.id}
            item={item}
            onUpdate={(field, val) => update(item.id)(field, val)}
            onRemove={() => remove(item.id)}
          />
        ))}
        <button
          type="button"
          onClick={add}
          className="text-[11px] text-zinc-500 hover:text-[var(--neon)] tracking-wider transition-colors mt-2"
          style={{['--neon']: NEON}}
        >
          [ + add_row ]
        </button>
      </div>
    </div>
  )
}

const toKvRows = (obj) =>
  obj
    ? Object.entries(obj).map(([k, v]) => ({id: crypto.randomUUID(), key: k, value: String(v)}))
    : []

function MonitorForm() {
  const {id} = useParams()
  const isEdit = Boolean(id)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [headers, setHeaders] = useState([])
  const [queryParams, setQueryParams] = useState([])
  const [bodyText, setBodyText] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(isEdit)

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    if (!isEdit || !token) return
    let ignore = false
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/monitors/get/${id}`, {
          headers: {Authorization: `Bearer ${token}`},
        })
        if (ignore) return
        const m = res.data.foundMonitor
        setForm({
          name: m.name || '',
          url: m.url || '',
          method: m.method || 'GET',
          interval: m.schedule?.interval ? String(m.schedule.interval) : '',
          timeoutMS: m.timeoutMS ? String(m.timeoutMS) : '',
          retries: m.retries !== undefined ? String(m.retries) : '',
          statusCode: m.expectedResponse?.statusCode ? String(m.expectedResponse.statusCode) : '',
          bodyContains: m.expectedResponse?.bodyContains || '',
        })
        setHeaders(toKvRows(m.headers))
        setQueryParams(toKvRows(m.queryParams))
        setBodyText(
          m.body !== undefined && m.body !== null
            ? (typeof m.body === 'string' ? m.body : JSON.stringify(m.body, null, 2))
            : ''
        )
        setInitLoading(false)
      } catch (err) {
        if (ignore) return
        if (err.response?.status === 401) {
          logout()
          navigate('/login')
          return
        }
        setError(err.response?.data?.message || 'failed to load monitor')
        setInitLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [id, isEdit, token, logout, navigate])

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

    const headersObj = {}
    headers.forEach((h) => {
      const k = h.key.trim()
      if (k) headersObj[k] = h.value
    })
    if (Object.keys(headersObj).length > 0) payload.headers = headersObj

    const qpObj = {}
    queryParams.forEach((q) => {
      const k = q.key.trim()
      if (k) qpObj[k] = q.value
    })
    if (Object.keys(qpObj).length > 0) payload.queryParams = qpObj

    if (bodyText.trim()) {
      try {
        payload.body = JSON.parse(bodyText)
      } catch {
        payload.body = bodyText
      }
    }

    try {
      const requestUrl = isEdit
        ? `http://localhost:5000/api/monitors/update/${id}`
        : 'http://localhost:5000/api/monitors/create'
      const fn = isEdit ? axios.put : axios.post
      await fn(requestUrl, payload, {headers: {Authorization: `Bearer ${token}`}})
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
        navigate('/login')
        return
      }
      setError(err.response?.data?.message || (isEdit ? 'update failed' : 'deployment failed'))
      setLoading(false)
    }
  }

  if (initLoading) {
    return (
      <section className="border-b border-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16 text-[12px] text-zinc-500 tracking-wider">
          ...LOADING_MONITOR
        </div>
      </section>
    )
  }

  return (
    <section className="border-b border-zinc-900">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-[11px] text-zinc-500 mb-2 tracking-wider">
          // monitors.{isEdit ? 'edit' : 'deploy'}()
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 tracking-tight leading-none">
          {isEdit ? 'EDIT_MONITOR' : 'DEPLOY_MONITOR'}
          <span className="animate-blink" style={{color: NEON}}>_</span>
        </h1>
        <p className="mt-3 text-[12px] text-zinc-500">
          {isEdit ? 'modify endpoint observer configuration.' : 'initialize a new endpoint observer on the watchtower control plane.'}
        </p>

        <form onSubmit={onSubmit} className="mt-12 space-y-12">
          <div>
            <SectionHeader label="target.endpoint" />
            <div className="space-y-4">
              <Field label="name" type="text" value={form.name} onChange={update('name')} placeholder="github-api" />
              <Field label="url" type="url" value={form.url} onChange={update('url')} placeholder="https://api.github.com/users" />
              <SelectField label="method" value={form.method} onChange={update('method')} options={METHODS} />
            </div>
          </div>

          <KeyValueList label="request.headers" optional items={headers} setItems={setHeaders} />
          <KeyValueList label="request.query_params" optional items={queryParams} setItems={setQueryParams} />

          <div>
            <SectionHeader label="request.body" optional />
            <label className="block">
              <span className="text-[11px] tracking-wider mb-2 block" style={{color: NEON}}>&gt; body:</span>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder='{"name":"value"} or raw text'
                rows={6}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-zinc-100 placeholder:text-zinc-700 focus:border-[var(--neon)] focus:outline-none transition-colors resize-y"
                style={{['--neon']: NEON}}
              />
              <span className="text-[10px] text-zinc-700 tracking-wider mt-2 block">
                // valid JSON sent as object, otherwise as raw string
              </span>
            </label>
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
              {loading
                ? (isEdit ? '...UPDATING' : '...DEPLOYING')
                : (isEdit ? 'UPDATE →' : 'DEPLOY →')}
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

export default MonitorForm
