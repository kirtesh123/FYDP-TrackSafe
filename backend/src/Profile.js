import React, { useState, useEffect } from "react";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    region: "",
    carModel: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    region: "",
    carModel: ""
  });

  // Fetch user profile
  useEffect(() => {
    fetch(`http://localhost:5000/profile?user=1`) // Consider making user dynamic
      .then((res) => res.json())
      .then((data) => {
        setProfile(data || {}); // Ensure it handles empty responses
        setFormData(data || {}); // Prevent undefined errors
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
      method: "PUT", // Use PUT if updating an existing profile
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
          <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />
        ) : (
          <p>{profile.name || "N/A"}</p>
        )}
      </div>
      <div className="profile-info">
        <label>Email:</label>
        {editMode ? (
          <input type="email" name="email" value={formData.email || ""} onChange={handleChange} />
        ) : (
          <p>{profile.email || "N/A"}</p>
        )}
      </div>
      <div className="profile-info">
        <label>Role:</label>
        {editMode ? (
          <input type="text" name="role" value={formData.role || ""} onChange={handleChange} />
        ) : (
          <p>{profile.role || "N/A"}</p>
        )}
      </div>
      <div className="profile-info">
        <label>Region of Location:</label>
        {editMode ? (
          <input type="text" name="region" value={formData.region || ""} onChange={handleChange} />
        ) : (
          <p>{profile.region || "N/A"}</p>
        )}
      </div>
      <div className="profile-info">
        <label>Car Model:</label>
        {editMode ? (
          <input type="text" name="carModel" value={formData.carModel || ""} onChange={handleChange} />
        ) : (
          <p>{profile.carModel || "N/A"}</p>
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
