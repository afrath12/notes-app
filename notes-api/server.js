// 1. IMPORT DEPENDENCIES
// We import 'express' to create our web server and handle HTTP requests.
const express = require('express');
// We import our database connection file (where SQLite/better-sqlite3 is set up).
const db      = require('./database');

// Create an instance of an Express application. This 'app' object is our server.
const app     = express();

// 2. MIDDLEWARE Setup
// This built-in middleware parses incoming requests with JSON payloads.
// It allows us to read data sent by the user inside 'req.body'.
app.use(express.json());


const cors = require('cors');
app.use(cors());

// A custom Logger Middleware. It runs on EVERY single request.
app.use((req, res, next) => {
  // Prints out the HTTP Method (e.g., GET, POST) and the URL (e.g., /notes) to your terminal.
  console.log(`${req.method} ${req.url}`);
  // 'next()' tells Express to stop hanging and move to the actual route handler below.
  next();
});


// 3. API ROUTES (CRUD Operations)

// --- GET ALL NOTES ---
// Handlers for 'GET /notes'. Used to fetch a list of all notes.
app.get('/notes', (req, res) => {
  // 'db.prepare' sets up the SQL query. 'ORDER BY id DESC' means newest notes appear first.
  // '.all()' executes the query and returns an array of all matching rows.
  const notes = db.prepare('SELECT * FROM notes ORDER BY id DESC').all();
  
  // Send the array of notes back to the client as a JSON response.
  res.json(notes);
});


// --- GET A SINGLE NOTE BY ID ---
// ':id' is a route parameter (a wildcard). It can be /notes/1, /notes/42, etc.
app.get('/notes/:id', (req, res) => {
  // 'req.params.id' grabs whatever value was put in place of ':id' in the URL.
  // The '?' is a placeholder to prevent SQL Injection attacks.
  // '.get()' executes the query and returns only ONE single object (or undefined if not found).
  const note = db.prepare('SELECT * FROM notes WHERE id = ?')
                  .get(req.params.id);
  
  // If no note was found with that ID, stop here and return a 404 (Not Found) status error.
  if (!note) return res.status(404).json({ error: 'Note not found' });
  
  // If found, send the note data back to the client.
  res.json(note);
});


// --- CREATE A NEW NOTE ---
// Handles 'POST /notes'. Used when a user submits a form to save a new note.
app.post('/notes', (req, res) => {
  // Destructure 'title' and 'content' out of the incoming request body JSON.
  const { title, content } = req.body;
  
  // Validation: Ensure the user actually provided both a title and content.
  if (!title || !content) {
    // 400 means "Bad Request" (the client forgot to send necessary data).
    return res.status(400).json({ error: 'Title and content required' });
  }

  // '.run()' is used for queries that change data (INSERT, UPDATE, DELETE) instead of reading it.
  // This inserts the title and content into the table rows.
  const result = db.prepare(
    'INSERT INTO notes (title, content) VALUES (?, ?)'
  ).run(title, content);

  // 'result.lastInsertRowid' is a feature of SQLite that gives us the ID of the note we just made.
  // We fetch that specific new note from the database so we can return it.
  const newNote = db.prepare('SELECT * FROM notes WHERE id = ?')
                     .get(result.lastInsertRowid);
  
  // 201 means "Created successfully". We send back the full note object (including its new ID).
  res.status(201).json(newNote);
});


// --- UPDATE AN EXISTING NOTE ---
// Handles 'PUT /notes/:id'. Used to edit a specific note.
app.put('/notes/:id', (req, res) => {
  const { title, content } = req.body;
  
  // Step 1: Check if the note actually exists before we try to update it.
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?')
                      .get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Note not found' });

  // Step 2: Run the UPDATE SQL command.
  // The 'title || existing.title' trick means: "Use the new title provided, 
  // but if the user didn't provide one, keep the old title exactly as it was."
  db.prepare(
    'UPDATE notes SET title = ?, content = ? WHERE id = ?'
  ).run(title || existing.title, content || existing.content, req.params.id);

  // Step 3: Fetch the fresh, newly updated note from the DB.
  const updated = db.prepare('SELECT * FROM notes WHERE id = ?')
                     .get(req.params.id);
                     
  // Send the updated note back to the client so they can display the changes.
  res.json(updated);
});


// --- DELETE A NOTE ---
// Handles 'DELETE /notes/:id'. Used to erase a note.
app.delete('/notes/:id', (req, res) => {
  // Step 1: Check if the note exists so we don't try deleting air.
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?')
                      .get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Note not found' });

  // Step 2: Run the DELETE SQL command for this specific ID.
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  
  // Step 3: Send back a friendly confirmation message.
  res.json({ message: 'Note deleted' });
});


// 4. SERVER START
// Tells our app to start listening for incoming internet traffic on port 3001.
app.listen(3001, () => {
  console.log('Notes API running at http://localhost:3001');
});