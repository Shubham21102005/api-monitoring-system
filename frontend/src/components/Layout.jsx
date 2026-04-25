import {Link, Outlet, useNavigate} from 'react-router-dom'
import useAuthStore from '../stores/authStore'

const NEON = '#39FF14'

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
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3">
          <Reticle className="h-7 w-7" style={{color: NEON}} />
          <span className="font-bold tracking-[0.25em] text-sm text-zinc-100">WATCHTOWER</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-zinc-400 hover:text-zinc-100 transition-colors text-[12px] tracking-wider hidden sm:inline">
              ./dashboard
            </Link>
            <span className="text-[11px] text-zinc-500 tracking-wider hidden md:inline">
              op:&nbsp;<span className="text-zinc-300">{user.email}</span>
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors"
            >
              [&nbsp;logout&nbsp;]
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm">
            <Link to="/login" className="px-4 py-2 text-zinc-400 hover:text-zinc-100 transition-colors">[&nbsp;login&nbsp;]</Link>
            <Link to="/register" className="px-4 py-2 text-black font-bold transition-opacity hover:opacity-90" style={{backgroundColor: NEON}}>[&nbsp;get_started&nbsp;]</Link>
          </div>
        )}
      </div>
    </nav>
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

function Layout() {
  return (
    <div className="min-h-screen text-zinc-300">
      <StatusStrip />
      <Nav />
      <Outlet />
      <Footer />
    </div>
  )
}

export default Layout
export {Reticle, NEON}
