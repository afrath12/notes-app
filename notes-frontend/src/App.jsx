// Import routing components from the React Router library
// Routes: A container that looks at the current URL and decides which Route to display.
// Route: Maps a specific URL path to a specific React component.
// Link: Creates a navigation link that switches pages instantly without refreshing the browser.
import { Routes, Route, Link } from 'react-router-dom';

// Import the specific page components
import Home       from './pages/Home';
import NoteDetail from './pages/NoteDetail';
import About      from './pages/About';

function App() {
  return (
    <div>
      {/* GLOBAL NAVIGATION BAR 
          Because this <nav> element sits OUTSIDE the <Routes> wrapper, it stays 
          permanently visible on top of your app, no matter what page the user is on.
      */}
      <nav style={{ background: '#2c3e50', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Directs the user back to the home notes grid */}
        <Link to="/"       style={{ color: '#fff', textDecoration: 'none' }}>Notes</Link>
        {/* Directs the user to the about page info */}
        <Link to="/about" style={{ color: '#aaa', textDecoration: 'none' }}>About</Link>
      </nav>

      {/* DYNAMIC CONTENT AREA
          The <Routes> block acts like a conditional 'switch' statement for your UI.
          It scans the URL bar and matches it against the paths defined below.
      */}
      <Routes>
        {/* Home Route: Matches the exact base URL (e.g., http://localhost:3000/) */}
        <Route path="/"          element={<Home />}       />
        
        {/* Dynamic Route: The ":id" token tells React Router that this part of the URL varies.
            Whether a user visits /notes/1, /notes/42, or /notes/any-id, this pattern 
            matches and dynamically mounts the <NoteDetail /> component.
        */}
        <Route path="/notes/:id" element={<NoteDetail />} />
        
        {/* About Route: Matches the static path "/about" */}
        <Route path="/about"     element={<About />}     />
      </Routes>
    </div>
  );
}

// Export the App container so index.js / main.js can hook it up to the real DOM root container.
export default App;