// 1. DEPENDENCIES & INITIAL SETUPS

// Import Express framework to handle routing and HTTP requests
const express = require('express');

// Import bcryptjs for securely hashing and comparing passwords
const bcrypt = require('bcryptjs');

// Import jsonwebtoken (JWT) to generate secure digital tokens for user sessions
const jwt = require('jsonwebtoken');

// Import the local database instance (assumed to be SQLite based on the syntax)
const db = require('./database');

// Create an isolated Express router instance to group authentication routes
const router = express.Router();

// Define a secret key used to sign the JWTs. 
// WARNING: In production, always load this from an environment file (e.g., process.env.JWT_SECRET)
const SECRET = 'mysecretkey123'; 

// 2. USER REGISTRATION ROUTE (POST /auth/register)
router.post('/register', async (req, res) => {
  // Extract email and password from the incoming request body (submitted by the user)
  const { email, password } = req.body;

  // Validation: If either email or password is missing, halt and return a 400 Bad Request error
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Security layer: Hash the raw password using bcrypt with a "salt rounds" value of 10.
  // This ensures plain-text passwords are never exposed or saved to the database.
  const hashed = await bcrypt.hash(password, 10);

  try {
    // Prepare an SQL statement to securely insert the new user data using placeholders (?) to prevent SQL injection
    // Run the query, passing in the user's email and the newly generated hashed password
    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)')
      .run(email, hashed);

    // If successful, return a 201 Created status alongside a success message
    res.status(201).json({ message: 'User created' });
  } catch (e) {
    // If the database query fails (e.g., email constraint violation if it already exists), 
    // catch the error and respond with a 400 Bad Request
    res.status(400).json({ error: 'Email already exists' });
  }
});

// 3. USER LOGIN ROUTE (POST /auth/login)
router.post('/login', async (req, res) => {
  // Extract credentials from the login form/request body
  const { email, password } = req.body;

  // Search the database for a user matching the provided email address
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // Security best practice: If no user is found, return 401 Unauthorized.
  // Note: We use a generic "Invalid credentials" message so hackers don't know if the email exists.
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare the plain text password from the request with the securely hashed password stored in the database
  const match = await bcrypt.compare(password, user.password);
  
  // If the passwords do not match, reject the request with a 401 Unauthorized error
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // If credentials are correct, generate a JSON Web Token (JWT).
  // Payload: We embed the public user info (id and email).
  // Options: We pass the secret key to sign it, and configure it to automatically expire in 24 hours.
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
    expiresIn: '24h'
  });

  // Send the generated token and user's email back to the client.
  // The client will store this token and send it back in headers for future authorized requests.
  res.json({ token, email: user.email });
});


// 4. EXPORTS
// Export the router and the secret key so they can be imported and used in the main server file (e.g., app.js or server.js)
module.exports = { router, SECRET };