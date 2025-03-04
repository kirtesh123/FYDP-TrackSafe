import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ setIsAuthenticated }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [region, setRegion] = useState("");
  const [carModel, setCarModel] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState("selection");  // ["Selection", "Login", "registerUser", "registerProvider"]
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("Login successful:", result);
      localStorage.setItem("token", result[0].token); // Store auth token
      localStorage.setItem("KeyID", result[0].KeyID); // Store KeyID of driver
      console.log("KeyID: ", localStorage.getItem("KeyID"));
      setIsAuthenticated(true);
      navigate("/"); // Redirect to home page
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phoneNumber, region, carModel }),
      });

      if (!response.ok) {
        throw new Error("Invalid login credentials");
      }

      const result = await response.json();
      console.log("User registration successful:", result);
      localStorage.setItem("token", result['token']); // Store auth token
      localStorage.setItem("KeyID", result['insertId']); // Store KeyID of driver
      console.log("KeyID: ", localStorage.getItem("KeyID"));
      setIsAuthenticated(true);
      navigate("/"); // Redirect to home page
    } catch (error) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      {view === "selection" && (
        <div className="selection-container">
        <h2>Welcome</h2>
        <p>Please select an option:</p>
        <button className="option-button" onClick={() => setView("login")}>Already a User</button>
        <button className="option-button" onClick={() => setView("registerUser")}>Register User</button>
        <button className="option-button" onClick={() => setView("registerProvider")}>Register Provider</button>
      </div>
      )}

      {view === "login" && (
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="submit-button" type="submit">Login</button>
          <button className="back-button" onClick={() => setView("selection")}>Back</button>
        </form>
      )}

      {view === "registerUser" && (
        <form className="register-container" onSubmit={handleRegisterUser}>
        <h2>Register User</h2>
        {error && <p className="error-message">{error}</p>}
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Phone Number:</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <label>Region:</label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
        />
        <label>Car Model:</label>
        <input
          type="text"
          value={carModel}
          onChange={(e) => setCarModel(e.target.value)}
          required
        />
        <button className="submit-button" type="submit">Register</button>
        <button className="back-button" onClick={() => setView("selection")}>Back</button>
      </form>
      )}

      {view === "registerProvider" && (
        <div className="register-container">
          <h2>Register as Provider</h2>
          <p>Registration form will go here...</p>
          <button className="back-button" onClick={() => setView("selection")}>Back</button>
        </div>
      )}
    </div>
  );
};

export default Login;
