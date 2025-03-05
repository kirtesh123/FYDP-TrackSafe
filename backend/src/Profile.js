import React, { useEffect, useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const keyID = localStorage.getItem("KeyID");
          if (!keyID) {
            setError("User not found. Please log in.");
            setLoading(false);
          }
          const response = await fetch(`http://localhost:5000/driver?user=${keyID}`);
          const result = await response.json();
          // console.log('Driver Data fetched from API:', result); // Log the fetched data
          setUser(result[0] || {});
          fetchSessions(keyID); // Fetch sessions using KeyID
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, []);

  const fetchProfile = async (keyID) => {
    try {
      const response = await fetch(`http://localhost:5000/driver?user=${keyID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setUser(data[0]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (keyID) => {
    try {
      const response = await fetch(`http://localhost:5000/sessions?user=${keyID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user?.profilePic || "default-avatar.png"} alt="Profile" className="profile-pic" />
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p>{user?.location}</p>
          <p><strong>Driving Score:</strong> {user?.driveScore}</p>
        </div>
      </div>
      <div className="profile-content">
        <div className="car-details">
          <h3>Car Details</h3>
          <img src={user?.carImage || "default-car.png"} alt="Car" className="car-image" />
          <p><strong>Make:</strong> {user?.carMake}</p>
          <p><strong>Model:</strong> {user?.carModel}</p>
          <p><strong>License Plate:</strong> {user?.carLicensePlate}</p>
        </div>
      </div>
      <div className="sessions">
        <h3>Session History</h3>
        {sessions.length > 0 ? (
          <ul>
            {sessions.map((session, index) => (
              <li key={index}>{session.date} - {session.details}</li>
            ))}
          </ul>
        ) : (
          <p>No sessions available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;