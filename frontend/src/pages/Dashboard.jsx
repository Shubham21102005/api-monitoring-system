import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../stores/authStore'
import {NEON} from '../components/Layout'

function StatCell({label, value, accent}) {
  return (
    <div className="border-l-2 pl-4 py-2" style={{borderColor: accent ? NEON : '#27272a'}}>
      <div className="text-zinc-100 text-3xl font-bold leading-none">{value}</div>
      <div className="text-zinc-500 mt-2 tracking-wider text-[10px]">{label}</div>
    </div>
  )
}

function StatusDot({status}) {
  const ok = status === 'active'
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{backgroundColor: ok ? NEON : '#52525b'}}
    />
  )
}

function MonitorRow({m, idx}) {
  const interval = m.schedule?.interval ? `${m.schedule.interval}s` : (m.schedule?.cron || '—')
  const lastRun = m.lastRunAt ? new Date(m.lastRunAt).toLocaleString() : '—'
  return (
    <div className="grid grid-cols-12 gap-4 items-center px-4 py-4 bg-black hover:bg-zinc-950 transition-colors">
      <div className="col-span-1 text-[11px] text-zinc-600 tracking-wider">
        {String(idx + 1).padStart(2, '0')}
      </div>
      <div className="col-span-1">
        <StatusDot status={m.status} />
      </div>
      <div className="col-span-3 truncate">
        <div className="text-sm text-zinc-100 font-bold tracking-wider truncate">{m.name}</div>
        <div className="text-[11px] text-zinc-600 mt-0.5 uppercase tracking-wider">{m.method}</div>
      </div>
      <div className="col-span-4 text-[12px] text-zinc-400 truncate">{m.url}</div>
      <div className="col-span-1 text-[11px] text-zinc-500 tracking-wider">{interval}</div>
      <div className="col-span-2 text-[11px] text-zinc-500 truncate">{lastRun}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="border border-zinc-900 bg-zinc-950 p-12 text-center">
      <div className="text-[11px] text-zinc-600 tracking-wider mb-3">// monitors.length === 0</div>
      <h3 className="text-xl font-bold text-zinc-100 tracking-tight">NO_MONITORS_DEPLOYED</h3>
      <p className="mt-3 text-sm text-zinc-500 max-w-sm mx-auto">
        Deploy your first monitor to start watching an endpoint. Watchtower will check it on a schedule and log every response.
      </p>
      <Link
        to="/monitors/new"
        className="inline-block mt-6 px-6 py-3 text-black font-bold tracking-wider text-[12px] hover:opacity-90 transition-opacity"
        style={{backgroundColor: NEON}}
      >
        [&nbsp;+&nbsp;DEPLOY_FIRST_MONITOR&nbsp;]
      </Link>
    </div>
  )
}

function Dashboard() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [monitors, setMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    let ignore = false
    const load = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/monitors/getAll', {
          headers: {Authorization: `Bearer ${token}`},
        })
        if (!ignore) {
          setMonitors(res.data.monitors || [])
          setLoading(false)
        }
      } catch (err) {
        if (ignore) return
        if (err.response?.status === 401) {
          logout()
          navigate('/login')
          return
        }
        setError(err.response?.data?.message || 'failed to load monitors')
        setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [token, navigate, logout])

  const activeCount = monitors.filter((m) => m.status === 'active').length
  const pausedCount = monitors.filter((m) => m.status === 'paused').length

  return (
    <section className="border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-[11px] text-zinc-500 mb-2 tracking-wider">// session.dashboard</div>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-zinc-100 tracking-tight leading-none">
            DASHBOARD<span className="animate-blink" style={{color: NEON}}>_</span>
          </h1>
          <div className="text-[11px] text-zinc-500 tracking-wider">
            OPERATOR:&nbsp;<span className="text-zinc-300">{user?.email || 'unknown'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <StatCell label="MONITORS_TOTAL" value={loading ? '—' : monitors.length} accent />
          <StatCell label="STATUS_ACTIVE" value={loading ? '—' : activeCount} />
          <StatCell label="STATUS_PAUSED" value={loading ? '—' : pausedCount} />
          <StatCell label="UPTIME" value="99.9%" />
        </div>

        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-[11px] text-zinc-500 mb-1 tracking-wider">// monitors.list()</div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">FLEET</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-zinc-500 tracking-wider">
              [&nbsp;{loading ? '—' : monitors.length}&nbsp;ENTRIES&nbsp;]
            </span>
            <Link
              to="/monitors/new"
              className="px-5 py-2.5 text-black font-bold tracking-wider text-[12px] hover:opacity-90 transition-opacity"
              style={{backgroundColor: NEON}}
            >
              [&nbsp;+&nbsp;DEPLOY_MONITOR&nbsp;]
            </Link>
          </div>
        </div>

        {error ? (
          <div className="border border-red-900 bg-red-950/30 px-4 py-3 text-[12px] text-red-400 tracking-wider">
            ! ERR: {error}
          </div>
        ) : null}

        {loading ? (
          <div className="border border-zinc-900 px-4 py-8 text-[12px] text-zinc-500 tracking-wider">
            ...LOADING_FLEET
          </div>
        ) : null}

        {!loading && !error && monitors.length === 0 ? <EmptyState /> : null}

        {!loading && monitors.length > 0 ? (
          <div className="border border-zinc-900">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-950 text-[10px] text-zinc-600 tracking-widest border-b border-zinc-900">
              <div className="col-span-1">#</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-3">NAME / METHOD</div>
              <div className="col-span-4">URL</div>
              <div className="col-span-1">INTERVAL</div>
              <div className="col-span-2">LAST_RUN</div>
            </div>
            <div className="divide-y divide-zinc-900">
              {monitors.map((m, i) => (
                <MonitorRow key={m._id} m={m} idx={i} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Dashboard
