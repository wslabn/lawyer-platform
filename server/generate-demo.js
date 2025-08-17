const db = require('./models/database');
const { generateDemoData } = require('./demo-data');

// Initialize database and generate demo data
db.init().then(async () => {
  console.log('Database initialized successfully');
  await generateDemoData();
  console.log('\nDemo data generation complete! You can now start the server and test the application.');
  process.exit(0);
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});