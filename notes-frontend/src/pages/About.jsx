// Import the 'Link' component to enable internal navigation without full page reloads
import { Link } from 'react-router-dom';

function About() {
  return (
    // Inline styling using a JavaScript object. 'padding' adds space inside the container borders.
    <div style={{ padding: '32px' }}>
      <h1>About</h1>
      
      {/* This paragraph describes a classic 3-tier Full-Stack architecture:
          1. Frontend (UI): React
          2. Backend (API): Express (Node.js)
          3. Database (Storage): SQLite
      */}
      <p>This is a full stack notes app built with React, Express, and SQLite.</p>
      
      {/* Navigate back to the home/root route ("/") where the main notes list is displayed */}
      <Link to="/">Back to notes</Link>
    </div>
  );
}

// Export the component as the default export so it can be imported elsewhere
export default About;