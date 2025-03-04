import React, { useEffect, useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user profile from API
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.profilePic} alt="Profile" className="profile-pic" />
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.location}</p>
          <div className="action-buttons">
            <button>Chat</button>
            <button>Call</button>
            <button>Video Call</button>
          </div>
        </div>
      </div>
      <div className="profile-content">
        <div className="summary">
          <h3>Summary</h3>
          <p>{user.about}</p>
          <h4>Certifications</h4>
          <p>{user.certifications}</p>
        </div>
        <div className="car-details">
          <h3>Car Details</h3>
          <img src={user.carImage} alt="Car" className="car-image" />
          <p><strong>Make:</strong> {user.carMake}</p>
          <p><strong>Model:</strong> {user.carModel}</p>
          <p><strong>Year:</strong> {user.carYear}</p>
          <p><strong>License Plate:</strong> {user.carLicensePlate}</p>
        </div>
      </div>
      <div className="reviews">
        <h3>Reviews</h3>
        {user.reviews.map((review, index) => (
          <div key={index} className="review">
            <p><strong>{review.reviewer}:</strong> {review.comment}</p>
            <p className="rating">⭐ {review.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;