// 1. DEPENDENCIES & INITIAL SETUPS

// Import the jsonwebtoken library to verify and decode incoming tokens
const jwt = require('jsonwebtoken');

// Import the shared SECRET key from your authentication file to validate token signatures
const { SECRET } = require('../auth');

// 2. AUTHENTICATION MIDDLEWARE FUNCTION

/**
 * Express middleware to protect routes. 
 * It intercepts incoming HTTP requests, checks for a valid JWT, and either:
 * 1. Grants access by calling next()
 * 2. Denies access by returning a 401 Unauthorized status
 */
function authenticate(req, res, next) {
  // Retrieve the 'Authorization' header from the incoming request
  // (Usually formatted by the client as: "Bearer <encoded_jwt_string>")
  const authHeader = req.headers['authorization'];
  
  // Validation: If the Authorization header doesn't exist, block the user immediately
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // The header looks like "Bearer eyJhbGciOi...". 
  // We use .split(' ') to break that string into an array: ['Bearer', 'eyJhbGciOi...']
  // [1] extracts index 1, which isolates just the raw token string itself.
  const token = authHeader.split(' ')[1]; 

  try {
    // Verify the token using our secret key.
    // If the token is expired, has been tampered with, or was signed with a different key,
    //  this will throw an error.
    // If valid, it returns the original payload data (e.g., userId and email).
    const decoded = jwt.verify(token, SECRET);
    
    // Attach the decrypted user payload data directly to the Express request object (`req`).
    // This allows down-stream protected route handlers to instantly know *who* is making the request.
    req.user = decoded; 
    
    // Crucial step: Call next() to hand control over to the next function/route handler in line.
    // Without this, the server would just hang indefinitely.
    next();
    
  } catch (e) {
    // If jwt.verify fails (throws an error), catch it here and reject the client with a 401 Unauthorized
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// 3. EXPORT

// Export the middleware function so it can be injected into any protected route across your app
module.exports = authenticate;