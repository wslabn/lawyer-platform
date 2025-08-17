const express = require('express');
const { getDb } = require('../models/database');
const router = express.Router();

// GET all time entries
router.get('/', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT t.*, c.name as client_name, cs.title as case_title 
    FROM time_entries t 
    LEFT JOIN clients c ON t.billable_to_client_id = c.id 
    LEFT JOIN cases cs ON t.case_id = cs.id 
    ORDER BY t.date DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST new time entry
router.post('/', (req, res) => {
  const { client_id, case_id, description, hours, rate, date } = req.body;
  const db = getDb();
  
  db.run(
    'INSERT INTO time_entries (billable_to_client_id, case_id, performed_by_user_id, description, hours, rate, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [client_id, case_id, 1, description, hours, rate, date], // Using user ID 1 as default for now
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, client_id, case_id, description, hours, rate, date });
    }
  );
});

module.exports = router;