import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import {NEON} from '../components/Layout'

function Field({label, type, value, onChange, placeholder, autoComplete}) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-wider mb-2 block" style={{color: NEON}}>&gt; {label}:</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-zinc-100 placeholder:text-zinc-700 focus:border-[var(--neon)] focus:outline-none transition-colors"
        style={{['--neon']: NEON}}
      />
    </label>
  )
}

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await axios.post('http://localhost:5000/api/users/register', {name, email, password})
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="border-b border-zinc-900">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="text-[11px] text-zinc-500 mb-2 tracking-wider">// auth.provision()</div>
        <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">
          REGISTER<span className="animate-blink" style={{color: NEON}}>_</span>
        </h1>
        <p className="mt-3 text-[12px] text-zinc-500">provision a new operator account on the watchtower control plane.</p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <Field
            label="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ada lovelace"
            autoComplete="name"
          />
          <Field
            label="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            autoComplete="email"
          />
          <Field
            label="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          {error ? (
            <div className="text-[11px] text-red-400 border border-red-900 bg-red-950/30 px-3 py-2 tracking-wider">
              ! ERR: {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-black font-bold tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{backgroundColor: NEON}}
          >
            {loading ? '...PROVISIONING' : 'CREATE_ACCOUNT →'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-zinc-900 text-[11px] text-zinc-500 tracking-wider">
          HAVE_ACCOUNT?&nbsp;
          <Link to="/login" className="hover:opacity-80 transition-opacity" style={{color: NEON}}>
            ./login
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Register
