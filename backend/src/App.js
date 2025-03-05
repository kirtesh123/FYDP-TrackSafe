import React from 'react';
import { useState, useEffect } from 'react'; 
import NavigationBar from './Navbar';
import MainContent from './MainContent';
import Profile from "./Profile";
import Login from './Login'; // Import Login Page
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation} from "react-router-dom";
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

  // Function to dynamically change the background
const BackgroundSetter = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/login") {
      document.body.style.background = "url('/images/Login_bg.jpeg') no-repeat center center/cover";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.background = "url('/images/App.jpeg') no-repeat center center/cover";
      document.body.style.backgroundAttachment = "fixed";
    }
  }, [location.pathname]); // Runs when route changes

  return null; // No UI, just applies background
};

  return (
    <Router>
      <BackgroundSetter /> {/* Dynamically sets background */}
      <div className="App">
        {isAuthenticated && <NavigationBar setIsAuthenticated={setIsAuthenticated} />}
        <main>
          <Routes>
            {/* Main Content on Home */}
            <Route path="/" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />} />  
            {/* Profile Page Route */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />  
            {/* Login Page  */}
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;