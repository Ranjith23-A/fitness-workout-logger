import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function WorkoutHistory() {
    const navigate = useNavigate();

    const [workouts, setWorkouts] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:5000/api/workouts",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setWorkouts(response.data);

            } catch (error) {
                console.error(error);

                if (error.response) {
                    setMessage(error.response.data.message);
                } else {
                    setMessage("Cannot connect to server");
                }
            }
        };

        fetchWorkouts();
    }, []);

    return (
        <div>
            <h1>Workout History</h1>

            {message && <p>{message}</p>}

            {workouts.length === 0 ? (
                <p>No workouts yet.</p>
            ) : (
                <div>
                    {workouts.map((workout) => (
                        <div key={workout._id}>
                            <hr />

                            <h2>{workout.exercise}</h2>

                            <p>
                                Category: {workout.category}
                            </p>

                            <p>
                                Sets: {workout.sets} |
                                Reps: {workout.reps} |
                                Weight: {workout.weight} kg
                            </p>

                            <p>
                                Duration: {workout.duration} minutes
                            </p>

                            <p>
                                Calories: {workout.calories}
                            </p>

                            <p>
                                Date:{" "}
                                {new Date(
                                    workout.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <br />

            <button onClick={() => navigate("/add-workout")}>
                Add Another Workout
            </button>

            <br />
            <br />

            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>
        </div>
    );
}

export default WorkoutHistory;