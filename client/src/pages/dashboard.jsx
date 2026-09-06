import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        fetchWorkouts();
    }, []);

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

            console.log("Dashboard workouts:", response.data);

            setWorkouts(response.data);

        } catch (error) {
            console.error(
                "Dashboard error:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const totalWorkouts = workouts.length;

    const totalCalories = workouts.reduce(
        (total, workout) => {
            return total + Number(workout.calories || 0);
        },
        0
    );

    const totalDuration = workouts.reduce(
        (total, workout) => {
            return total + Number(workout.duration || 0);
        },
        0
    );

    return (
        <div>
            <h1>Fitness Dashboard</h1>

            {user && (
                <div>
                    <h2>Welcome, {user.name}! 👋</h2>
                    <p>Email: {user.email}</p>
                </div>
            )}

            <hr />

            <h2>Your Progress</h2>

            {loading ? (
                <p>Loading workout data...</p>
            ) : (
                <div>
                    <p>
                        Total Workouts: {totalWorkouts}
                    </p>

                    <p>
                        Calories Burned: {totalCalories}
                    </p>

                    <p>
                        Workout Time: {totalDuration} minutes
                    </p>
                </div>
            )}

            <hr />

            <button onClick={() => navigate("/add-workout")}>
                ➕ Add Workout
            </button>

            <br />
            <br />

            <button onClick={() => navigate("/workout-history")}>
                📋 Workout History
            </button>

            <br />
            <br />

            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                }}
            >
                Logout
            </button>
        </div>
    );
}

export default Dashboard;