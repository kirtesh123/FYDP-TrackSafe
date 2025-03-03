import React from 'react';
import { useState, useEffect } from 'react'; 
import './App.css';
import NavigationBar from './Navbar';
import MainContent from './MainContent';
import Profile from "./Profile";
import Login from './Login'; // Import Login Page
import { BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // State to track if the user is authenticated (has a token stored)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // Effect to check authentication status when the app loads or refreshes
  useEffect(() => {
    // Get the stored token
    const token = localStorage.getItem("token");

    // Convert token existence to boolean
    setIsAuthenticated(!!token);
  }, []);
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <main>
          <Routes>
            {/* Main Content on Home */}
            <Route path="/" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />} />  
            {/* Profile Page Route */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />  
            {/* Login Page  */}
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;