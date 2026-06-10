// 1. IMPORT DEPENDENCIES

require('dotenv').config();

// Import 'express' to create our web server and handle HTTP requests.
const express = require('express');

// Import our database connection file (where SQLite/better-sqlite3 is set up).
const db = require('./database');

// Import CORS middleware to allow cross-origin requests from our frontend.
const PORT = process.env.PORT || 3001;

// Import the authentication router we created. 
// We use object destructuring and rename 'router' to 'authRouter' to avoid naming conflicts.
const { router: authRouter } = require('./auth');

// Import our custom middleware function that validates JWT tokens.
const authenticate = require('./middleware/authenticate');

// Create an instance of an Express application. This 'app' object is our server.
const app = express();

// 2. MIDDLEWARE SETUP

// Built-in middleware that parses incoming requests with JSON payloads.
// It allows us to read data sent by the user inside 'req.body'.
app.use(express.json());

// Import and use CORS (Cross-Origin Resource Sharing) middleware.
// This allows your frontend application (running on a different port/domain) to safely make requests to this API.
const cors = require('cors');
app.use(cors());

// A custom Logger Middleware. It runs on EVERY single request.
app.use((req, res, next) => {
  // Prints out the HTTP Method (e.g., GET, POST) and the URL (e.g., /notes) to your terminal.
  console.log(`${req.method} ${req.url}`);
  // 'next()' tells Express to stop hanging and move to the actual route handler below.
  next();
});

// 3. AUTHENTICATION ROUTING

// Link our authRouter to the '/auth' prefix.
// This means any route defined inside authRouter (like /register and /login) 
// will now be accessible at http://localhost:3001/auth/register and http://localhost:3001/auth/login.
app.use('/auth', authRouter);


// 4. API ROUTES (Protected CRUD Operations)

// NOTE: We have injected the 'authenticate' middleware as the second argument 
// in these routes. Express will now run that security check BEFORE executing our route code.


// --- GET ALL NOTES ---
// Securely fetches all notes belonging to the system.
app.get('/notes', authenticate, (req, res) => {
  // OPTIONAL BONUS TIP: Because 'authenticate' adds 'req.user', you could filter notes by user ID here!
  // e.g., db.prepare('SELECT * FROM notes WHERE user_id = ?').all(req.user.userId);
  
  // 'db.prepare' sets up the SQL query. 'ORDER BY id DESC' means newest notes appear first.
  const notes = db.prepare('SELECT * FROM notes ORDER BY id DESC').all();
  
  // Send the array of notes back to the client as a JSON response.
  res.json(notes);
});


// --- GET A SINGLE NOTE BY ID ---
// Wildcard route parameter ':id'. Only executes if a valid token is provided.
app.get('/notes/:id', authenticate, (req, res) => {
  // 'req.params.id' grabs whatever value was put in place of ':id' in the URL.
  const note = db.prepare('SELECT * FROM notes WHERE id = ?')
                  .get(req.params.id);
  
  // If no note was found with that ID, return a 404 (Not Found) status error.
  if (!note) return res.status(404).json({ error: 'Note not found' });
  
  // If found, send the note data back to the client.
  res.json(note);
});


// --- CREATE A NEW NOTE ---
// Handles 'POST /notes'. User must be authenticated to create a note.
app.post('/notes', authenticate, (req, res) => {
  // Destructure 'title' and 'content' out of the incoming request body JSON.
  const { title, content } = req.body;
  
  // Validation: Ensure the user actually provided both a title and content.
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }

  // Insert the title and content into the table rows.
  const result = db.prepare(
    'INSERT INTO notes (title, content) VALUES (?, ?)'
  ).run(title, content);

  // Fetch the specific new note using the last inserted row ID.
  const newNote = db.prepare('SELECT * FROM notes WHERE id = ?')
                       .get(result.lastInsertRowid);
  
  // 201 means "Created successfully". Return the full note object.
  res.status(201).json(newNote);
});


// --- UPDATE AN EXISTING NOTE ---
// Handles 'PUT /notes/:id'. User must be authenticated to update a note.
app.put('/notes/:id', authenticate, (req, res) => {
  const { title, content } = req.body;
  
  // Step 1: Check if the note actually exists before we try to update it.
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?')
                      .get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Note not found' });

  // Step 2: Run the UPDATE SQL command.
  db.prepare(
    'UPDATE notes SET title = ?, content = ? WHERE id = ?'
  ).run(title || existing.title, content || existing.content, req.params.id);

  // Step 3: Fetch the fresh, newly updated note from the DB.
  const updated = db.prepare('SELECT * FROM notes WHERE id = ?')
                       .get(req.params.id);
                       
  // Send the updated note back to the client.
  res.json(updated);
});


// --- DELETE A NOTE ---
// Handles 'DELETE /notes/:id'. User must be authenticated to wipe data.
app.delete('/notes/:id', authenticate, (req, res) => {
  // Step 1: Check if the note exists.
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?')
                      .get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Note not found' });

  // Step 2: Run the DELETE SQL command for this specific ID.
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  
  // Step 3: Send back a friendly confirmation message.
  res.json({ message: 'Note deleted' });
});


// 5. SERVER START

// Tells our app to start listening for incoming internet traffic on port 3001.
app.listen(PORT, () => {
  console.log(`Notes API running at http://localhost:${PORT}`);
});