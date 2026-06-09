// Import the core React library to enable JSX syntax and component capabilities
import React from 'react';

// Import ReactDOM's client-side rendering engine (standard for React 18 and newer)
import ReactDOM from 'react-dom/client';

// Import BrowserRouter to enable URL-based navigation and sync the UI with the URL bar
import { BrowserRouter } from 'react-router-dom';

// Import the main container/root component of your application
import App from './App';

// 1. document.getElementById('root') finds the empty target <div> inside your public/index.html file.
// 2. createRoot() initializes React's modern rendering architecture around that specific HTML element.
// 3. .render() injects your virtual React components directly into that real DOM node.
ReactDOM.createRoot(document.getElementById('root')).render(
  // Wrapping <App /> inside <BrowserRouter> is essential. 
  // It acts as a global provider, granting every nested component in your entire app 
  // access to routing features (like <Routes>, <Route>, <Link>, and navigation hooks).
  <BrowserRouter>
    {/* Mounts your main App shell component */}
    <App />
  </BrowserRouter>
);