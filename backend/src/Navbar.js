import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import './Navbar.css';
import profileImage from './profile_img.png';  // Update the path to your profile image
import tslogo from './logo.png';     // Update the path to your logo image

function NavigationBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar expanded={expanded} bg="dark" variant="dark" expand="md" fixed="top">
      <Navbar.Brand href="#">
        <img
          src={tslogo}
          alt="Track Safe Logo"
          style={{ width: '50px', height: '50px' }}  // Adjust the width and height as needed
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(expanded ? false : "expanded")} />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#home">Home</Nav.Link>
          <Nav.Link href="#link">Link</Nav.Link>
        </Nav>
        <Nav>
          <NavDropdown title={<img src={profileImage} alt="Profile" className="profile-image" />} id="basic-nav-dropdown">
            <NavDropdown.Item href="#profile">Profile</NavDropdown.Item>
            <NavDropdown.Item href="#settings">Settings</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;