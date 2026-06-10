import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// The base URL where your backend server is running
const API = 'http://localhost:3001';

function Home() {
  // --- STATE MANAGEMENT ---
  
  // Holds the array of notes fetched from the backend
  const [notes, setNotes] = useState([]);
  
  // Track what the user is typing into the "Add Note" form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // UI Status states (loading spinner and global error messages)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication states
  // Grab the token from browser storage if it exists, otherwise start as null
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Toggles between showing the Login screen or the Registration screen
  const [isRegistering, setIsRegistering] = useState(false);

  // --- SIDE EFFECTS ---
  
  // This runs automatically whenever the 'token' changes.
  // If we have a token, go grab the notes. If not, stop loading.
  useEffect(() => {
    if (token) fetchNotes();
    else setLoading(false);
  }, [token]);

  // --- HELPER FUNCTIONS ---
  
  // Generates the standard headers needed for protected API requests
  function authHeader() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Sends the token to prove who we are
    };
  }

  // --- API CALLS ---

  // 1. Get all notes for the logged-in user
  async function fetchNotes() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/notes`, { headers: authHeader() });

      // If the backend says our token is dead/expired, force a logout
      if (res.status === 401) { logout(); return; }

      const data = await res.json();

      // Basic safety guard: ensure the backend sent an array before updating state
      if (Array.isArray(data)) setNotes(data);
      else setNotes([]);

    } catch (err) {
      setError('Could not connect to server. Is it running?');
    } finally {
      setLoading(false); // Stop showing the loading text
    }
  }

  // 2. Log in an existing user
  async function handleLogin() {
    setAuthError(''); // Clear any previous error messages
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      // If backend returns an error code, show the message and stop
      if (!res.ok) { setAuthError(data.error || 'Login failed'); return; }

      // Success: save the token in the browser and in our React state
      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      // Clear inputs for security
      setEmail(''); setPassword('');
    } catch (err) {
      setAuthError('Could not connect to server.');
    }
  }

  // 3. Register a new user
  async function handleRegister() {
    setAuthError('');
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) { setAuthError(data.error || 'Register failed'); return; }

      // Success: immediately log them in using the inputs they provided
      await handleLogin();
    } catch (err) {
      setAuthError('Could not connect to server.');
    }
  }

  // 4. Log out the current user
  function logout() {
    localStorage.removeItem('token'); // Delete token from browser storage
    setToken(null);                   // Wipe token from state (triggers re-render to Auth view)
    setNotes([]);                     // Clear notes out of memory
  }

  // 5. Create a new note
  async function addNote() {
    // Prevent submitting if title or content fields are completely empty
    if (!title.trim() || !content.trim()) return;
    
    const res = await fetch(`${API}/notes`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ title, content })
    });
    const newNote = await res.json();
    
    // Add the brand new note to the top of our local state list instantly
    setNotes([newNote, ...notes]);
    
    // Clear the input text boxes
    setTitle(''); setContent('');
  }

  // 6. Delete a specific note
  async function deleteNote(id) {
    await fetch(`${API}/notes/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    // Update local state by filtering out the note we just deleted
    setNotes(notes.filter(n => n.id !== id));
  }

  // --- UI RENDERING ---

  // CONDITIONAL RENDER 1: If user is NOT logged in, show Auth Screen (Login/Register)
  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '32px', fontFamily: 'Arial, sans-serif', background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '22px' }}>
          {isRegistering ? 'Create account' : 'Login'}
        </h1>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>
          {isRegistering ? 'Register to start taking notes' : 'Login to see your notes'}
        </p>

        {/* Credentials Inputs */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          // UX Feature: Pressing the "Enter" key will submit the form
          onKeyDown={e => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
        />

        {/* Display Auth Errors conditionally */}
        {authError && <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px' }}>{authError}</p>}

        <button
          onClick={isRegistering ? handleRegister : handleLogin}
          style={{ width: '100%', background: '#2c3e50', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginBottom: '12px' }}
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>

        {/* Toggle link to switch between Login and Register views */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
            style={{ color: '#3498db', cursor: 'pointer' }}
          >
            {isRegistering ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    );
  }

  // CONDITIONAL RENDER 2: User IS logged in, show the Main Dashboard (Notes application)
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>My Notes</h1>
        <button
          onClick={logout}
          style={{ background: 'none', border: '1px solid #ddd', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#666' }}
        >
          Logout
        </button>
      </div>

      {/* "Create New Note" Input Area */}
      <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <input
          placeholder="Note title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
        />
        <textarea
          placeholder="Note content"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical' }}
        />
        <button
          onClick={addNote}
          style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          Add Note
        </button>
      </div>

      {/* Status Messages */}
      {loading && <p style={{ color: '#666' }}>Loading notes...</p>}
      {error   && <p style={{ color: 'red' }}>{error}</p>}

      {/* Notes Feed — loops over the array and renders every note */}
      {notes.map(note => (
        <div key={note.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '6px' }}>{note.title}</h3>
            {/* Delete button (displays as a red '×') */}
            <button
              onClick={() => deleteNote(note.id)}
              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }}
            >×</button>
          </div>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>{note.content}</p>
          <p style={{ fontSize: '11px', color: '#aaa' }}>{note.created_at}</p>
          {/* React-Router link pointing to a dedicated detail page for this note */}
          <Link to={`/notes/${note.id}`} style={{ fontSize: '12px', color: '#3498db' }}>View detail →</Link>
        </div>
      ))}
    </div>
  );
}

export default Home;