import React, { useEffect, useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const serverPort = process.env.REACT_APP_SERVER_PORT;
  const userType = localStorage.getItem("userType");  // Define userType at the top level of the component

  useEffect(() => {
    const userID = localStorage.getItem("KeyID") || localStorage.getItem("PID");

    if (!userID) {
      setError("User not found. Please log in.");
      setLoading(false);
      return;
    }

    const endpoint = userType === "1" ? "/provider" : "/driver"; // Use different endpoint based on userType

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${serverPort}${endpoint}?user=${userID}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const result = await response.json();

        if (!result || result.length === 0) {
          setError("User data not found.");
          setLoading(false);
          return;
        }

        setUser(result[0]); // Set user data
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serverPort]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user?.profilePic || "/images/profile_img.png"} alt="Profile" className="profile-pic" />
      </div>
      <div className="profile-content">
        {/* Only render Car Details if userType is "0" (user) and not "1" (provider) */}
        { userType === "1" ? (
          <div className="user-details">
            <h3>User Details</h3>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Region:</strong> {user?.region}</p>
          </div>
          ) : (
          <>
            <div className="user-details">
              <h3>User Details</h3>
              <p><strong>Name:</strong> {user?.name}</p>
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
            </>
        )}
      </div>
    </div>
  );
};

export default Profile;
