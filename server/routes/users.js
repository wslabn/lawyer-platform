const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../models/database');
const router = express.Router();

// Default role permissions
const DEFAULT_PERMISSIONS = {
  attorney: {
    clients: { create: true, edit: true, archive: true, view: true },
    cases: { create: true, edit: true, archive: true, view: true },
    documents: { create: true, edit: true, delete: true, view: true },
    time: { create: true, edit: true, delete: true, view: true },
    billing: { view_rates: true, modify_rates: true, create_invoices: true },
    users: { create: true, edit: true, archive: true, view: true },
    reports: { view: true, export: true }
  },
  support: {
    clients: { create: true, edit: true, archive: true, view: true },
    cases: { create: true, edit: true, archive: true, view: true },
    documents: { create: true, edit: true, delete: true, view: true },
    time: { create: true, edit: true, delete: true, view: true },
    billing: { view_rates: true, modify_rates: true, create_invoices: true },
    users: { create: true, edit: true, archive: true, view: true },
    reports: { view: true, export: true }
  },
  partner: {
    clients: { create: true, edit: true, archive: true, view: true },
    cases: { create: true, edit: true, archive: true, view: true },
    documents: { create: true, edit: true, delete: true, view: true },
    time: { create: true, edit: true, delete: true, view: true },
    billing: { view_rates: true, modify_rates: true, create_invoices: true },
    users: { create: true, edit: true, archive: true, view: true },
    reports: { view: true, export: true }
  },
  associate: {
    clients: { create: true, edit: true, archive: false, view: true },
    cases: { create: true, edit: true, archive: false, view: true },
    documents: { create: true, edit: true, delete: false, view: true },
    time: { create: true, edit: true, delete: false, view: true },
    billing: { view_rates: false, modify_rates: false, create_invoices: false },
    users: { create: false, edit: false, archive: false, view: true },
    reports: { view: true, export: false }
  },
  paralegal: {
    clients: { create: true, edit: true, archive: false, view: true },
    cases: { create: true, edit: true, archive: false, view: true },
    documents: { create: true, edit: true, delete: false, view: true },
    time: { create: true, edit: true, delete: false, view: true },
    billing: { view_rates: false, modify_rates: false, create_invoices: false },
    users: { create: false, edit: false, archive: false, view: true },
    reports: { view: true, export: false }
  }
};

// GET all users
router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT id, username, full_name, email, role, is_active, created_at FROM users WHERE is_active = 1 ORDER BY full_name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET user by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  db.get('SELECT id, username, full_name, email, role, custom_permissions, supervisor_id, is_active FROM users WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Parse custom permissions if they exist
    if (row.custom_permissions) {
      try {
        row.custom_permissions = JSON.parse(row.custom_permissions);
      } catch (e) {
        row.custom_permissions = null;
      }
    }
    
    res.json(row);
  });
});

// GET default permissions for role
router.get('/permissions/:role', (req, res) => {
  const role = req.params.role;
  const permissions = DEFAULT_PERMISSIONS[role];
  
  if (!permissions) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }
  
  res.json({ role, permissions });
});

// POST create user
router.post('/', async (req, res) => {
  const { username, password, full_name, email, role, custom_permissions, supervisor_id } = req.body;
  
  if (!username || !password || !full_name || !role) {
    res.status(400).json({ error: 'Username, password, full_name, and role are required' });
    return;
  }
  
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const db = getDb();
    
    db.run(
      'INSERT INTO users (username, password_hash, full_name, email, role, custom_permissions, supervisor_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, password_hash, full_name, email, role, custom_permissions ? JSON.stringify(custom_permissions) : null, supervisor_id],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Username already exists' });
          } else {
            res.status(500).json({ error: err.message });
          }
          return;
        }
        res.json({ 
          id: this.lastID, 
          username, 
          full_name, 
          email, 
          role,
          message: 'User created successfully' 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  const { full_name, email, role, custom_permissions, supervisor_id, password } = req.body;
  const db = getDb();
  
  try {
    let sql = 'UPDATE users SET full_name = ?, email = ?, role = ?, custom_permissions = ?, supervisor_id = ?';
    let params = [full_name, email, role, custom_permissions ? JSON.stringify(custom_permissions) : null, supervisor_id];
    
    // If password is provided, hash it and include in update
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      sql += ', password_hash = ?';
      params.push(password_hash);
    }
    
    sql += ' WHERE id = ?';
    params.push(req.params.id);
    
    db.run(sql, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, updated: true });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user: ' + error.message });
  }
});

// PUT archive user
router.put('/:id/archive', (req, res) => {
  const db = getDb();
  db.run('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, archived: true });
  });
});

// PUT reactivate user
router.put('/:id/reactivate', (req, res) => {
  const db = getDb();
  db.run('UPDATE users SET is_active = 1 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, reactivated: true });
  });
});

module.exports = router;