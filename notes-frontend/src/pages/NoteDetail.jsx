// useParams allows us to read dynamic parameters from the current URL (e.g., the note's ID).
// Link allows for client-side navigation back to other pages.
import { useParams, Link } from 'react-router-dom';

// useState manages the local data (the specific note).
// useEffect triggers the data fetching when the component loads.
import { useState, useEffect } from 'react';

function NoteDetail() {
  // 1. DYNAMIC ROUTE PARAMS
  // If your route is defined as /notes/:id, and the URL is /notes/5, 
  // useParams() extracts that '5' and assigns it to the 'id' variable.
  const { id } = useParams(); 

  // 2. STATE MANAGEMENT
  // Initialize 'note' as null because we don't have the data from the server yet.
  const [note, setNote] = useState(null);

  // 3. DATA FETCHING (SIDE EFFECT)
  // This runs automatically when the component mounts (renders for the first time).
  useEffect(() => {
    // Fetch the specific note data from your Express backend using the dynamic ID
    fetch(`http://localhost:3001/notes/${id}`)
      .then(r => r.json())           // Parse the incoming string response into a JavaScript object
      .then(data => setNote(data));  // Save that object into our 'note' state
  }, [id]); // Dependency array: If the 'id' in the URL changes, re-run this effect to fetch the new note.

  // 4. CONDITIONAL RENDERING (LOADING STATE)
  // Because fetching data takes time, 'note' will be null on the very first render.
  // We must show a loading message, otherwise trying to read 'note.title' below will crash the app.
  if (!note) return <p style={{ padding: '32px' }}>Loading...</p>;

  // 5. THE ACTUAL RENDER
  // Once 'note' is no longer null, this UI renders with the fetched data.
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Navigation link to go back to the home page */}
      <Link to="/">← Back</Link>
      
      {/* Display the note's details dynamically */}
      <h1 style={{ margin: '16px 0 8px' }}>{note.title}</h1>
      <p style={{ color: '#666', marginBottom: '16px' }}>{note.created_at}</p>
      <p>{note.content}</p>
    </div>
  );
}

// Export the component so it can be mapped to a route in your main router setup.
export default NoteDetail;