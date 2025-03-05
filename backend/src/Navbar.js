import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import tslogo from './logo.png';     // Update the path to your logo image

const NavigationBar = ({ setIsAuthenticated }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false)
    navigate("/login");
  }

  return (
    <Navbar expanded={expanded} bg="dark" variant="dark" expand="md" fixed="top">
      <Navbar.Brand href="/">
        <img
          src={tslogo}
          alt="Track Safe Logo"
          style={{ width: '50px', height: '50px' }}  // Adjust the width and height as needed
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(expanded ? false : "expanded")} />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
        </Nav>
        <Nav>
          <NavDropdown title={<img src='/images/profile_img.png' alt="Profile" className="profile-image" />} id="basic-nav-dropdown">
            <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
            <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;