const express = require('express');
const { getDb } = require('../models/database');
const router = express.Router();

// GET all clients
router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM clients ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET client by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json(row);
  });
});

// POST new client
router.post('/', (req, res) => {
  const { name, email, phone, address, billing_rate } = req.body;
  const db = getDb();
  
  db.run(
    'INSERT INTO clients (name, email, phone, address, billing_rate) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, address, billing_rate || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, email, phone, address, billing_rate });
    }
  );
});

// PUT update client
router.put('/:id', (req, res) => {
  const { name, email, phone, address, billing_rate } = req.body;
  const db = getDb();
  
  db.run(
    'UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, billing_rate = ? WHERE id = ?',
    [name, email, phone, address, billing_rate, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, name, email, phone, address, billing_rate });
    }
  );
});

// DELETE client
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM clients WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

module.exports = router;