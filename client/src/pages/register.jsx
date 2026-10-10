
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!API_URL) {
      setIsError(true);
      setMessage(
        "Server URL is not configured. Please try again later."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData
      );

      setMessage(
        response.data.message || "Registration successful!"
      );

      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setIsError(true);

      if (error.response) {
        setMessage(
          error.response.data?.message ||
            `Registration failed (${error.response.status}).`
        );
      } else if (error.request) {
        setMessage(
          "Unable to connect to the server. Please try again."
        );
      } else {
        setMessage("Something went wrong. Please try again.");
      }

      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      {message && (
        <p role="status" style={{ color: isError ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Register;
