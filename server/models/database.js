const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/lawyer_platform.db');
let db;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        billing_rate REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_number TEXT UNIQUE,
        internal_case_number TEXT,
        court_case_number TEXT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        practice_area TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS case_clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        role TEXT DEFAULT 'client',
        billing_responsibility REAL DEFAULT 1.0,
        is_primary_contact BOOLEAN DEFAULT 0,
        can_view_documents BOOLEAN DEFAULT 1,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases (id),
        FOREIGN KEY (client_id) REFERENCES clients (id),
        UNIQUE(case_id, client_id)
      )`,
      `CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT DEFAULT 'markdown',
        file_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases (id)
      )`,
      `CREATE TABLE IF NOT EXISTS document_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        can_view BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents (id),
        FOREIGN KEY (client_id) REFERENCES clients (id),
        UNIQUE(document_id, client_id)
      )`,
      `CREATE TABLE IF NOT EXISTS time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL,
        billable_to_client_id INTEGER,
        description TEXT NOT NULL,
        hours REAL NOT NULL,
        rate REAL NOT NULL,
        date DATE NOT NULL,
        benefits_all_clients BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases (id),
        FOREIGN KEY (billable_to_client_id) REFERENCES clients (id)
      )`,
      `CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER,
        client_id INTEGER NOT NULL,
        invoice_number TEXT UNIQUE NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        due_date DATE,
        FOREIGN KEY (case_id) REFERENCES cases (id),
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,
      `CREATE TABLE IF NOT EXISTS practice_areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          reject(err);
          return;
        }
        completed++;
        if (completed === tables.length) {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  });
};

const getDb = () => db;

module.exports = { init, getDb };