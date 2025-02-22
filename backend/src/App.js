import React from 'react';
import './App.css';
import NavigationBar from './Navbar';
import MainContent from './MainContent';
import Profile from "./Profile";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <main>
          <Routes>
            <Route path="/" element={<MainContent />} />  {/* Main Content on Home */}
            <Route path="/profile" element={<Profile />} />  {/* ✅ Profile Page Route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;