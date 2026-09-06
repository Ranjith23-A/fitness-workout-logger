import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddWorkout() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        exercise: "",
        category: "Strength",
        sets: "",
        reps: "",
        weight: "",
        duration: "",
        calories: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/workouts",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage("Workout added successfully!");

            setFormData({
                exercise: "",
                category: "Strength",
                sets: "",
                reps: "",
                weight: "",
                duration: "",
                calories: ""
            });

        } catch (error) {
            console.error(error);

            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Something went wrong");
            }
        }
    };

    return (
        <div>
            <h1>Add Workout</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Exercise</label>
                    <input
                        type="text"
                        name="exercise"
                        value={formData.exercise}
                        onChange={handleChange}
                        placeholder="Example: Bench Press"
                        required
                    />
                </div>

                <div>
                    <label>Category</label>

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="Strength">Strength</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Flexibility">Flexibility</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label>Sets</label>
                    <input
                        type="number"
                        name="sets"
                        value={formData.sets}
                        onChange={handleChange}
                        placeholder="3"
                    />
                </div>

                <div>
                    <label>Reps</label>
                    <input
                        type="number"
                        name="reps"
                        value={formData.reps}
                        onChange={handleChange}
                        placeholder="10"
                    />
                </div>

                <div>
                    <label>Weight (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="20"
                    />
                </div>

                <div>
                    <label>Duration (minutes)</label>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="30"
                    />
                </div>

                <div>
                    <label>Calories</label>
                    <input
                        type="number"
                        name="calories"
                        value={formData.calories}
                        onChange={handleChange}
                        placeholder="200"
                    />
                </div>

                <br />

                <button type="submit">
                    Add Workout
                </button>

            </form>

            {message && <p>{message}</p>}

            <br />

            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>
        </div>
    );
}

export default AddWorkout;