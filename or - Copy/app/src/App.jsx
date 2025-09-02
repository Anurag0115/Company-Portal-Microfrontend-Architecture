import { useState } from 'react'

export default function App() {
  const [question, setQuestion] = useState('What is the leave policy?')
  const [department, setDepartment] = useState('HR')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Upload form state
  const [newDepartment, setNewDepartment] = useState('HR')
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  async function askQuestion() {
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, department })
      })
      const data = await res.json()
      setAnswer(data.answer || JSON.stringify(data))
    } catch (e) {
      setAnswer(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function uploadDocument() {
    if (!newTitle.trim() || !newContent.trim()) {
      setUploadMsg('Title and content are required')
      return
    }
    setUploading(true)
    setUploadMsg('')
    try {
      const res = await fetch('http://localhost:8000/embed-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: Date.now().toString(),
          department: newDepartment, 
          title: newTitle, 
          content: newContent 
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Upload failed with status ${res.status}`)
      }
      const doc = await res.json()
      setUploadMsg(`Uploaded and indexed document: ${doc.id}`)
      setNewTitle('')
      setNewContent('')
    } catch (e) {
      setUploadMsg(`Error: ${e.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ 
      fontFamily: 'Inter, system-ui, sans-serif', 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 20 
    }}>
      <h1>🤖 Knowledge Hub</h1>
      
      {/* Upload Section */}
      <section style={{ 
        background: '#f8fafc', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 32 
      }}>
        <h2>📄 Upload Document</h2>
        <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Department
            </label>
            <select 
              value={newDepartment} 
              onChange={e => setNewDepartment(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #d1d5db' 
              }}
            >
              <option>HR</option>
              <option>IT</option>
              <option>Finance</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Title
            </label>
            <input 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              placeholder="e.g., Leave Policy" 
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #d1d5db' 
              }} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Content
            </label>
            <textarea 
              value={newContent} 
              onChange={e => setNewContent(e.target.value)} 
              placeholder="Paste the policy text here..." 
              rows={6} 
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #d1d5db',
                resize: 'vertical'
              }} 
            />
          </div>
          
          <button 
            onClick={uploadDocument} 
            disabled={uploading}
            style={{
              padding: '12px 24px',
              background: uploading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: 500
            }}
          >
            {uploading ? 'Uploading...' : '📤 Upload & Index'}
          </button>
          
          {uploadMsg && (
            <div style={{ 
              color: uploadMsg.startsWith('Error') ? '#dc2626' : '#059669',
              padding: 12,
              background: uploadMsg.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
              borderRadius: 6,
              border: `1px solid ${uploadMsg.startsWith('Error') ? '#fecaca' : '#bbf7d0'}`
            }}>
              {uploadMsg}
            </div>
          )}
        </div>
      </section>

      {/* Query Section */}
      <section style={{ 
        background: '#f8fafc', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 32 
      }}>
        <h2>❓ Ask Questions</h2>
        <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Question
            </label>
            <input 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              placeholder="Ask about company policies..." 
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #d1d5db' 
              }} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Department (optional)
            </label>
            <select 
              value={department} 
              onChange={e => setDepartment(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #d1d5db' 
              }}
            >
              <option>All</option>
              <option>HR</option>
              <option>IT</option>
              <option>Finance</option>
            </select>
          </div>
          
          <button 
            onClick={askQuestion} 
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500
            }}
          >
            {loading ? 'Asking...' : '🔍 Ask AI'}
          </button>
          
          {answer && (
            <div style={{ 
              background: 'white', 
              padding: 16, 
              borderRadius: 8, 
              border: '1px solid #e5e7eb',
              whiteSpace: 'pre-wrap'
            }}>
              <strong>Answer:</strong><br />
              {answer}
            </div>
          )}
        </div>
      </section>

      <div style={{ 
        textAlign: 'center', 
        color: '#6b7280', 
        fontSize: 14,
        borderTop: '1px solid #e5e7eb',
        paddingTop: 20
      }}>
        <p>💡 Tip: Upload some documents first, then ask questions about them!</p>
        <p>🔧 RAG API running on http://localhost:8000</p>
      </div>
    </div>
  )
} 