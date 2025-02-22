const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./warnings.db');

// Create the warnings table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS warnings (
      user_id TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    )
  `);
});

module.exports = db;