import { useState, useEffect } from 'react'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [notifications, setNotifications] = useState([])
  const [hrStats, setHrStats] = useState({ employees: 2, policies: 2, reports: 2 })
  const [itStats, setItStats] = useState({ tickets: 2, systems: 3, maintenance: 2 })
  
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  // Admin data viewing
  const [hrData, setHrData] = useState({ employees: [], policies: [], reports: [] })
  const [itData, setItData] = useState({ tickets: [], systems: [], maintenance: [] })
  const [changeRequests, setChangeRequests] = useState([])
  const [newRequest, setNewRequest] = useState({ department: 'hr', type: 'employee', description: '' })

  // Login credentials
  const users = {
    admin: { password: 'admin123', role: 'admin' },
    hr: { password: 'hr123', role: 'hr' },
    it: { password: 'it123', role: 'it' }
  }

  const handleLogin = () => {
    const user = users[username.toLowerCase()]
    if (user && user.password === password) {
      setIsLoggedIn(true)
      setUserRole(user.role)
      setUsername('')
      setPassword('')
    } else {
      alert('Invalid credentials! Use admin/admin123, hr/hr123, or it/it123')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole('')
    setActiveTab('dashboard')
  }

  // Load initial data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsResponse, requestsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/stats'),
          fetch('http://localhost:5000/api/change-requests')
        ])
        
        if (statsResponse.ok) {
          const stats = await statsResponse.json()
          setHrStats(stats.hr)
          setItStats(stats.it)
        }
        
        if (requestsResponse.ok) {
          const requests = await requestsResponse.json()
          setChangeRequests(requests)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    if (isLoggedIn) {
      loadData()
    }
  }, [isLoggedIn])

  // Listen for messages from microfrontends
  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data } = event.data
      
      switch (type) {
        case 'employee_added':
          setNotifications(prev => [{
            id: Date.now(),
            message: `New employee added: ${data.name}`,
            type: 'success',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'employee_deleted':
          setNotifications(prev => [{
            id: Date.now(),
            message: `Employee deleted`,
            type: 'info',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'policy_added':
          setNotifications(prev => [{
            id: Date.now(),
            message: `New policy added: ${data.title}`,
            type: 'success',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'policy_deleted':
          setNotifications(prev => [{
            id: Date.now(),
            message: `Policy deleted`,
            type: 'info',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'report_added':
          setNotifications(prev => [{
            id: Date.now(),
            message: `New report generated: ${data.title}`,
            type: 'success',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'report_deleted':
          setNotifications(prev => [{
            id: Date.now(),
            message: `Report deleted`,
            type: 'info',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'ticket_added':
          setNotifications(prev => [{
            id: Date.now(),
            message: `New ticket created: ${data.title}`,
            type: 'success',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'ticket_deleted':
          setNotifications(prev => [{
            id: Date.now(),
            message: `Ticket deleted`,
            type: 'info',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'ticket_status_updated':
          setNotifications(prev => [{
            id: Date.now(),
            message: `Ticket status updated to: ${data.status}`,
            type: 'info',
            timestamp: new Date().toISOString()
          }, ...prev])
          break
          
        case 'system_added':
          setNotifications(prev => [{
            id: Date.now(),
            message: `New system added: ${data.name}`,
            type: 'success',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'system_deleted':
          setNotifications(prev => [{
            id: Date.now(),
            message: `System deleted`,
            type: 'info',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'maintenance_added':
          setNotifications(prev => [{
            id: Date.now(),
            message: `Maintenance scheduled for: ${data.systemName}`,
            type: 'success',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'maintenance_deleted':
          setNotifications(prev => [{
            id: Date.now(),
            message: `Maintenance record deleted`,
            type: 'info',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh stats
          break
          
        case 'change_request_completed':
          setNotifications(prev => [{
            id: Date.now(),
            message: `Change request completed: ${data.status}`,
            type: 'success',
            timestamp: new Date().toISOString()
          }, ...prev])
          loadData() // Refresh change requests
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const sendMessage = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, department: activeTab })
      })
      const data = await res.json()
      setResponse(data.response)
    } catch (e) {
      setResponse('Error: ' + e.message)
    }
  }

  const sendChangeRequest = async () => {
    if (newRequest.description.trim()) {
      try {
        const response = await fetch('http://localhost:5000/api/change-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newRequest,
            requestedBy: 'Admin'
          })
        })
        
        if (response.ok) {
          const request = await response.json()
          setChangeRequests([request, ...changeRequests])
          setNewRequest({ department: 'hr', type: 'employee', description: '' })
          
          // Notify the appropriate department via postMessage
          setTimeout(() => {
            const targetWindow = newRequest.department === 'hr' ? 
              document.querySelector('iframe[src*="3001"]')?.contentWindow :
              document.querySelector('iframe[src*="3002"]')?.contentWindow
            
            if (targetWindow) {
              targetWindow.postMessage({
                type: 'ADMIN_CHANGE_REQUEST',
                data: request
              }, '*')
            }
          }, 100)
        }
      } catch (error) {
        console.error('Error sending change request:', error)
      }
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'HR_EMPLOYEE_ADDED':
        return `👤 New employee added: ${notification.data.name}`
      case 'HR_POLICY_ADDED':
        return `📄 New policy created: ${notification.data.title}`
      case 'HR_REPORT_GENERATED':
        return `📊 Report generated: ${notification.data.title}`
      case 'IT_TICKET_CREATED':
        return `🎫 New ticket created: ${notification.data.title}`
      case 'IT_SYSTEM_ADDED':
        return `🖥️ New system added: ${notification.data.name}`
      case 'IT_MAINTENANCE_SCHEDULED':
        return `🔧 Maintenance scheduled: ${notification.data.title}`
      case 'CHANGE_REQUEST_COMPLETED':
        return `✅ Change request completed: ${notification.data.description}`
      default:
        return 'Activity detected'
    }
  }

  // Login Screen (hero background with modal and credentials like reference image)
  if (!isLoggedIn) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000&auto=format&fit=crop) center/cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(76,29,149,0.45), rgba(15,23,42,0.45))' }} />

        {/* Top bar brand (top-left) and login button (top-right) */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ position: 'absolute', top: 18, left: 22, color: 'white' }}>
            <span style={{ padding: '8px 14px', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 10, fontWeight: 'bold', backdropFilter: 'blur(2px)' }}>WorkplaceConnect</span>
          </div>
          <div style={{ position: 'absolute', top: 18, right: 22, color: 'white' }}>
            <span style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 10, fontWeight: 'bold', backdropFilter: 'blur(2px)' }}>Login</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ width: 520, background: 'linear-gradient(180deg, #ffffff, #f1f5f9)', padding: 28, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#111827' }}>Company Portal Login</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username / Email"
                style={{ width: '100%', padding: 14, borderRadius: 10, border: '1px solid #e5e7eb', background: '#f8fafc' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ width: '100%', padding: 14, borderRadius: 10, border: '1px solid #e5e7eb', background: '#f8fafc' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, color: '#475569', fontSize: 13 }}>
              <label><input type="checkbox" style={{ marginRight: 6 }} />Remember Me</label>
              <span>Forgot Password</span>
            </div>
            <button onClick={handleLogin} style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#64748b' }}>Not a member? Contact Admin</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', height: '100vh', display: 'flex', background: '#f5f7fb' }}>
      {/* Left Sidebar */}
      <div style={{
        width: 260,
        background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>CP</div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Company Portal</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{userRole.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              background: activeTab === 'dashboard' ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: activeTab === 'dashboard' ? '#93c5fd' : 'rgba(255,255,255,0.85)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            📊 Dashboard
          </button>

          {(userRole === 'admin' || userRole === 'hr') && (
            <button
              onClick={() => setActiveTab('hr')}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                background: activeTab === 'hr' ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: activeTab === 'hr' ? '#fcd34d' : 'rgba(255,255,255,0.85)',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              👥 HR Department
            </button>
          )}

          {(userRole === 'admin' || userRole === 'it') && (
            <button
              onClick={() => setActiveTab('it')}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                background: activeTab === 'it' ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: activeTab === 'it' ? '#93c5fd' : 'rgba(255,255,255,0.85)',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              💻 IT Department
            </button>
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                background: activeTab === 'requests' ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: activeTab === 'requests' ? '#fca5a5' : 'rgba(255,255,255,0.85)',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              📝 Change Requests
            </button>
          )}

          <button
            onClick={() => setActiveTab('api')}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              background: activeTab === 'api' ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: activeTab === 'api' ? '#86efac' : 'rgba(255,255,255,0.85)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            📡 API Test
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={handleLogout}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              cursor: 'pointer',
              margin: 12
            }}
          >
            ↩ Logout
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          background: 'linear-gradient(120deg, #111827, #1f2937)',
          borderBottom: '1px solid #0b1220',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white'
        }}>
          <div style={{ fontWeight: 'bold' }}>Welcome, {userRole.toUpperCase()}</div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 20, background: 'linear-gradient(180deg, #0b1220 0%, #0f172a 12%, #f5f7fb 12%)', overflow: 'auto' }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: 24, color: 'white', fontSize: 26 }}>📊 Dashboard Overview</h2>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
              <div style={{ background: 'white', padding: 28, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 24px rgba(15,23,42,0.08)' }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Total Employees</div>
                <div style={{ fontSize: 40, fontWeight: 'bold', color: '#0f172a' }}>{hrStats.employees}</div>
              </div>
              <div style={{ background: 'white', padding: 28, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 24px rgba(15,23,42,0.08)' }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Active Tickets</div>
                <div style={{ fontSize: 40, fontWeight: 'bold', color: '#0f172a' }}>{itStats.tickets}</div>
              </div>
              <div style={{ background: 'white', padding: 28, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 24px rgba(15,23,42,0.08)' }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Open Change Requests</div>
                <div style={{ fontSize: 40, fontWeight: 'bold', color: '#0f172a' }}>{changeRequests.filter(r => r.status !== 'Completed').length}</div>
              </div>
            </div>

            {/* Department Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
              <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 10px 20px rgba(15,23,42,0.06)' }}>
                <h3 style={{ color: '#0f172a', marginBottom: 15 }}>👥 HR Department</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{hrStats.employees}</div>
                    <small style={{ color: '#6b7280' }}>Employees</small>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{hrStats.policies}</div>
                    <small style={{ color: '#6b7280' }}>Policies</small>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{hrStats.reports}</div>
                    <small style={{ color: '#6b7280' }}>Reports</small>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 10px 20px rgba(15,23,42,0.06)' }}>
                <h3 style={{ color: '#0f172a', marginBottom: 15 }}>💻 IT Department</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{itStats.tickets}</div>
                    <small style={{ color: '#6b7280' }}>Tickets</small>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{itStats.systems}</div>
                    <small style={{ color: '#6b7280' }}>Systems</small>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{itStats.maintenance}</div>
                    <small style={{ color: '#6b7280' }}>Maintenance</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div style={{ 
                background: 'white', 
                padding: 25, 
                borderRadius: 12, 
                marginBottom: 20,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <h3 style={{ color: '#374151' }}>🔔 Recent Activity ({notifications.length})</h3>
                  <button 
                    onClick={clearNotifications}
                    style={{
                      padding: '6px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ maxHeight: 200, overflow: 'auto' }}>
                  {notifications.map(notification => (
                    <div key={notification.id} style={{ 
                      padding: 12, 
                      background: '#f8fafc', 
                      borderRadius: 8, 
                      marginBottom: 8,
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: 14 }}>{notification.message}</div>
                      <small style={{ color: '#6b7280' }}>{new Date(notification.timestamp).toLocaleTimeString()}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Change Requests Tab (Admin Only) */}
        {activeTab === 'requests' && userRole === 'admin' && (
          <div>
            <h2 style={{ marginBottom: 20, color: 'white' }}>📝 Change Request Management</h2>
            
            {/* Send New Request */}
            <div style={{ 
              background: 'white', 
              padding: 25, 
              borderRadius: 12, 
              marginBottom: 30,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#ef4444', marginBottom: 15 }}>➕ Send New Change Request</h3>
              <div style={{ display: 'grid', gap: 15, maxWidth: 600 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <select
                    value={newRequest.department}
                    onChange={(e) => setNewRequest({...newRequest, department: e.target.value})}
                    style={{ padding: 12, borderRadius: 8, border: '2px solid #e5e7eb' }}
                  >
                    <option value="hr">HR Department</option>
                    <option value="it">IT Department</option>
                  </select>
                  <select
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                    style={{ padding: 12, borderRadius: 8, border: '2px solid #e5e7eb' }}
                  >
                    <option value="employee">Employee</option>
                    <option value="policy">Policy</option>
                    <option value="report">Report</option>
                    <option value="ticket">Ticket</option>
                    <option value="system">System</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <textarea
                  placeholder="Describe the change you want..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  rows={4}
                  style={{ padding: 12, borderRadius: 8, border: '2px solid #e5e7eb' }}
                />
                <button 
                  onClick={sendChangeRequest}
                  style={{
                    padding: '12px 24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    maxWidth: 200,
                    fontWeight: 'bold'
                  }}
                >
                  Send Request
                </button>
              </div>
            </div>

            {/* Change Requests List */}
            {changeRequests.length > 0 && (
              <div style={{ 
                background: 'white', 
                padding: 25, 
                borderRadius: 12,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ color: '#374151', marginBottom: 15 }}>📋 Change Requests ({changeRequests.length})</h3>
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  {changeRequests.map(request => (
                    <div key={request.id} style={{ 
                      padding: 20, 
                      background: '#f8fafc', 
                      borderRadius: 8, 
                      marginBottom: 15,
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ color: '#374151' }}>{request.department.toUpperCase()} - {request.type}</strong><br/>
                          <small style={{ color: '#6b7280' }}>{request.description}</small><br/>
                          <small style={{ color: '#6b7280' }}>Requested: {request.createdAt}</small>
                        </div>
                        <span style={{ 
                          padding: '6px 12px', 
                          background: request.status === 'Completed' ? '#10b981' : '#f59e0b', 
                          color: 'white', 
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>
                          {request.status}
                        </span>
                      </div>
                      {request.completedAt && (
                        <div style={{ marginTop: 10, fontSize: 12, color: '#10b981', fontWeight: 'bold' }}>
                          ✅ Completed at {request.completedAt}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HR Department Tab */}
        {((userRole === 'admin' && activeTab === 'hr') || userRole === 'hr') && (
          <div>
            <h2 style={{ marginBottom: 20, color: 'white' }}>👥 HR Department</h2>
            <div style={{ 
              border: '2px solid #e5e7eb', 
              borderRadius: 12, 
              height: 600,
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <iframe 
                src="http://localhost:3001" 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="HR Microfrontend"
              />
            </div>
          </div>
        )}
        
        {/* IT Department Tab */}
        {((userRole === 'admin' && activeTab === 'it') || userRole === 'it') && (
          <div>
            <h2 style={{ marginBottom: 20, color: 'white' }}>💻 IT Department</h2>
            <div style={{ 
              border: '2px solid #e5e7eb', 
              borderRadius: 12, 
              height: 600,
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <iframe 
                src="http://localhost:3002" 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="IT Microfrontend"
              />
            </div>
          </div>
        )}

        {/* API Test Tab */}
        {activeTab === 'api' && (
          <div>
            <h2 style={{ marginBottom: 20, color: 'white' }}>📡 API Testing</h2>
            <div style={{ 
              background: 'white', 
              padding: 25, 
              borderRadius: 12,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#10b981', marginBottom: 15 }}>Send Test Message</h3>
              <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: 12, borderRadius: 8, border: '2px solid #e5e7eb' }}
                />
                <button 
                  onClick={sendMessage}
                  style={{
                    padding: '12px 24px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Send
                </button>
              </div>
              {response && (
                <div style={{ 
                  background: '#f0fdf4', 
                  padding: 15, 
                  borderRadius: 8, 
                  border: '1px solid #bbf7d0' 
                }}>
                  <strong style={{ color: '#10b981' }}>Response:</strong> {response}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* End Right Content Area */}
      {/* End Outer Container */}
    </div>
    </div>
  )
}
