import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function NoteDetail() {
  // --- STATE & ROUTING ---
  
  // Grabs the "id" variable directly out of the browser URL path (e.g., /notes/5)
  const { id } = useParams();
  
  // Holds the data for the single note we fetch from the backend (starts as null)
  const [note, setNote] = useState(null);
  
  // Gets the saved user token from browser storage to authorize our API call
  const token = localStorage.getItem('token');

  // --- SIDE EFFECTS ---
  
  // Automatically runs when the component loads, or if the note ID in the URL changes
  useEffect(() => {
    // Send a GET request to fetch only this specific note by its ID
    fetch(`http://localhost:3001/notes/${id}`, {
      headers: {
        // Prove to the backend who we are by passing our security token
        'Authorization': `Bearer ${token}`
      }
    })
      .then(r => r.json())           // Convert the backend response into readable JSON
      .then(data => setNote(data));  // Save that single note object into our React state
  }, [id]);

  // --- CONDITIONAL RENDER ---
  
  // If the API request hasn't finished yet (note is still null), show this loading message
  if (!note) return <p style={{ padding: '32px' }}>Loading...</p>;

  // --- UI RENDERING ---
  
  // Once the note data arrives successfully, display it beautifully on the screen
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Navigation link to take the user back to the main Home page dashboard */}
      <Link to="/" style={{ color: '#3498db', fontSize: '14px' }}>← Back to notes</Link>
      
      {/* Note Title */}
      <h1 style={{ margin: '16px 0 8px' }}>{note.title}</h1>
      
      {/* Note Timestamp */}
      <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '16px' }}>{note.created_at}</p>
      
      {/* Main text body of the note */}
      <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{note.content}</p>
      
    </div>
  );
}

export default NoteDetail;