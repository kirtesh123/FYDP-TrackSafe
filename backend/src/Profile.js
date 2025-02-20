import React, { useState, useEffect } from "react";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch user profile
  useEffect(() => {
    fetch(`http://localhost:5000/profile?user=1`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setFormData(data);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save updated profile
  const handleSave = () => {
    fetch("http://localhost:5000/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        setProfile(formData);
        setEditMode(false);
      })
      .catch((err) => console.error("Error updating profile:", err));
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <div className="profile-info">
        <label>Name:</label>
        {editMode ? (
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        ) : (
          <p>{profile.name}</p>
        )}
      </div>
      <div className="profile-info">
        <label>Email:</label>
        {editMode ? (
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        ) : (
          <p>{profile.email}</p>
        )}
      </div>
      <div className="profile-info">
        <label>Role:</label>
        {editMode ? (
          <input type="text" name="role" value={formData.role} onChange={handleChange} />
        ) : (
          <p>{profile.role}</p>
        )}
      </div>
      {editMode ? (
        <button className="save-button" onClick={handleSave}>Save</button>
      ) : (
        <button className="edit-button" onClick={() => setEditMode(true)}>Edit Profile</button>
      )}
    </div>
  );
};

export default Profile;