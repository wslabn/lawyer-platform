const express = require('express');
const { getDb } = require('../models/database');
const router = express.Router();

// GET all cases
router.get('/', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT c.*, 
           GROUP_CONCAT(cl.name, ', ') as client_name,
           COUNT(cc.client_id) as client_count
    FROM cases c 
    LEFT JOIN case_clients cc ON c.id = cc.case_id AND cc.status = 'active'
    LEFT JOIN clients cl ON cc.client_id = cl.id AND cl.is_active = 1
    WHERE c.is_active = 1
    GROUP BY c.id
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
  const sql = `
    SELECT c.* 
    FROM cases c 
    JOIN case_clients cc ON c.id = cc.case_id 
    WHERE cc.client_id = ? AND c.is_active = 1 AND cc.status = 'active'
    ORDER BY c.created_at DESC
  `;
  db.all(sql, [req.params.clientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST new case
router.post('/', (req, res) => {
  const { client_id, case_number, title, description, status, practice_area } = req.body;
  const db = getDb();
  
  // Create case first
  db.run(
    'INSERT INTO cases (case_number, internal_case_number, title, description, status, practice_area) VALUES (?, ?, ?, ?, ?, ?)',
    [case_number, case_number, title, description, status || 'active', practice_area],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const caseId = this.lastID;
      
      // Link case to client
      db.run(
        'INSERT INTO case_clients (case_id, client_id, role, is_primary_contact) VALUES (?, ?, ?, ?)',
        [caseId, client_id, 'client', 1],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ id: caseId, client_id, case_number, title, description, status, practice_area });
        }
      );
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