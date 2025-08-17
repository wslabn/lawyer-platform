const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const markdownpdf = require('markdown-pdf');
const { getDb } = require('../models/database');
const router = express.Router();

// GET all documents
router.get('/', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT d.*, c.name as client_name, cs.title as case_title 
    FROM documents d 
    LEFT JOIN clients c ON d.client_id = c.id 
    LEFT JOIN cases cs ON d.case_id = cs.id 
    ORDER BY d.updated_at DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET document content
router.get('/:id/content', async (req, res) => {
  const db = getDb();
  db.get('SELECT * FROM documents WHERE id = ?', [req.params.id], async (err, doc) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    
    try {
      const content = await fs.readFile(doc.file_path, 'utf8');
      res.json({ ...doc, content });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read document content' });
    }
  });
});

// POST new document
router.post('/', async (req, res) => {
  const { client_id, case_id, title, content } = req.body;
  const db = getDb();
  
  try {
    // Create directory structure
    const clientDir = path.join(__dirname, '../../documents/clients', `client_${client_id}`);
    await fs.mkdir(clientDir, { recursive: true });
    
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.md`;
    const filePath = path.join(clientDir, filename);
    
    // Save markdown file
    await fs.writeFile(filePath, content || '# ' + title);
    
    // Save to database
    db.run(
      'INSERT INTO documents (client_id, case_id, filename, title, type, file_path) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, case_id, filename, title, 'markdown', filePath],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, client_id, case_id, filename, title, type: 'markdown', file_path: filePath });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document: ' + error.message });
  }
});

// PUT update document
router.put('/:id', async (req, res) => {
  const { title, content } = req.body;
  const db = getDb();
  
  db.get('SELECT * FROM documents WHERE id = ?', [req.params.id], async (err, doc) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    
    try {
      // Update file content
      await fs.writeFile(doc.file_path, content);
      
      // Update database
      db.run(
        'UPDATE documents SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, req.params.id],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ id: req.params.id, title, updated: true });
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Failed to update document: ' + error.message });
    }
  });
});

// POST generate PDF
router.post('/:id/pdf', (req, res) => {
  const db = getDb();
  
  db.get('SELECT * FROM documents WHERE id = ?', [req.params.id], (err, doc) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    
    const pdfPath = doc.file_path.replace('.md', '.pdf');
    
    markdownpdf().from(doc.file_path).to(pdfPath, (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
        return;
      }
      res.json({ pdf_path: pdfPath, message: 'PDF generated successfully' });
    });
  });
});

module.exports = router;