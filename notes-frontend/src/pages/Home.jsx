// useState handles local data inputs. useEffect runs code automatically when the page loads.
import { useState, useEffect } from 'react';
// Link allows smooth, client-side navigation to the detail page without a full browser reload.
import { Link } from 'react-router-dom';

// The base URL of your backend Express API
const API = 'http://localhost:3001';

function Home() { 
  // --- 1. STATE INITIALIZATION ---
  const [notes, setNotes]     = useState([]);    // Stores the array of notes fetched from the database
  const [title, setTitle]     = useState('');    // Tracks text typed inside the "Note title" input
  const [content, setContent] = useState('');    // Tracks text typed inside the "Note content" textarea
  const [loading, setLoading] = useState(true);  // Tracks if data is actively loading from the server
  const [error, setError]     = useState(null);  // Stores any error messages if the server request fails

  // --- 2. LIFECYCLE / SIDE EFFECTS ---
  // The empty dependency array [] means this runs exactly ONCE right after the page first loads.
  useEffect(() => {
    fetchNotes();
  }, []);

  // --- 3. API MUTATION FUNCTIONS (GET, POST, DELETE) ---
  
  // FETCH (GET): Pulls all notes from your backend database
  async function fetchNotes() {
    try {
      setLoading(true); // Start loading state
      const res  = await fetch(`${API}/notes`);
      const data = await res.json();
      setNotes(data);   // Save the array of notes to state, causing a re-render to display them
    } catch (err) {
      setError('Could not connect to server. Is it running?');
    } finally {
      setLoading(false); // Turn off loading message, whether request succeeded or failed
    }
  }

  // ADD (POST): Submits a new note to the backend database
  async function addNote() {
    // Prevent adding empty notes if title or content only contains spaces
    if (!title.trim() || !content.trim()) return;
    
    const res = await fetch(`${API}/notes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, content }) // Send input data as a JSON string
    });
    
    const newNote = await res.json(); // Receive the newly saved note object (complete with its new SQL id)
    
    // Optimistic UI updates: Add the new note to the front of the array,
    // then clear out the input forms so the user can type a fresh note.
    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
  }

  // DELETE: Removes a note from the backend database by ID
  async function deleteNote(id) {
    await fetch(`${API}/notes/${id}`, { method: 'DELETE' });
    
    // Filter out the deleted note from local state immediately so it vanishes from the screen
    setNotes(notes.filter(n => n.id !== id));
  }

  // --- 4. RENDER / UI ---
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '24px' }}>My Notes</h1>

      {/* NEW NOTE INPUT FORM */}
      <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <input
          placeholder="Note title"
          value={title}
          // Two-way data binding: updates 'title' state on every single keystroke
          onChange={e => setTitle(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
        />
        <textarea
          placeholder="Note content"
          value={content}
          // Two-way data binding: updates 'content' state on every single keystroke
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

      {/* CONDITIONAL UI MESSAGES */}
      {loading && <p style={{ color: '#666' }}>Loading notes...</p>}
      {error   && <p style={{ color: 'red' }}>{error}</p>}

      {/* NOTES LIST DISPLAY */}
      {/* Loop through the notes array and render a UI block for each note card */}
      {notes.map(note => (
        // React requires a unique 'key' on the outermost element when looping with .map()
        <div key={note.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '6px' }}>{note.title}</h3>
            {/* Delete button passes the current note's unique database ID up to the delete function */}
            <button
              onClick={() => deleteNote(note.id)}
              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }}
            >×</button>
          </div>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>{note.content}</p>
          <p style={{ fontSize: '11px', color: '#aaa' }}>{note.created_at}</p>

          {/* inside each note card div */}
          <Link to={`/notes/${note.id}`} style={{ fontSize: '12px', color: '#3498db' }}>
            View detail →
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Home;