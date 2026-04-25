import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MonitorForm from './pages/MonitorForm'
import MonitorLogs from './pages/MonitorLogs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitors/new" element={<MonitorForm />} />
          <Route path="/monitors/edit/:id" element={<MonitorForm />} />
          <Route path="/monitors/:id/logs" element={<MonitorLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
