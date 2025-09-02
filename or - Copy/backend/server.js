import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'company.db'))

// Create tables if they don't exist
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // HR Tables
      db.run(`
        CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          position TEXT NOT NULL,
          department TEXT NOT NULL,
          email TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      db.run(`
        CREATE TABLE IF NOT EXISTS policies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          status TEXT DEFAULT 'Active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      db.run(`
        CREATE TABLE IF NOT EXISTS reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          status TEXT DEFAULT 'Generated',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // IT Tables
      db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          priority TEXT DEFAULT 'Medium',
          status TEXT DEFAULT 'Open',
          user TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      db.run(`
        CREATE TABLE IF NOT EXISTS systems (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          status TEXT DEFAULT 'Online',
          uptime TEXT DEFAULT '100%',
          last_check TEXT DEFAULT 'Just now',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      db.run(`
        CREATE TABLE IF NOT EXISTS maintenance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          date TEXT NOT NULL,
          status TEXT DEFAULT 'Scheduled',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Change Requests Table
      db.run(`
        CREATE TABLE IF NOT EXISTS change_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          department TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT DEFAULT 'Pending',
          requested_by TEXT DEFAULT 'Admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME
        )
      `)

      // Insert initial data if tables are empty
      db.get('SELECT COUNT(*) as count FROM employees', (err, row) => {
        if (err) {
          reject(err)
          return
        }
        if (row.count === 0) {
          db.run('INSERT INTO employees (name, position, department, email) VALUES (?, ?, ?, ?)', 
            ['John Doe', 'Developer', 'Engineering', 'john@company.com'])
          db.run('INSERT INTO employees (name, position, department, email) VALUES (?, ?, ?, ?)', 
            ['Jane Smith', 'Manager', 'Sales', 'jane@company.com'])
        }
      })

      db.get('SELECT COUNT(*) as count FROM policies', (err, row) => {
        if (err) {
          reject(err)
          return
        }
        if (row.count === 0) {
          db.run('INSERT INTO policies (title, content) VALUES (?, ?)', 
            ['Leave Policy', 'Employees get 20 days annual leave'])
          db.run('INSERT INTO policies (title, content) VALUES (?, ?)', 
            ['Remote Work Policy', 'Hybrid work model - 3 days office, 2 days remote'])
        }
      })

      db.get('SELECT COUNT(*) as count FROM reports', (err, row) => {
        if (err) {
          reject(err)
          return
        }
        if (row.count === 0) {
          db.run('INSERT INTO reports (title, date) VALUES (?, ?)', 
            ['Monthly HR Report', '2024-01-15'])
          db.run('INSERT INTO reports (title, date) VALUES (?, ?)', 
            ['Employee Satisfaction Survey', '2024-01-10'])
        }
      })

      db.get('SELECT COUNT(*) as count FROM tickets', (err, row) => {
        if (err) {
          reject(err)
          return
        }
        if (row.count === 0) {
          db.run('INSERT INTO tickets (title, description, priority, status, user) VALUES (?, ?, ?, ?, ?)', 
            ['Login Issue', 'Cannot access email', 'High', 'Open', 'john@company.com'])
          db.run('INSERT INTO tickets (title, description, priority, status, user) VALUES (?, ?, ?, ?, ?)', 
            ['Printer Problem', 'Printer not working', 'Medium', 'In Progress', 'jane@company.com'])
        }
      })

      db.get('SELECT COUNT(*) as count FROM systems', (err, row) => {
        if (err) {
          reject(err)
          return
        }
        if (row.count === 0) {
          db.run('INSERT INTO systems (name, status, uptime, last_check) VALUES (?, ?, ?, ?)', 
            ['Email Server', 'Online', '99.9%', '2 min ago'])
          db.run('INSERT INTO systems (name, status, uptime, last_check) VALUES (?, ?, ?, ?)', 
            ['Database Server', 'Online', '99.8%', '1 min ago'])
          db.run('INSERT INTO systems (name, status, uptime, last_check) VALUES (?, ?, ?, ?)', 
            ['Web Server', 'Online', '99.7%', '3 min ago'])
        }
      })

      db.get('SELECT COUNT(*) as count FROM maintenance', (err, row) => {
        if (err) {
          reject(err)
          return
        }
        if (row.count === 0) {
          db.run('INSERT INTO maintenance (title, description, date) VALUES (?, ?, ?)', 
            ['Server Update', 'Security patches', '2024-01-20'])
          db.run('INSERT INTO maintenance (title, description, date) VALUES (?, ?, ?)', 
            ['Backup System', 'Monthly backup verification', '2024-01-25'])
        }
        resolve()
      })
    })
  })
}

// Initialize database
initDatabase().then(() => {
  console.log('Database initialized successfully')
}).catch(err => {
  console.error('Database initialization error:', err)
})

// Helper functions for database operations
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runQuerySingle = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const runInsert = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
};

const runUpdate = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};

const runDelete = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const stats = {
      employees: (await runQuerySingle('SELECT COUNT(*) as count FROM employees')).count,
      policies: (await runQuerySingle('SELECT COUNT(*) as count FROM policies')).count,
      reports: (await runQuerySingle('SELECT COUNT(*) as count FROM reports')).count,
      tickets: (await runQuerySingle('SELECT COUNT(*) as count FROM tickets')).count,
      systems: (await runQuerySingle('SELECT COUNT(*) as count FROM systems')).count,
      maintenance: (await runQuerySingle('SELECT COUNT(*) as count FROM maintenance')).count,
      changeRequests: (await runQuerySingle('SELECT COUNT(*) as count FROM change_requests')).count
    }
    res.json({ 
      status: 'ok', 
      message: 'Backend is running with database!',
      stats 
    })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
})

// Get all messages (legacy endpoint)
app.get('/api/messages', (req, res) => {
  res.json({ messages: [] })
})

// Send message endpoint (legacy endpoint)
app.post('/api/message', (req, res) => {
  const { message, department } = req.body
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }
  
  // Simple response based on department
  let response = `Received: "${message}"`
  if (department === 'hr') {
    response = `HR Department: We'll handle "${message}" - please contact HR team.`
  } else if (department === 'it') {
    response = `IT Department: We'll process "${message}" - ticket created.`
  }
  
  res.json({ 
    success: true, 
    response,
    messageId: Date.now() 
  })
})

// HR API endpoints
app.get('/api/hr/employees', async (req, res) => {
  try {
    const employees = await runQuery('SELECT * FROM employees ORDER BY id DESC');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hr/employees', async (req, res) => {
  try {
    const { name, position, department, email, phone } = req.body;
    const result = await runInsert(
      'INSERT INTO employees (name, position, department, email, phone) VALUES (?, ?, ?, ?, ?)',
      [name, position, department, email, phone]
    );
    res.json({ id: result.id, name, position, department, email, phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/hr/employees/:id', async (req, res) => {
  try {
    const result = await runDelete('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (result.changes > 0) {
      res.json({ message: 'Employee deleted successfully' });
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hr/policies', async (req, res) => {
  try {
    const policies = await runQuery('SELECT * FROM policies ORDER BY id DESC');
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hr/policies', async (req, res) => {
  try {
    const { title, description, category, effectiveDate } = req.body;
    const result = await runInsert(
      'INSERT INTO policies (title, description, category, effective_date) VALUES (?, ?, ?, ?)',
      [title, description, category, effectiveDate]
    );
    res.json({ id: result.id, title, description, category, effectiveDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/hr/policies/:id', async (req, res) => {
  try {
    const result = await runDelete('DELETE FROM policies WHERE id = ?', [req.params.id]);
    if (result.changes > 0) {
      res.json({ message: 'Policy deleted successfully' });
    } else {
      res.status(404).json({ error: 'Policy not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hr/reports', async (req, res) => {
  try {
    const reports = await runQuery('SELECT * FROM reports ORDER BY id DESC');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hr/reports', async (req, res) => {
  try {
    const { title, content, author, reportDate } = req.body;
    const result = await runInsert(
      'INSERT INTO reports (title, content, author, report_date) VALUES (?, ?, ?, ?)',
      [title, content, author, reportDate]
    );
    res.json({ id: result.id, title, content, author, reportDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/hr/reports/:id', async (req, res) => {
  try {
    const result = await runDelete('DELETE FROM reports WHERE id = ?', [req.params.id]);
    if (result.changes > 0) {
      res.json({ message: 'Report deleted successfully' });
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IT API endpoints
app.get('/api/it/tickets', async (req, res) => {
  try {
    const tickets = await runQuery('SELECT * FROM tickets ORDER BY id DESC');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/it/tickets', async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo } = req.body;
    const result = await runInsert(
      'INSERT INTO tickets (title, description, priority, status, assigned_to) VALUES (?, ?, ?, ?, ?)',
      [title, description, priority, status, assignedTo]
    );
    res.json({ id: result.id, title, description, priority, status, assignedTo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/it/tickets/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await runUpdate(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.changes > 0) {
      res.json({ message: 'Ticket status updated successfully' });
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/it/tickets/:id', async (req, res) => {
  try {
    const result = await runDelete('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    if (result.changes > 0) {
      res.json({ message: 'Ticket deleted successfully' });
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/it/systems', async (req, res) => {
  try {
    const systems = await runQuery('SELECT * FROM systems ORDER BY id DESC');
    res.json(systems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/it/systems', async (req, res) => {
  try {
    const { name, type, status, lastCheck } = req.body;
    const result = await runInsert(
      'INSERT INTO systems (name, type, status, last_check) VALUES (?, ?, ?, ?)',
      [name, type, status, lastCheck]
    );
    res.json({ id: result.id, name, type, status, lastCheck });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/it/systems/:id', async (req, res) => {
  try {
    const result = await runDelete('DELETE FROM systems WHERE id = ?', [req.params.id]);
    if (result.changes > 0) {
      res.json({ message: 'System deleted successfully' });
    } else {
      res.status(404).json({ error: 'System not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/it/maintenance', async (req, res) => {
  try {
    const maintenance = await runQuery('SELECT * FROM maintenance ORDER BY id DESC');
    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/it/maintenance', async (req, res) => {
  try {
    const { systemName, description, scheduledDate, technician } = req.body;
    const result = await runInsert(
      'INSERT INTO maintenance (system_name, description, scheduled_date, technician) VALUES (?, ?, ?, ?)',
      [systemName, description, scheduledDate, technician]
    );
    res.json({ id: result.id, systemName, description, scheduledDate, technician });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/it/maintenance/:id', async (req, res) => {
  try {
    const result = await runDelete('DELETE FROM maintenance WHERE id = ?', [req.params.id]);
    if (result.changes > 0) {
      res.json({ message: 'Maintenance record deleted successfully' });
    } else {
      res.status(404).json({ error: 'Maintenance record not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Requests API endpoints
app.get('/api/change-requests', async (req, res) => {
  try {
    const requests = await runQuery('SELECT * FROM change_requests ORDER BY id DESC');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/change-requests', async (req, res) => {
  try {
    const { department, description, priority, requestedBy } = req.body;
    const result = await runInsert(
      'INSERT INTO change_requests (department, description, priority, requested_by, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [department, description, priority, requestedBy, 'pending', new Date().toISOString()]
    );
    res.json({ 
      id: result.id, 
      department, 
      description, 
      priority, 
      requestedBy, 
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/change-requests/:id/complete', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const result = await runUpdate(
      'UPDATE change_requests SET status = ?, notes = ?, completed_at = ? WHERE id = ?',
      [status, notes, new Date().toISOString(), req.params.id]
    );
    if (result.changes > 0) {
      res.json({ message: 'Change request updated successfully' });
    } else {
      res.status(404).json({ error: 'Change request not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats endpoint for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      hr: {
        employees: (await runQuerySingle('SELECT COUNT(*) as count FROM employees')).count,
        policies: (await runQuerySingle('SELECT COUNT(*) as count FROM policies')).count,
        reports: (await runQuerySingle('SELECT COUNT(*) as count FROM reports')).count
      },
      it: {
        tickets: (await runQuerySingle('SELECT COUNT(*) as count FROM tickets')).count,
        systems: (await runQuerySingle('SELECT COUNT(*) as count FROM systems')).count,
        maintenance: (await runQuerySingle('SELECT COUNT(*) as count FROM maintenance')).count
      },
      changeRequests: (await runQuerySingle('SELECT COUNT(*) as count FROM change_requests')).count
    }
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📡 API endpoints:`)
  console.log(`   GET  /api/health`)
  console.log(`   GET  /api/stats`)
  console.log(`   GET  /api/hr/employees`)
  console.log(`   POST /api/hr/employees`)
  console.log(`   DELETE /api/hr/employees/:id`)
  console.log(`   GET  /api/hr/policies`)
  console.log(`   POST /api/hr/policies`)
  console.log(`   DELETE /api/hr/policies/:id`)
  console.log(`   GET  /api/hr/reports`)
  console.log(`   POST /api/hr/reports`)
  console.log(`   DELETE /api/hr/reports/:id`)
  console.log(`   GET  /api/it/tickets`)
  console.log(`   POST /api/it/tickets`)
  console.log(`   PUT  /api/it/tickets/:id`)
  console.log(`   DELETE /api/it/tickets/:id`)
  console.log(`   GET  /api/it/systems`)
  console.log(`   POST /api/it/systems`)
  console.log(`   DELETE /api/it/systems/:id`)
  console.log(`   GET  /api/it/maintenance`)
  console.log(`   POST /api/it/maintenance`)
  console.log(`   DELETE /api/it/maintenance/:id`)
  console.log(`   GET  /api/change-requests`)
  console.log(`   POST /api/change-requests`)
  console.log(`   PUT  /api/change-requests/:id/complete`)
  console.log(`📊 Database: company.db`)
})
