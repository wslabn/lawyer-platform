const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { getDb } = require('../models/database');
const router = express.Router();

// GET all invoices
router.get('/', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT i.*, c.name as client_name 
    FROM invoices i 
    JOIN clients c ON i.client_id = c.id 
    ORDER BY i.created_at DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET unbilled time entries for client
router.get('/unbilled/:clientId', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT t.*, c.name as client_name, cs.title as case_title 
    FROM time_entries t 
    JOIN clients c ON t.client_id = c.id 
    LEFT JOIN cases cs ON t.case_id = cs.id 
    WHERE t.client_id = ? AND t.id NOT IN (
      SELECT time_entry_id FROM invoice_items WHERE time_entry_id IS NOT NULL
    )
    ORDER BY t.date DESC
  `;
  db.all(sql, [req.params.clientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST create invoice from time entries
router.post('/generate', async (req, res) => {
  const { client_id, time_entry_ids, due_date } = req.body;
  const db = getDb();
  
  try {
    // Get time entries
    const placeholders = time_entry_ids.map(() => '?').join(',');
    const timeEntries = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM time_entries WHERE id IN (${placeholders})`,
        time_entry_ids,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    const total = timeEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0);
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Create invoice
    const invoiceId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO invoices (client_id, invoice_number, total, status, due_date) VALUES (?, ?, ?, ?, ?)',
        [client_id, invoiceNumber, total, 'draft', due_date],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // Create invoice items table if not exists
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS invoice_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_id INTEGER NOT NULL,
          time_entry_id INTEGER,
          description TEXT NOT NULL,
          hours REAL,
          rate REAL,
          amount REAL NOT NULL,
          FOREIGN KEY (invoice_id) REFERENCES invoices (id),
          FOREIGN KEY (time_entry_id) REFERENCES time_entries (id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Add invoice items
    for (const entry of timeEntries) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO invoice_items (invoice_id, time_entry_id, description, hours, rate, amount) VALUES (?, ?, ?, ?, ?, ?)',
          [invoiceId, entry.id, entry.description, entry.hours, entry.rate, entry.hours * entry.rate],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    res.json({ 
      id: invoiceId, 
      invoice_number: invoiceNumber, 
      total, 
      items: timeEntries.length,
      message: 'Invoice generated successfully' 
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate invoice: ' + error.message });
  }
});

// GET invoice details with items
router.get('/:id/details', (req, res) => {
  const db = getDb();
  
  // Get invoice
  db.get('SELECT i.*, c.name as client_name, c.address as client_address FROM invoices i JOIN clients c ON i.client_id = c.id WHERE i.id = ?', 
    [req.params.id], (err, invoice) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    // Get invoice items
    db.all('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id], (err, items) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ ...invoice, items });
    });
  });
});

// PUT update invoice status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const db = getDb();
  
  db.run(
    'UPDATE invoices SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, status, updated: true });
    }
  );
});

module.exports = router;