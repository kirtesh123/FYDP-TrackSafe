import React, { useEffect, useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const keyID = localStorage.getItem("KeyID");

      if (!keyID) {
        setError("User not found. Please log in.");
        setLoading(false);
        return; // 🔹 Stop execution if KeyID is missing
      }

      try {
        const response = await fetch(`http://localhost:5000/driver?user=${keyID}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const result = await response.json();

        if (!result || result.length === 0) {
          setError("User data not found.");
          setLoading(false);
          return;
        }

        setUser(result[0]); // ✅ Set user data
        await fetchSessions(keyID); // ✅ Fetch sessions only after profile data is set
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false); // ✅ Ensure loading state is updated
      }
    };

    fetchData();
  }, []);

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
        <img src={user?.profilePic || "/images/profile_img.png"} alt="Profile" className="profile-pic" />
        <div className="profile-info">
          <h1>{user?.name}</h1>
        </div>
      </div>
      <div className="profile-content">
        <div className="user-details">
          <h3>User Details</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone Number:</strong> {user?.phoneNumber}</p>
          <p><strong>Region:</strong> {user?.region}</p>
        </div>
        <div className="car-details">
          <h3>Car Details</h3>
          <div className="car-columns">
            <div className="car-info">
              <p><strong>Model:</strong> {user?.carModel}</p>
              <p><strong>License Plate:</strong> {user?.licensePlate}</p>
            </div>
            <div className="car-image">
              <img src={user?.carImage || "/images/car_default.png"} alt="Car"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
