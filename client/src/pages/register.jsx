
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!API_URL) {
            setMessage("Server URL is not configured. Please try again later.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/register`,
                formData
            );

            setMessage(response.data.message || "Registration successful!");

            setFormData({
                name: "",
                email: "",
                password: ""
            });
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Registration failed. Please try again."
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
                    <label>Name</label>
                    <input
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
                    <label>Email</label>
                    <input
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
                    <label>Password</label>
                    <input
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

            {message && <p role="status">{message}</p>}
        </div>
    );
}

export default Register;
