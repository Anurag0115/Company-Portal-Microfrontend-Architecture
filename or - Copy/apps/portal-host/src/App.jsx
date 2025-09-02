import { useEffect, useState } from 'react'

const iframeStyle = { width: '100%', height: '600px', border: '1px solid #e5e7eb', borderRadius: 8 }

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

	async function ask() {
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
			setAnswer(String(e))
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
			const res = await fetch('http://localhost:4000/documents', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ department: newDepartment, title: newTitle, content: newContent })
			})
			if (!res.ok) {
				const err = await res.json().catch(() => ({}))
				throw new Error(err.error || `Upload failed with status ${res.status}`)
			}
			const doc = await res.json()
			setUploadMsg(`Uploaded document #${doc.id} (${doc.title})`)
			setNewTitle('')
			setNewContent('')
		} catch (e) {
			setUploadMsg(String(e.message || e))
		} finally {
			setUploading(false)
		}
	}

	useEffect(() => { /* placeholder for future shared state */ }, [])

	return (
		<div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
			<h1>Knowledge Hub Portal</h1>
			<div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
				<input value={question} onChange={e => setQuestion(e.target.value)} style={{ flex: 1, padding: 8 }} placeholder="Ask a question" />
				<select value={department} onChange={e => setDepartment(e.target.value)}>
					<option>HR</option>
					<option>IT</option>
					<option>Finance</option>
				</select>
				<button onClick={ask} disabled={loading}>{loading ? 'Asking...' : 'Ask'}</button>
			</div>
			{answer && (
				<div style={{ whiteSpace: 'pre-wrap', background: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 20 }}>{answer}</div>
			)}

			<section style={{ marginBottom: 24 }}>
				<h2>Upload a Document</h2>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, maxWidth: 800 }}>
					<label>
						Department
						<select value={newDepartment} onChange={e => setNewDepartment(e.target.value)} style={{ display: 'block', marginTop: 4 }}>
							<option>HR</option>
							<option>IT</option>
							<option>Finance</option>
						</select>
					</label>
					<label>
						Title
						<input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g., Leave Policy" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
					</label>
					<label>
						Content
						<textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Paste the policy text here" rows={6} style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
					</label>
					<div>
						<button onClick={uploadDocument} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload & Index'}</button>
					</div>
					{uploadMsg && <div style={{ color: uploadMsg.startsWith('Uploaded') ? 'green' : 'crimson' }}>{uploadMsg}</div>}
				</div>
			</section>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
				<section>
					<h2>HR (Vue)</h2>
					<iframe src="http://localhost:5174" style={iframeStyle} title="HR" />
				</section>
				<section>
					<h2>IT (Angular)</h2>
					<iframe src="http://localhost:5175" style={iframeStyle} title="IT" />
				</section>
				<section>
					<h2>Finance (React)</h2>
					<iframe src="http://localhost:5176" style={iframeStyle} title="Finance" />
				</section>
			</div>
		</div>
	)
} 