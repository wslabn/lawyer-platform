const express = require('express');
const { getDb } = require('../models/database');
const router = express.Router();

// GET all cases
router.get('/', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT c.*, cl.name as client_name 
    FROM cases c 
    JOIN clients cl ON c.client_id = cl.id 
    ORDER BY c.created_at DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET cases by client
router.get('/client/:clientId', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM cases WHERE client_id = ? ORDER BY created_at DESC', [req.params.clientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST new case
router.post('/', (req, res) => {
  const { client_id, case_number, title, description, status } = req.body;
  const db = getDb();
  
  db.run(
    'INSERT INTO cases (client_id, case_number, title, description, status) VALUES (?, ?, ?, ?, ?)',
    [client_id, case_number, title, description, status || 'active'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, client_id, case_number, title, description, status });
    }
  );
});

// PUT update case
router.put('/:id', (req, res) => {
  const { case_number, title, description, status } = req.body;
  const db = getDb();
  
  db.run(
    'UPDATE cases SET case_number = ?, title = ?, description = ?, status = ? WHERE id = ?',
    [case_number, title, description, status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, case_number, title, description, status });
    }
  );
});

module.exports = router;