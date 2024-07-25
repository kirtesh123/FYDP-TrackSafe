import React from 'react';
import './App.css';
import NavigationBar from './Navbar';
import MainContent from './MainContent';
import 'bootstrap/dist/css/bootstrap.min.css';
import SQLHandler from './SQLHandler';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <main>
        <MainContent />
      </main>

      <SQLHandler />

    </div>
  );
}

export default App;
