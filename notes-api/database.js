const Database = require('better-sqlite3');

// This creates notes.db file if it doesn't exist
const db = new Database('notes.db');

// Create the notes table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    email    TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

// Seed some starter data so the app isn't empty
const count = db.prepare('SELECT COUNT(*) as n FROM notes').get();
if (count.n === 0) {
  db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)')
    .run('First note', 'This is my first note!');
  db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)')
    .run('SQL is cool', 'I learned SQL today and it clicked.');
}

module.exports = db;