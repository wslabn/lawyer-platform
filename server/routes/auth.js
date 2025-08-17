const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../models/database');
const router = express.Router();

// POST login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  
  const db = getDb();
  
  db.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username], async (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    
    try {
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }
      
      // Parse custom permissions if they exist
      let permissions = null;
      if (user.custom_permissions) {
        try {
          permissions = JSON.parse(user.custom_permissions);
        } catch (e) {
          permissions = null;
        }
      }
      
      // Return user info without password
      res.json({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        custom_permissions: permissions,
        supervisor_id: user.supervisor_id,
        message: 'Login successful'
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Login failed: ' + error.message });
    }
  });
});

// POST logout (placeholder for session management)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;