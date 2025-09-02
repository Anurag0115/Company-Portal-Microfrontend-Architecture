import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [employees, setEmployees] = useState([])
  const [policies, setPolicies] = useState([])
  const [reports, setReports] = useState([])
  const [changeRequests, setChangeRequests] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', department: '', email: '', phone: '' })
  const [newPolicy, setNewPolicy] = useState({ title: '', description: '', category: '', effectiveDate: '' })
  const [newReport, setNewReport] = useState({ title: '', content: '', author: '', reportDate: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [employeesRes, policiesRes, reportsRes, requestsRes] = await Promise.all([
        fetch('http://localhost:5000/api/hr/employees'),
        fetch('http://localhost:5000/api/hr/policies'),
        fetch('http://localhost:5000/api/hr/reports'),
        fetch('http://localhost:5000/api/change-requests')
      ])
      
      const employeesData = await employeesRes.json()
      const policiesData = await policiesRes.json()
      const reportsData = await reportsRes.json()
      const requestsData = await requestsRes.json()
      
      // Filter change requests for HR department
      const hrRequests = requestsData.filter(req => req.department === 'HR')
      
      setEmployees(employeesData)
      setPolicies(policiesData)
      setReports(reportsData)
      setChangeRequests(hrRequests)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const addEmployee = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      })
      const employee = await response.json()
      setEmployees([employee, ...employees])
      setNewEmployee({ name: '', position: '', department: '', email: '', phone: '' })
      
      // Notify host app
      window.parent.postMessage({
        type: 'employee_added',
        data: employee
      }, '*')
    } catch (error) {
      console.error('Error adding employee:', error)
    }
  }

  const deleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await fetch(`http://localhost:5000/api/hr/employees/${id}`, {
          method: 'DELETE'
        })
        setEmployees(employees.filter(emp => emp.id !== id))
        
        // Notify host app
        window.parent.postMessage({
          type: 'employee_deleted',
          data: { id }
        }, '*')
      } catch (error) {
        console.error('Error deleting employee:', error)
      }
    }
  }

  const addPolicy = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/hr/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy)
      })
      const policy = await response.json()
      setPolicies([policy, ...policies])
      setNewPolicy({ title: '', description: '', category: '', effectiveDate: '' })
      
      // Notify host app
      window.parent.postMessage({
        type: 'policy_added',
        data: policy
      }, '*')
    } catch (error) {
      console.error('Error adding policy:', error)
    }
  }

  const deletePolicy = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await fetch(`http://localhost:5000/api/hr/policies/${id}`, {
          method: 'DELETE'
        })
        setPolicies(policies.filter(policy => policy.id !== id))
        
        // Notify host app
        window.parent.postMessage({
          type: 'policy_deleted',
          data: { id }
        }, '*')
      } catch (error) {
        console.error('Error deleting policy:', error)
      }
    }
  }

  const addReport = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/hr/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      })
      const report = await response.json()
      setReports([report, ...reports])
      setNewReport({ title: '', content: '', author: '', reportDate: '' })
      
      // Notify host app
      window.parent.postMessage({
        type: 'report_added',
        data: report
      }, '*')
    } catch (error) {
      console.error('Error adding report:', error)
    }
  }

  const deleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await fetch(`http://localhost:5000/api/hr/reports/${id}`, {
          method: 'DELETE'
        })
        setReports(reports.filter(report => report.id !== id))
        
        // Notify host app
        window.parent.postMessage({
          type: 'report_deleted',
          data: { id }
        }, '*')
      } catch (error) {
        console.error('Error deleting report:', error)
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
    <div className="hr-app">
      <div className="header">
        <h1>👥 HR Department</h1>
        <p>Manage employees, policies, and reports</p>
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

      {/* Employee Management */}
      <div className="section">
        <h2>👥 Employee Management</h2>
        <form onSubmit={addEmployee} className="form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Position"
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Department"
              value={newEmployee.department}
              onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-primary">Add Employee</button>
          </div>
        </form>
        
        <div className="grid">
          {employees.map(employee => (
            <div key={employee.id} className="card">
              <div className="card-header">
                <h3>{employee.name}</h3>
                <button 
                  onClick={() => deleteEmployee(employee.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️
                </button>
              </div>
              <p><strong>Position:</strong> {employee.position}</p>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Phone:</strong> {employee.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Management */}
      <div className="section">
        <h2>📋 Policy Management</h2>
        <form onSubmit={addPolicy} className="form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Policy Title"
              value={newPolicy.title}
              onChange={(e) => setNewPolicy({...newPolicy, title: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={newPolicy.category}
              onChange={(e) => setNewPolicy({...newPolicy, category: e.target.value})}
              required
            />
            <input
              type="date"
              value={newPolicy.effectiveDate}
              onChange={(e) => setNewPolicy({...newPolicy, effectiveDate: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-primary">Add Policy</button>
          </div>
          <textarea
            placeholder="Policy Description"
            value={newPolicy.description}
            onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
            required
            rows="3"
          />
        </form>
        
        <div className="grid">
          {policies.map(policy => (
            <div key={policy.id} className="card">
              <div className="card-header">
                <h3>{policy.title}</h3>
                <button 
                  onClick={() => deletePolicy(policy.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️
                </button>
              </div>
              <p><strong>Category:</strong> {policy.category}</p>
              <p><strong>Effective Date:</strong> {policy.effective_date}</p>
              <p><strong>Description:</strong> {policy.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Management */}
      <div className="section">
        <h2>📊 Report Management</h2>
        <form onSubmit={addReport} className="form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Report Title"
              value={newReport.title}
              onChange={(e) => setNewReport({...newReport, title: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Author"
              value={newReport.author}
              onChange={(e) => setNewReport({...newReport, author: e.target.value})}
              required
            />
            <input
              type="date"
              value={newReport.reportDate}
              onChange={(e) => setNewReport({...newReport, reportDate: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-primary">Add Report</button>
          </div>
          <textarea
            placeholder="Report Content"
            value={newReport.content}
            onChange={(e) => setNewReport({...newReport, content: e.target.value})}
            required
            rows="3"
          />
        </form>
        
        <div className="grid">
          {reports.map(report => (
            <div key={report.id} className="card">
              <div className="card-header">
                <h3>{report.title}</h3>
                <button 
                  onClick={() => deleteReport(report.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️
                </button>
              </div>
              <p><strong>Author:</strong> {report.author}</p>
              <p><strong>Date:</strong> {report.report_date}</p>
              <p><strong>Content:</strong> {report.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
