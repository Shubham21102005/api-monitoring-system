import {useEffect, useRef, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../stores/authStore'
import {NEON} from '../components/Layout'

const PAGE_SIZE = 50
const REFRESH_MS = 10000

const formatTime = (date) => {
  const d = new Date(date)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

const FILTERS = ['all', 'ok', 'fail']

function StatusDot({status}) {
  const ok = status === 'active'
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{backgroundColor: ok ? NEON : '#52525b'}}
    />
  )
}

function MonitorHeader({monitor}) {
  return (
    <div className="border border-zinc-900 bg-zinc-950 p-6 space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] text-zinc-500 tracking-wider">// monitor.detail</div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight mt-1">
            {monitor.name}
            <span className="text-zinc-600 ml-3 text-sm font-normal">/ {monitor.method}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={monitor.status} />
          <span className="text-[11px] text-zinc-400 tracking-wider uppercase">{monitor.status}</span>
        </div>
      </div>
      <div className="text-[12px] text-zinc-400 break-all">{monitor.url}</div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-zinc-600 tracking-widest pt-2 border-t border-zinc-900">
        <span>INTERVAL:&nbsp;<span className="text-zinc-300">{monitor.schedule?.interval ? `${monitor.schedule.interval}s` : (monitor.schedule?.cron || '—')}</span></span>
        <span>TIMEOUT:&nbsp;<span className="text-zinc-300">{monitor.timeoutMS}ms</span></span>
        <span>RETRIES:&nbsp;<span className="text-zinc-300">{monitor.retries}</span></span>
        <span>EXPECTED:&nbsp;<span className="text-zinc-300">{monitor.expectedResponse?.statusCode || '2xx'}</span></span>
      </div>
    </div>
  )
}

function StatCell({label, value, accent}) {
  return (
    <div className="p-5 border-l-2" style={{borderColor: accent ? NEON : '#27272a'}}>
      <div className="text-[10px] text-zinc-500 tracking-widest mb-1">{label}</div>
      <div className="text-zinc-100 text-2xl font-bold tracking-tight leading-none">{value}</div>
    </div>
  )
}

function StatsBar({logs}) {
  const total = logs.length
  const successful = logs.filter((l) => l.success).length
  const failures = total - successful
  const avgMs = total > 0
    ? Math.round(logs.reduce((s, l) => s + (l.response?.responseTime || 0), 0) / total)
    : 0
  const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : '—'

  return (
    <div className="border border-zinc-900 grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-900">
      <StatCell label="SUCCESS_RATE" value={total > 0 ? `${successRate}%` : '—'} accent />
      <StatCell label="AVG_MS" value={total > 0 ? avgMs : '—'} />
      <StatCell label="LOADED" value={total} />
      <StatCell label="FAILURES" value={failures} />
    </div>
  )
}

function DetailRow({label, children}) {
  return (
    <div className="flex flex-wrap">
      <span className="text-zinc-600 tracking-wider w-28 flex-shrink-0">{label}</span>
      <span className="text-zinc-300 break-all flex-1 min-w-0">{children}</span>
    </div>
  )
}

function HeaderList({headers}) {
  return (
    <div className="ml-28 mt-1 space-y-0.5 border-l border-zinc-900 pl-3 text-zinc-400 max-h-64 overflow-y-auto">
      {Object.entries(headers).map(([k, v]) => (
        <div key={k}><span className="text-zinc-500">{k}</span>: {String(v)}</div>
      ))}
    </div>
  )
}

function LogDetails({log}) {
  const reqHeaders = log.request?.headers || {}
  const reqHeaderCount = Object.keys(reqHeaders).length
  const respHeaders = log.response?.headers || {}
  const respHeaderCount = Object.keys(respHeaders).length
  const respBody = log.response?.body
  const hasError = log.error && (log.error.message || log.error.code)
  const respBorder = log.success ? '#27272a' : '#7f1d1d'

  return (
    <div className="mt-1 mb-3 pl-7 text-[11px] py-1 space-y-3 leading-5">
      <div className="border-l-2 border-zinc-800 pl-3 py-1 space-y-0.5">
        <div className="text-zinc-500 tracking-widest mb-1.5">↳ REQUEST</div>
        <DetailRow label="METHOD">{log.request?.method || '—'}</DetailRow>
        <DetailRow label="URL">{log.request?.url || '—'}</DetailRow>
        {reqHeaderCount > 0 ? (
          <details>
            <summary className="cursor-pointer flex flex-wrap hover:text-zinc-300 transition-colors">
              <span className="text-zinc-600 tracking-wider w-28 flex-shrink-0">HEADERS</span>
              <span className="text-zinc-500">{reqHeaderCount} entries</span>
            </summary>
            <HeaderList headers={reqHeaders} />
          </details>
        ) : null}
      </div>

      <div className="border-l-2 pl-3 py-1 space-y-0.5" style={{borderColor: respBorder}}>
        <div className="text-zinc-500 tracking-widest mb-1.5">↳ RESPONSE</div>
        <DetailRow label="STATUS">
          <span style={{color: log.success ? NEON : '#FF4D4D'}} className="font-bold">
            {log.response?.statusCode ?? '—'}
          </span>
        </DetailRow>
        <DetailRow label="TIME">{log.response?.responseTime ?? '—'}ms</DetailRow>
        {respHeaderCount > 0 ? (
          <details>
            <summary className="cursor-pointer flex flex-wrap hover:text-zinc-300 transition-colors">
              <span className="text-zinc-600 tracking-wider w-28 flex-shrink-0">HEADERS</span>
              <span className="text-zinc-500">{respHeaderCount} entries</span>
            </summary>
            <HeaderList headers={respHeaders} />
          </details>
        ) : null}
        {respBody !== undefined && respBody !== null && respBody !== '' ? (
          <details>
            <summary className="cursor-pointer flex flex-wrap hover:text-zinc-300 transition-colors">
              <span className="text-zinc-600 tracking-wider w-28 flex-shrink-0">BODY</span>
              <span className="text-zinc-500">
                {typeof respBody === 'string' ? `${respBody.length} chars` : 'object'}
              </span>
            </summary>
            <pre className="ml-28 mt-1 max-h-64 overflow-y-auto whitespace-pre-wrap break-all bg-zinc-950 p-3 border border-zinc-900 text-zinc-400 text-[11px]">
              {typeof respBody === 'string' ? respBody : JSON.stringify(respBody, null, 2)}
            </pre>
          </details>
        ) : null}
      </div>

      {hasError ? (
        <div className="border-l-2 border-red-900 pl-3 py-1 space-y-0.5">
          <div className="text-red-500 tracking-widest mb-1.5">↳ ERROR</div>
          {log.error.message ? (
            <DetailRow label="MESSAGE"><span className="text-red-300">{log.error.message}</span></DetailRow>
          ) : null}
          {log.error.code ? (
            <DetailRow label="CODE"><span className="text-red-300">{log.error.code}</span></DetailRow>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function LogLine({log, expanded, onToggle}) {
  const time = formatTime(log.runAt)
  const ok = log.success
  const code = log.response?.statusCode
  const ms = log.response?.responseTime
  const reasonText = !ok && log.error?.message ? log.error.message : null
  const accent = ok ? NEON : '#FF4D4D'

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left flex flex-wrap items-center gap-x-2 hover:bg-zinc-900/40 px-2 py-0.5 transition-colors"
      >
        <span className="text-zinc-700 text-[11px] w-3 inline-block">{expanded ? '▼' : '▶'}</span>
        <span className="text-zinc-600 text-[12px]">[{time}]</span>
        <span className="text-zinc-500 text-[12px] uppercase">{log.request?.method}</span>
        <span className="text-zinc-300 text-[12px] truncate max-w-[42ch]">{log.request?.url}</span>
        <span className="text-zinc-700 text-[12px]">→</span>
        <span className="text-[12px] font-bold" style={{color: accent}}>{code ?? 'ERR'}</span>
        <span className="text-zinc-500 text-[12px]">{ms ?? '—'}ms</span>
        <span className="text-[12px] font-bold" style={{color: accent}}>{ok ? '✓' : '✗'}</span>
        {reasonText ? (
          <span className="text-red-400/70 text-[11px] truncate">— {reasonText}</span>
        ) : null}
      </button>
      {expanded ? <LogDetails log={log} /> : null}
    </div>
  )
}

function FilterButtons({filter, setFilter}) {
  return (
    <div className="flex items-center border border-zinc-800">
      {FILTERS.map((f) => {
        const active = filter === f
        return (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              active
                ? 'px-2.5 py-1 text-[10px] tracking-widest text-black font-bold'
                : 'px-2.5 py-1 text-[10px] tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors'
            }
            style={active ? {backgroundColor: NEON} : undefined}
          >
            {f.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}

function LiveToggle({isLive, onToggle}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 px-2.5 py-1 border border-zinc-800 text-[10px] tracking-widest hover:border-zinc-700 transition-colors"
    >
      <span
        className={isLive ? 'h-1.5 w-1.5 rounded-full animate-pulse' : 'h-1.5 w-1.5 rounded-full'}
        style={{backgroundColor: isLive ? NEON : '#52525b'}}
      />
      <span style={{color: isLive ? NEON : '#71717a'}}>{isLive ? 'LIVE' : 'PAUSED'}</span>
    </button>
  )
}

function MonitorLogs() {
  const {id} = useParams()
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [monitor, setMonitor] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)
  const [initLoading, setInitLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isLive, setIsLive] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(() => new Set())
  const liveRef = useRef(isLive)

  useEffect(() => { liveRef.current = isLive }, [isLive])

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    if (!token || !id) return
    let ignore = false
    const init = async () => {
      try {
        const auth = {headers: {Authorization: `Bearer ${token}`}}
        const [monRes, logsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/monitors/get/${id}`, auth),
          axios.get(`http://localhost:5000/api/monitors/logs/${id}?limit=${PAGE_SIZE}&skip=0`, auth),
        ])
        if (ignore) return
        setMonitor(monRes.data.foundMonitor)
        const initialLogs = logsRes.data.logs || []
        setLogs(initialLogs)
        setHasMore(initialLogs.length === PAGE_SIZE)
        setInitLoading(false)
      } catch (err) {
        if (ignore) return
        if (err.response?.status === 401) {
          logout()
          navigate('/login')
          return
        }
        setError(err.response?.data?.message || 'failed to load')
        setInitLoading(false)
      }
    }
    init()
    return () => { ignore = true }
  }, [id, token, logout, navigate])

  useEffect(() => {
    if (!token || !id || !isLive) return
    const interval = setInterval(async () => {
      if (!liveRef.current) return
      try {
        const res = await axios.get(
          `http://localhost:5000/api/monitors/logs/${id}?limit=${PAGE_SIZE}&skip=0`,
          {headers: {Authorization: `Bearer ${token}`}}
        )
        const fresh = res.data.logs || []
        setLogs((prev) => {
          if (prev.length === 0) return fresh
          const lastSeenId = prev[0]._id
          const newOnes = []
          for (const log of fresh) {
            if (log._id === lastSeenId) break
            newOnes.push(log)
          }
          if (newOnes.length === 0) return prev
          return [...newOnes, ...prev]
        })
      } catch {
        // silent on auto-refresh
      }
    }, REFRESH_MS)
    return () => clearInterval(interval)
  }, [id, token, isLive])

  const loadOlder = async () => {
    if (!token || loadingMore) return
    setLoadingMore(true)
    try {
      const res = await axios.get(
        `http://localhost:5000/api/monitors/logs/${id}?limit=${PAGE_SIZE}&skip=${logs.length}`,
        {headers: {Authorization: `Bearer ${token}`}}
      )
      const older = res.data.logs || []
      setLogs((prev) => [...prev, ...older])
      if (older.length < PAGE_SIZE) setHasMore(false)
    } catch (err) {
      setError(err.response?.data?.message || 'load older failed')
    } finally {
      setLoadingMore(false)
    }
  }

  const toggleExpand = (logId) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(logId)) next.delete(logId)
      else next.add(logId)
      return next
    })
  }

  const filteredLogs = filter === 'all'
    ? logs
    : filter === 'ok'
      ? logs.filter((l) => l.success)
      : logs.filter((l) => !l.success)

  if (initLoading) {
    return (
      <section className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-16 text-[12px] text-zinc-500 tracking-wider">
          ...LOADING_LOGS
        </div>
      </section>
    )
  }

  if (!monitor) {
    return (
      <section className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-[11px] text-zinc-500 mb-2 tracking-wider">// monitor.not_found</div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">404 NOT_FOUND</h1>
          <Link to="/dashboard" className="inline-block mt-6 text-[12px] text-zinc-400 hover:text-zinc-100 transition-colors tracking-wider">
            ./dashboard
          </Link>
        </div>
      </section>
    )
  }

  const shortId = monitor._id.slice(-8)
  const showLoadOlder = hasMore && filter === 'all'
  const showEnd = !hasMore && logs.length > 0 && filter === 'all'

  return (
    <section className="border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6 text-[11px] tracking-wider text-zinc-500 flex-wrap">
          <Link to="/dashboard" className="hover:text-zinc-100 transition-colors">[&nbsp;../dashboard&nbsp;]</Link>
          <span className="text-zinc-700">//</span>
          <span className="text-zinc-400">~/monitors/{monitor.name}</span>
          <span className="text-zinc-700">//</span>
          <Link to={`/monitors/edit/${monitor._id}`} className="hover:text-zinc-100 transition-colors">
            [&nbsp;edit&nbsp;]
          </Link>
        </div>

        <div className="space-y-6 mb-8">
          <MonitorHeader monitor={monitor} />
          <StatsBar logs={logs} />
        </div>

        {error ? (
          <div className="border border-red-900 bg-red-950/30 px-4 py-3 text-[12px] text-red-400 tracking-wider mb-4">
            ! ERR: {error}
          </div>
        ) : null}

        <div className="border border-zinc-800 bg-black">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full" style={{backgroundColor: NEON}} />
              </span>
              <span className="text-[11px] text-zinc-500">tail -f /watchtower/logs/{shortId}.log</span>
            </div>
            <div className="flex items-center gap-3">
              <FilterButtons filter={filter} setFilter={setFilter} />
              <LiveToggle isLive={isLive} onToggle={() => setIsLive((v) => !v)} />
            </div>
          </div>

          <div className="p-4 text-[12px] leading-6 min-h-[400px] max-h-[70vh] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-zinc-700 text-[12px] py-12 text-center tracking-wider">
                {logs.length === 0
                  ? '// no logs yet — first check pending'
                  : `// no ${filter.toUpperCase()} entries in current view`}
              </div>
            ) : null}

            {filteredLogs.map((log) => (
              <LogLine
                key={log._id}
                log={log}
                expanded={expanded.has(log._id)}
                onToggle={() => toggleExpand(log._id)}
              />
            ))}

            {showLoadOlder ? (
              <div className="mt-4 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={loadOlder}
                  disabled={loadingMore}
                  className="text-[11px] tracking-wider text-zinc-500 hover:text-zinc-100 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? '$ ...LOADING' : '$ [ load_older ]'}
                </button>
              </div>
            ) : null}

            {showEnd ? (
              <div className="mt-4 pt-3 border-t border-zinc-900 text-zinc-700 text-[11px] tracking-wider">
                // end of stream — 30 day retention applies
              </div>
            ) : null}

            <div className="mt-3 flex gap-2 text-[12px]">
              <span style={{color: NEON}}>$</span>
              <span className="animate-blink" style={{color: NEON}}>_</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MonitorLogs
