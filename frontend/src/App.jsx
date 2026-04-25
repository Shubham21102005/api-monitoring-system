const NEON = '#39FF14'

const FEATURES = [
  {id: '01', title: 'SCHEDULED_CHECKS', body: 'Hit any endpoint every N seconds or on a cron expression. Per-monitor timeouts, expected status codes, body-match assertions.'},
  {id: '02', title: 'SMART_RETRIES', body: 'Transient blips do not fire alerts. Configurable retries ride through brief outages and only fail when it actually matters.'},
  {id: '03', title: 'FULL_HISTORY', body: 'Every request and response persisted with timing, status, headers. Indexed and searchable for thirty days.'},
  {id: '04', title: 'FAILURE_ALERTS', body: 'Email the moment a monitor flips from healthy to failing. No noise, no alert fatigue, no false positives.'},
  {id: '05', title: 'BODY_MATCH', body: 'Go beyond status codes. Assert on response body substrings to catch silent regressions in API contracts.'},
  {id: '06', title: 'PAUSE_RESUME', body: 'Maintenance window? Toggle a monitor to paused. Resume when ready and the schedule continues uninterrupted.'},
]

const TAIL = [
  {t: '09:42:13', url: 'httpbin.org/status/200', code: '200', ms: '312', ok: true},
  {t: '09:42:23', url: 'api.github.com/users  ', code: '200', ms: '178', ok: true},
  {t: '09:42:33', url: 'staging.acme.io/health', code: '500', ms: '4221', ok: false},
  {t: '09:42:43', url: 'httpbin.org/status/200', code: '200', ms: '298', ok: true},
  {t: '09:42:53', url: 'api.stripe.com/charges', code: '200', ms: '412', ok: true},
  {t: '09:43:03', url: 'staging.acme.io/health', code: '503', ms: '4187', ok: false},
  {t: '09:43:13', url: 'httpbin.org/status/200', code: '200', ms: '305', ok: true},
]

function Reticle({className}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="0" x2="16" y2="5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="27" x2="16" y2="32" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="16" x2="5" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <line x1="27" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  )
}

function StatusStrip() {
  return (
    <div className="border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-[11px] text-zinc-500">
        <span>SYS//WATCHTOWER.v0.1.0</span>
        <span className="hidden sm:inline">UTC 09:43:14 // 6 MONITORS // 99.94% UPTIME</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{backgroundColor: NEON}} />
          <span style={{color: NEON}}>ONLINE</span>
        </span>
      </div>
    </div>
  )
}

function Nav() {
  return (
    <nav className="border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Reticle className="h-7 w-7" />
          <span className="font-bold tracking-[0.25em] text-sm text-zinc-100">WATCHTOWER</span>
        </a>
        <div className="flex items-center gap-1 text-sm">
          <a href="/login" className="px-4 py-2 text-zinc-400 hover:text-[var(--neon)] transition-colors" style={{['--neon']: NEON}}>
            [&nbsp;login&nbsp;]
          </a>
          <a href="/register" className="px-4 py-2 border text-black font-bold transition-colors" style={{borderColor: NEON, backgroundColor: NEON}}>
            [&nbsp;get_started&nbsp;]
          </a>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7">
          <div className="text-[11px] text-zinc-500 mb-6 tracking-wider">// monitor.observe(*your_apis)</div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-zinc-100">
            KNOW THE<br />
            SECOND YOUR<br />
            <span style={{color: NEON}}>API DROPS</span>
            <span className="animate-blink" style={{color: NEON}}>_</span>
          </h1>
          <p className="mt-8 text-zinc-400 max-w-md leading-relaxed text-sm">
            Schedule HTTP checks against any endpoint. Smart retries through transient blips. Email alerts the moment something actually breaks. A thirty-day audit trail of every request and response.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a href="/register" className="px-6 py-3 text-black font-bold hover:opacity-90 transition-opacity" style={{backgroundColor: NEON}}>
              START_MONITORING&nbsp;&rarr;
            </a>
            <a href="/login" className="px-6 py-3 border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors">
              ./login
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md text-xs">
            <Stat label="CHECKS/HR" value="∞" />
            <Stat label="RETENTION" value="30d" />
            <Stat label="ALERT_LATENCY" value="<5s" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <TerminalPanel />
        </div>
      </div>
    </section>
  )
}

function Stat({label, value}) {
  return (
    <div className="border-l-2 pl-3" style={{borderColor: NEON}}>
      <div className="text-zinc-100 text-2xl font-bold leading-none">{value}</div>
      <div className="text-zinc-500 mt-2 tracking-wider text-[10px]">{label}</div>
    </div>
  )
}

function TerminalPanel() {
  return (
    <div className="border border-zinc-800 bg-black">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-[11px] text-zinc-500">
        <span>~/watchtower &mdash; monitor.tail --live</span>
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="h-2 w-2 rounded-full" style={{backgroundColor: NEON}} />
        </span>
      </div>
      <div className="p-4 text-[12px] leading-6 overflow-hidden">
        {TAIL.map((line, i) => (
          <div key={i} className="flex gap-2 whitespace-pre">
            <span className="text-zinc-600">[{line.t}]</span>
            <span className="text-zinc-400">{line.url}</span>
            <span style={{color: line.ok ? NEON : '#FF4D4D'}}>{line.code}</span>
            <span className="text-zinc-500 ml-auto">{line.ms}ms</span>
            <span style={{color: line.ok ? NEON : '#FF4D4D'}}>{line.ok ? '✓' : '✗'}</span>
          </div>
        ))}
        <div className="text-zinc-700 mt-2 flex gap-2">
          <span style={{color: NEON}}>$</span>
          <span className="animate-blink" style={{color: NEON}}>_</span>
        </div>
      </div>
    </div>
  )
}

function Capabilities() {
  return (
    <section className="border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="text-[11px] text-zinc-500 mb-2 tracking-wider">// capabilities.list()</div>
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-100 tracking-tight">WHAT IT DOES</h2>
          </div>
          <div className="text-[11px] text-zinc-500 tracking-wider">[ 06 / 06 ]</div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900">
          {FEATURES.map((f) => (
            <div key={f.id} className="bg-black p-8 group hover:bg-zinc-950 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] tracking-wider" style={{color: NEON}}>{f.id}</span>
                <span className="text-zinc-700 text-[11px]">[FEATURE]</span>
              </div>
              <h3 className="font-bold text-zinc-100 tracking-wider mb-3 group-hover:opacity-80 transition-opacity" style={{color: NEON}}>
                {f.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="text-[11px] text-zinc-500 mb-6 tracking-wider">// ready.exec()</div>
        <h2 className="text-4xl md:text-6xl font-bold text-zinc-100 tracking-tight leading-tight">
          STOP FINDING OUT<br />
          FROM <span style={{color: NEON}}>YOUR USERS</span>.
        </h2>
        <p className="mt-6 text-zinc-400 max-w-md mx-auto text-sm">
          Self-hosted, open source, zero bullshit. Deploy in five minutes.
        </p>
        <a href="/register" className="inline-block mt-10 px-8 py-4 text-black font-bold hover:opacity-90 transition-opacity" style={{backgroundColor: NEON}}>
          [ DEPLOY_NOW ]
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between text-[11px] text-zinc-600 flex-wrap gap-2">
        <span className="tracking-wider">WATCHTOWER &mdash; SELF-HOSTED API MONITORING</span>
        <span className="tracking-wider">BUILD: 0.1.0-dev &middot; NODE &middot; BULLMQ &middot; MONGO</span>
      </div>
    </footer>
  )
}

function App() {
  return (
    <div className="min-h-screen text-zinc-300 selection:text-black" style={{['--sel']: NEON}}>
      <div className="scanline" aria-hidden="true" />
      <StatusStrip />
      <Nav />
      <Hero />
      <Capabilities />
      <CTA />
      <Footer />
    </div>
  )
}

export default App
