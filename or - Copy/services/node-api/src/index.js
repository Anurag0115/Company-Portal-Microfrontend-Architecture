import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import pg from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 4000;
const DATABASE_URL = process.env.DATABASE_URL;
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';

if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL });

async function ensureSchema() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS documents (
			id SERIAL PRIMARY KEY,
			department VARCHAR(64) NOT NULL,
			title TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);
	`);
}

app.get('/health', async (_req, res) => {
	try {
		await pool.query('SELECT 1');
		res.json({ status: 'ok' });
	} catch (err) {
		res.status(500).json({ status: 'error', error: String(err) });
	}
});

app.get('/documents', async (req, res) => {
	const { department } = req.query;
	try {
		let result;
		if (department) {
			result = await pool.query('SELECT * FROM documents WHERE department = $1 ORDER BY created_at DESC', [department]);
		} else {
			result = await pool.query('SELECT * FROM documents ORDER BY created_at DESC');
		}
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: String(err) });
	}
});

app.post('/documents', async (req, res) => {
	const { department, title, content } = req.body;
	if (!department || !title || !content) {
		return res.status(400).json({ error: 'department, title, and content are required' });
	}
	try {
		const insert = await pool.query(
			'INSERT INTO documents (department, title, content) VALUES ($1, $2, $3) RETURNING *',
			[department, title, content]
		);
		const doc = insert.rows[0];

		// Fire-and-forget indexing. Do not block response on RAG service.
		axios.post(`${RAG_SERVICE_URL}/embed-index`, {
			id: String(doc.id),
			department,
			title,
			content
		}).catch((e) => console.error('RAG indexing error:', e.message));

		res.status(201).json(doc);
	} catch (err) {
		res.status(500).json({ error: String(err) });
	}
});

app.delete('/documents/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const del = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
		if (del.rowCount === 0) {
			return res.status(404).json({ error: 'Not found' });
		}
		// Optional: inform RAG service to delete vector (not implemented in this scaffold)
		res.json({ deleted: del.rows[0] });
	} catch (err) {
		res.status(500).json({ error: String(err) });
	}
});

app.listen(PORT, async () => {
	await ensureSchema();
	console.log(`Node API listening on http://localhost:${PORT}`);
}); 