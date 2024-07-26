import React from 'react';
import './App.css';
import NavigationBar from './Navbar';
import MainContent from './MainContent';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <main>
        <MainContent />
      </main>
    </div>
  );
}

export default App;