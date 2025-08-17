const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// GET all templates
router.get('/', async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../../documents/templates');
    const files = await fs.readdir(templatesDir);
    const templates = [];
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(templatesDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const name = file.replace('.md', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        templates.push({
          id: file.replace('.md', ''),
          name: name,
          filename: file,
          preview: content.substring(0, 200) + '...'
        });
      }
    }
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load templates: ' + error.message });
  }
});

// GET template content
router.get('/:id', async (req, res) => {
  try {
    const templateFile = req.params.id + '.md';
    const filePath = path.join(__dirname, '../../documents/templates', templateFile);
    const content = await fs.readFile(filePath, 'utf8');
    
    res.json({
      id: req.params.id,
      filename: templateFile,
      content: content
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Template not found' });
    } else {
      res.status(500).json({ error: 'Failed to load template: ' + error.message });
    }
  }
});

module.exports = router;