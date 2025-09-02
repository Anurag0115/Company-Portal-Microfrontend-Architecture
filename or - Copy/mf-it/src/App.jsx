import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tickets, setTickets] = useState([])
  const [systems, setSystems] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [changeRequests, setChangeRequests] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Medium', status: 'Open', assignedTo: '' })
  const [newSystem, setNewSystem] = useState({ name: '', type: '', status: 'Online', lastCheck: '' })
  const [newMaintenance, setNewMaintenance] = useState({ systemName: '', description: '', scheduledDate: '', technician: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [ticketsRes, systemsRes, maintenanceRes, requestsRes] = await Promise.all([
        fetch('http://localhost:5000/api/it/tickets'),
        fetch('http://localhost:5000/api/it/systems'),
        fetch('http://localhost:5000/api/it/maintenance'),
        fetch('http://localhost:5000/api/change-requests')
      ])
      
      const ticketsData = await ticketsRes.json()
      const systemsData = await systemsRes.json()
      const maintenanceData = await maintenanceRes.json()
      const requestsData = await requestsRes.json()
      
      // Filter change requests for IT department
      const itRequests = requestsData.filter(req => req.department === 'IT')
      
      setTickets(ticketsData)
      setSystems(systemsData)
      setMaintenance(maintenanceData)
      setChangeRequests(itRequests)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const addTicket = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/it/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      })
      const ticket = await response.json()
      setTickets([ticket, ...tickets])
      setNewTicket({ title: '', description: '', priority: 'Medium', status: 'Open', assignedTo: '' })
      
      // Notify host app
      window.parent.postMessage({
        type: 'ticket_added',
        data: ticket
      }, '*')
    } catch (error) {
      console.error('Error adding ticket:', error)
    }
  }

  const deleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await fetch(`http://localhost:5000/api/it/tickets/${id}`, {
          method: 'DELETE'
        })
        setTickets(tickets.filter(ticket => ticket.id !== id))
        
        // Notify host app
        window.parent.postMessage({
          type: 'ticket_deleted',
          data: { id }
        }, '*')
      } catch (error) {
        console.error('Error deleting ticket:', error)
      }
    }
  }

  const updateTicketStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/it/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      setTickets(tickets.map(ticket => 
        ticket.id === id ? { ...ticket, status } : ticket
      ))
      
      // Notify host app
      window.parent.postMessage({
        type: 'ticket_status_updated',
        data: { id, status }
      }, '*')
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  const addSystem = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/it/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSystem)
      })
      const system = await response.json()
      setSystems([system, ...systems])
      setNewSystem({ name: '', type: '', status: 'Online', lastCheck: '' })
      
      // Notify host app
      window.parent.postMessage({
        type: 'system_added',
        data: system
      }, '*')
    } catch (error) {
      console.error('Error adding system:', error)
    }
  }

  const deleteSystem = async (id) => {
    if (window.confirm('Are you sure you want to delete this system?')) {
      try {
        await fetch(`http://localhost:5000/api/it/systems/${id}`, {
          method: 'DELETE'
        })
        setSystems(systems.filter(system => system.id !== id))
        
        // Notify host app
        window.parent.postMessage({
          type: 'system_deleted',
          data: { id }
        }, '*')
      } catch (error) {
        console.error('Error deleting system:', error)
      }
    }
  }

  const addMaintenance = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/it/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaintenance)
      })
      const maintenanceRecord = await response.json()
      setMaintenance([maintenanceRecord, ...maintenance])
      setNewMaintenance({ systemName: '', description: '', scheduledDate: '', technician: '' })
      
      // Notify host app
      window.parent.postMessage({
        type: 'maintenance_added',
        data: maintenanceRecord
      }, '*')
    } catch (error) {
      console.error('Error adding maintenance:', error)
    }
  }

  const deleteMaintenance = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await fetch(`http://localhost:5000/api/it/maintenance/${id}`, {
          method: 'DELETE'
        })
        setMaintenance(maintenance.filter(maint => maint.id !== id))
        
        // Notify host app
        window.parent.postMessage({
          type: 'maintenance_deleted',
          data: { id }
        }, '*')
      } catch (error) {
        console.error('Error deleting maintenance:', error)
      }
    }
  }

  const completeChangeRequest = async (id, status, notes) => {
    try {
      await fetch(`http://localhost:5000/api/change-requests/${id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })
      
      // Update local state
      setChangeRequests(changeRequests.map(req => 
        req.id === id ? { ...req, status, notes, completed_at: new Date().toISOString() } : req
      ))
      
      // Notify host app
      window.parent.postMessage({
        type: 'change_request_completed',
        data: { id, status, notes }
      }, '*')
    } catch (error) {
      console.error('Error completing change request:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="it-app">
      <div className="header">
        <h1>💻 IT Department</h1>
        <p>Manage tickets, systems, and maintenance</p>
      </div>

      {/* Change Request Notifications */}
      {changeRequests.length > 0 && (
        <div className="section">
          <h2>🔔 Change Requests from Admin</h2>
          <div className="requests-grid">
            {changeRequests.map(request => (
              <div key={request.id} className={`request-card ${request.status}`}>
                <div className="request-header">
                  <span className={`status-badge ${request.status}`}>
                    {request.status === 'pending' ? '⏳ Pending' : 
                     request.status === 'in_progress' ? '🔄 In Progress' : 
                     request.status === 'completed' ? '✅ Completed' : '❌ Cancelled'}
                  </span>
                  <span className="priority-badge">{request.priority}</span>
                </div>
                <p className="request-description">{request.description}</p>
                <p className="request-meta">Requested by: {request.requestedBy}</p>
                <p className="request-meta">Date: {new Date(request.created_at).toLocaleDateString()}</p>
                
                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      onClick={() => completeChangeRequest(request.id, 'in_progress', 'Work started')}
                      className="btn btn-primary"
                    >
                      Start Work
                    </button>
                    <button 
                      onClick={() => completeChangeRequest(request.id, 'completed', 'Request completed')}
                      className="btn btn-success"
                    >
                      Mark Complete
                    </button>
                  </div>
                )}
                
                {request.status === 'in_progress' && (
                  <div className="request-actions">
                    <button 
                      onClick={() => completeChangeRequest(request.id, 'completed', 'Request completed')}
                      className="btn btn-success"
                    >
                      Mark Complete
                    </button>
                  </div>
                )}
                
                {request.notes && (
                  <p className="request-notes"><strong>Notes:</strong> {request.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Management */}
      <div className="section">
        <h2>🎫 Ticket Management</h2>
        <form onSubmit={addTicket} className="form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Ticket Title"
              value={newTicket.title}
              onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
              required
            />
            <select
              value={newTicket.priority}
              onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <input
              type="text"
              placeholder="Assigned To"
              value={newTicket.assignedTo}
              onChange={(e) => setNewTicket({...newTicket, assignedTo: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-primary">Add Ticket</button>
          </div>
          <textarea
            placeholder="Ticket Description"
            value={newTicket.description}
            onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
            required
            rows="3"
          />
        </form>
        
        <div className="grid">
          {tickets.map(ticket => (
            <div key={ticket.id} className="card">
              <div className="card-header">
                <h3>{ticket.title}</h3>
                <button 
                  onClick={() => deleteTicket(ticket.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️
                </button>
              </div>
              <p><strong>Description:</strong> {ticket.description}</p>
              <p><strong>Priority:</strong> <span className={`priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Assigned To:</strong> {ticket.assigned_to}</p>
              
              <div className="status-actions">
                <select 
                  value={ticket.status} 
                  onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                  className="status-select"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Management */}
      <div className="section">
        <h2>🖥️ System Management</h2>
        <form onSubmit={addSystem} className="form">
          <div className="form-row">
            <input
              type="text"
              placeholder="System Name"
              value={newSystem.name}
              onChange={(e) => setNewSystem({...newSystem, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="System Type"
              value={newSystem.type}
              onChange={(e) => setNewSystem({...newSystem, type: e.target.value})}
              required
            />
            <select
              value={newSystem.status}
              onChange={(e) => setNewSystem({...newSystem, status: e.target.value})}
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <input
              type="text"
              placeholder="Last Check"
              value={newSystem.lastCheck}
              onChange={(e) => setNewSystem({...newSystem, lastCheck: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-primary">Add System</button>
          </div>
        </form>
        
        <div className="grid">
          {systems.map(system => (
            <div key={system.id} className="card">
              <div className="card-header">
                <h3>{system.name}</h3>
                <button 
                  onClick={() => deleteSystem(system.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️
                </button>
              </div>
              <p><strong>Type:</strong> {system.type}</p>
              <p><strong>Status:</strong> <span className={`status-${system.status.toLowerCase()}`}>{system.status}</span></p>
              <p><strong>Last Check:</strong> {system.last_check}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Management */}
      <div className="section">
        <h2>🔧 Maintenance Management</h2>
        <form onSubmit={addMaintenance} className="form">
          <div className="form-row">
            <input
              type="text"
              placeholder="System Name"
              value={newMaintenance.systemName}
              onChange={(e) => setNewMaintenance({...newMaintenance, systemName: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Technician"
              value={newMaintenance.technician}
              onChange={(e) => setNewMaintenance({...newMaintenance, technician: e.target.value})}
              required
            />
            <input
              type="date"
              value={newMaintenance.scheduledDate}
              onChange={(e) => setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-primary">Schedule Maintenance</button>
          </div>
          <textarea
            placeholder="Maintenance Description"
            value={newMaintenance.description}
            onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
            required
            rows="3"
          />
        </form>
        
        <div className="grid">
          {maintenance.map(maint => (
            <div key={maint.id} className="card">
              <div className="card-header">
                <h3>{maint.system_name}</h3>
                <button 
                  onClick={() => deleteMaintenance(maint.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️
                </button>
              </div>
              <p><strong>Description:</strong> {maint.description}</p>
              <p><strong>Scheduled Date:</strong> {maint.scheduled_date}</p>
              <p><strong>Technician:</strong> {maint.technician}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
