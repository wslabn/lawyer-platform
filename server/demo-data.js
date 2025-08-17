const { getDb } = require('./models/database');
const bcrypt = require('bcrypt');

const generateDemoData = async () => {
  const db = getDb();
  
  console.log('Generating demo data...');
  
  try {
    // Create demo users
    const users = [
      { username: 'attorney1', password: 'demo123', full_name: 'Sarah Johnson', email: 'sarah@lawfirm.com', role: 'attorney' },
      { username: 'support1', password: 'demo123', full_name: 'Mike Chen', email: 'mike@lawfirm.com', role: 'support' },
      { username: 'paralegal1', password: 'demo123', full_name: 'Lisa Rodriguez', email: 'lisa@lawfirm.com', role: 'paralegal' }
    ];
    
    const userIds = [];
    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, 10);
      const userId = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
          [user.username, password_hash, user.full_name, user.email, user.role],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      userIds.push(userId);
      console.log(`Created user: ${user.full_name} (${user.username})`);
    }
    
    // Create demo practice areas
    const practiceAreas = [
      { name: 'Family Law', code: 'FAM' },
      { name: 'Corporate Law', code: 'COR' },
      { name: 'Litigation', code: 'LIT' },
      { name: 'Estate Planning', code: 'EST' },
      { name: 'Real Estate', code: 'RE' }
    ];
    
    for (const area of practiceAreas) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO practice_areas (name, code) VALUES (?, ?)',
          [area.name, area.code],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      console.log(`Created practice area: ${area.name}`);
    }
    
    // Create demo clients
    const clients = [
      { name: 'John Smith', email: 'john.smith@email.com', phone: '555-0101', address: '123 Main St, Anytown, ST 12345', billing_rate: 350.00 },
      { name: 'Mary Johnson', email: 'mary.johnson@email.com', phone: '555-0102', address: '456 Oak Ave, Somewhere, ST 12346', billing_rate: 275.00 },
      { name: 'Robert Wilson', email: 'robert.wilson@email.com', phone: '555-0103', address: '789 Pine Rd, Elsewhere, ST 12347', billing_rate: 400.00 },
      { name: 'Jennifer Davis', email: 'jennifer.davis@email.com', phone: '555-0104', address: '321 Elm St, Nowhere, ST 12348', billing_rate: 325.00 },
      { name: 'Michael Brown', email: 'michael.brown@email.com', phone: '555-0105', address: '654 Maple Dr, Anywhere, ST 12349', billing_rate: 300.00 },
      { name: 'ABC Corporation', email: 'legal@abccorp.com', phone: '555-0201', address: '1000 Business Blvd, Corporate City, ST 54321', billing_rate: 450.00 }
    ];
    
    const clientIds = [];
    for (const client of clients) {
      const clientId = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO clients (name, email, phone, address, billing_rate) VALUES (?, ?, ?, ?, ?)',
          [client.name, client.email, client.phone, client.address, client.billing_rate],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      clientIds.push(clientId);
      console.log(`Created client: ${client.name}`);
    }
    
    // Create demo cases
    const cases = [
      { internal_case_number: 'FAM2024001', title: 'Smith Divorce Proceeding', description: 'Contested divorce with child custody issues', practice_area: 'Family Law', assigned_attorney_id: userIds[0], created_by_user_id: userIds[1] },
      { internal_case_number: 'LIT2024001', title: 'Johnson v. Insurance Co', description: 'Personal injury claim from auto accident', practice_area: 'Litigation', assigned_attorney_id: userIds[0], created_by_user_id: userIds[0] },
      { internal_case_number: 'COR2024001', title: 'ABC Corp Formation', description: 'New corporation setup and bylaws', practice_area: 'Corporate Law', assigned_attorney_id: userIds[0], created_by_user_id: userIds[1] },
      { internal_case_number: 'EST2024001', title: 'Wilson Estate Planning', description: 'Will and trust preparation', practice_area: 'Estate Planning', assigned_attorney_id: userIds[0], created_by_user_id: userIds[2] },
      { internal_case_number: 'RE2024001', title: 'Davis Property Purchase', description: 'Residential real estate transaction', practice_area: 'Real Estate', assigned_attorney_id: userIds[0], created_by_user_id: userIds[1] }
    ];
    
    const caseIds = [];
    for (let i = 0; i < cases.length; i++) {
      const case_ = cases[i];
      const caseId = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO cases (internal_case_number, title, description, practice_area, assigned_attorney_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?)',
          [case_.internal_case_number, case_.title, case_.description, case_.practice_area, case_.assigned_attorney_id, case_.created_by_user_id],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      caseIds.push(caseId);
      
      // Link cases to clients
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO case_clients (case_id, client_id, role, is_primary_contact) VALUES (?, ?, ?, ?)',
          [caseId, clientIds[i], 'client', 1],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      console.log(`Created case: ${case_.title}`);
    }
    
    // Create demo time entries
    const timeEntries = [
      { case_id: caseIds[0], billable_to_client_id: clientIds[0], performed_by_user_id: userIds[0], description: 'Initial client consultation', hours: 1.5, rate: 350.00, date: '2024-12-01' },
      { case_id: caseIds[0], billable_to_client_id: clientIds[0], performed_by_user_id: userIds[0], description: 'Draft divorce petition', hours: 2.0, rate: 350.00, date: '2024-12-02' },
      { case_id: caseIds[1], billable_to_client_id: clientIds[1], performed_by_user_id: userIds[0], description: 'Review medical records', hours: 1.0, rate: 275.00, date: '2024-12-03' },
      { case_id: caseIds[1], billable_to_client_id: clientIds[1], performed_by_user_id: userIds[2], description: 'Research case law', hours: 3.0, rate: 150.00, date: '2024-12-03' },
      { case_id: caseIds[2], billable_to_client_id: clientIds[5], performed_by_user_id: userIds[0], description: 'Corporate formation documents', hours: 2.5, rate: 450.00, date: '2024-12-04' },
      { case_id: caseIds[3], billable_to_client_id: clientIds[2], performed_by_user_id: userIds[0], description: 'Estate planning consultation', hours: 1.0, rate: 400.00, date: '2024-12-05' },
      { case_id: caseIds[4], billable_to_client_id: clientIds[3], performed_by_user_id: userIds[1], description: 'Title search and review', hours: 1.5, rate: 200.00, date: '2024-12-06' }
    ];
    
    for (const entry of timeEntries) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO time_entries (case_id, billable_to_client_id, performed_by_user_id, description, hours, rate, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [entry.case_id, entry.billable_to_client_id, entry.performed_by_user_id, entry.description, entry.hours, entry.rate, entry.date],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log(`Created time entry: ${entry.description}`);
    }
    
    // Create demo invoice
    const invoiceId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO invoices (case_id, client_id, invoice_number, total, status, created_by_user_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [caseIds[0], clientIds[0], 'INV-2024-001', 1225.00, 'sent', userIds[1], '2025-01-15'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // Create invoice items
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO invoice_items (invoice_id, description, hours, rate, amount) VALUES (?, ?, ?, ?, ?)',
        [invoiceId, 'Initial client consultation', 1.5, 350.00, 525.00],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO invoice_items (invoice_id, description, hours, rate, amount) VALUES (?, ?, ?, ?, ?)',
        [invoiceId, 'Draft divorce petition', 2.0, 350.00, 700.00],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log('Created demo invoice: INV-2024-001');
    
    console.log('\n✅ Demo data generation complete!');
    console.log('\nDemo Users:');
    console.log('- attorney1 / demo123 (Sarah Johnson - Attorney)');
    console.log('- support1 / demo123 (Mike Chen - Support)');
    console.log('- paralegal1 / demo123 (Lisa Rodriguez - Paralegal)');
    console.log('\nDemo includes:');
    console.log('- 6 clients with contact info and billing rates');
    console.log('- 5 cases across different practice areas');
    console.log('- 7 time entries with various billing scenarios');
    console.log('- 1 sample invoice');
    console.log('- 5 practice areas');
    
  } catch (error) {
    console.error('Error generating demo data:', error);
  }
};

module.exports = { generateDemoData };