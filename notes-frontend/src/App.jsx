// 1. IMPORTS
// 'useState' manages data that changes on the screen.
// 'useEffect' lets us run code automatically (like fetching data when the app opens).
import { useState, useEffect } from 'react';

// The web address where your backend Express API is running
const API = 'http://localhost:3001';

function App() {
  // 2. STATE VARIABLES (React's short-term memory)
  // [variableName, functionToUpdateIt] = useState(initialValue);
  const [notes, setNotes]     = useState([]);     // Holds the array of notes from the server
  const [title, setTitle]     = useState('');     // Holds what the user types in the title input box
  const [content, setContent] = useState('');     // Holds what the user types in the content textbox
  const [loading, setLoading] = useState(true);   // True when waiting for data, False when data arrives
  const [error, setError]     = useState(null);   // Holds any error message if the server crashes

  // 3. AUTOMATIC EFFECTS
  // This runs automatically exactly ONCE when the app first opens on the screen.
  useEffect(() => {
    fetchNotes();
  }, []); // The empty brackets [] mean: "Only run on mount (startup)"

  // 4. API FUNCTIONS (Talking to the backend)
  
  // --- FETCH NOTES ---
  async function fetchNotes() {
    try {
      setLoading(true); // Show a "Loading..." message on screen
      
      // Send a request to 'http://localhost:3001/notes' to get data
      const res  = await fetch(`${API}/notes`);
      const data = await res.json(); // Convert the raw response into a usable JavaScript array
      
      setNotes(data); // Save that array into our 'notes' state to show them on screen
    } catch (err) {
      // If the backend server is offline, capture the error and show a message
      setError('Could not connect to server. Is it running?');
    } finally {
      setLoading(false); // Hide the "Loading..." message whether it succeeded or failed
    }
  }

  // --- ADD A NOTE ---
  async function addNote() {
    // If the user typed only spaces, stop here and don't send an empty note
    if (!title.trim() || !content.trim()) return;
    
    // Tell the backend to create a new note using 'POST'
    const res = await fetch(`${API}/notes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' }, // Tell backend we are sending JSON data
      body:    JSON.stringify({ title, content })      // Turn our data into a string text pack
    });
    
    const newNote = await res.json(); // The backend sends back the new note with its new ID
    
    // Update the UI: put the new note at the top, followed by the existing notes
    setNotes([newNote, ...notes]); 
    
    // Clear out the input fields so they are empty for the next note
    setTitle('');
    setContent('');
  }

  // --- DELETE A NOTE ---
  async function deleteNote(id) {
    // Tell the backend to delete the note with this specific ID
    await fetch(`${API}/notes/${id}`, { method: 'DELETE' });
    
    // Update the UI: Filter out (remove) the deleted note from our screen array
    setNotes(notes.filter(n => n.id !== id));
  }

  // 5. THE USER INTERFACE (HTML/JSX Layout)
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '24px' }}>My Notes</h1>

      {/* --- ADD NOTE FORM --- */}
      <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <input
          placeholder="Note title"
          value={title} // Connects this input to the 'title' state variable
          // Whenever the user types a letter, update the 'title' state immediately
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
        />
        <textarea
          placeholder="Note content"
          value={content} // Connects this input to the 'content' state variable
          // Same as input onChange above (updates content state as you type)
          onChange={e => setContent(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical' }}
        />
        <button
          onClick={addNote} // When clicked, trigger the addNote function
          style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          Add Note
        </button>
      </div>

      {/* --- STATUS MESSAGES --- */}
      {/* If loading is true, show this text. If false, hide it. */}
      {loading && <p style={{ color: '#666' }}>Loading notes...</p>}
      {/* Same as loading condition above (shows error text only if an error exists) */}
      {error   && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- THE NOTES LIST --- */}
      {/* .map() acts like a loop, drawing a HTML box for every note in our notes array */}
      {notes.map(note => (
        // React needs a unique 'key' for list items to keep track of them efficiently
        <div key={note.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '6px' }}>{note.title}</h3>
            <button
              // When clicked, run deleteNote and pass it this specific note's ID
              onClick={() => deleteNote(note.id)}
              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }}
            >×</button>
          </div>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>{note.content}</p>
          <p style={{ fontSize: '11px', color: '#aaa' }}>{note.created_at}</p>
        </div>
      ))}
    </div>
  );
}

export default App;