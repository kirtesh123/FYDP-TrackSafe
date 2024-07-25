// Things Young Ha Added
import React from 'react';


//Original Import
import logo from './logo.svg';
import './App.css';
import FileList from './FileList';

//Young Ha Added
import NavigationBar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
      </header>
      <main>
        <FileList />
      </main>
    </div>
  );
}

export default App;



