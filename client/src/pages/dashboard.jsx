import "../dashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

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

const recentWorkouts = workouts.slice(0, 5);
const getWeeklyData = () => {
    const today = new Date();

    const day = today.getDay();

    const monday = new Date(today);

    const daysFromMonday = day === 0 ? 6 : day - 1;

    monday.setDate(today.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);

    const weekDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    return weekDays.map((dayName, index) => {
        const currentDay = new Date(monday);

        currentDay.setDate(monday.getDate() + index);

        const nextDay = new Date(currentDay);

        nextDay.setDate(currentDay.getDate() + 1);

        const count = workouts.filter((workout) => {
            const workoutDate = new Date(workout.createdAt);

            return (
                workoutDate >= currentDay &&
                workoutDate < nextDay
            );
        }).length;

        return {
            day: dayName.substring(0, 3),
            workouts: count
        };
    });
};

const weeklyData = getWeeklyData();

   return (
    <div className="dashboard">

        <div className="dashboard-header">

            <div>
                <h1>Fitness Track</h1>

                {user && (
                    <p className="welcome">
                        Welcome, {user.name}! 👋
                    </p>
                )}
            </div>

            <button
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                }}
            >
                Logout
            </button>

        </div>


        <div className="stats">

            <div className="stat-card">
                <h3>🏋️ Total Workouts</h3>
                <p>{totalWorkouts}</p>
            </div>

            <div className="stat-card">
                <h3>🔥 Calories Burned</h3>
                <p>{totalCalories}</p>
            </div>

            <div className="stat-card">
                <h3>⏱️ Workout Time</h3>
                <p>{totalDuration} min</p>
            </div>

        </div>


        <div className="recent-section">
            <div className="weekly-section">

    <h2>Weekly Progress</h2>

    <p>
        Workouts completed this week
    </p>

    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar
                dataKey="workouts"
                name="Workouts"
            />

        </BarChart>
    </ResponsiveContainer>

</div>

            <h2>Recent Workouts</h2>

            {loading ? (
                <p>Loading workout data...</p>
            ) : recentWorkouts.length === 0 ? (
                <p>No workouts recorded yet.</p>
            ) : (
                <div className="workout-list">

                    {recentWorkouts.map((workout) => (

                        <div
                            className="workout-card"
                            key={workout._id}
                        >

                            <h3>{workout.exercise}</h3>

                            <p className="workout-info">
                                Category: {workout.category}
                            </p>

                            <p>
                                Sets: {workout.sets} |
                                Reps: {workout.reps} |
                                Weight: {workout.weight} kg
                            </p>

                            <p>
                                Duration: {workout.duration} minutes
                                {" | "}
                                Calories: {workout.calories}
                            </p>

                            <p className="workout-info">
                                {new Date(
                                    workout.createdAt
                                ).toLocaleDateString()}
                            </p>

                        </div>

                    ))}

                </div>
            )}


            <div className="actions">

                <button
                    className="primary-btn"
                    onClick={() => navigate("/add-workout")}
                >
                    ➕ Add Workout
                </button>

                <button
                    className="secondary-btn"
                    onClick={() => navigate("/workout-history")}
                >
                    📋 Workout History
                </button>

            </div>

        </div>

    </div>
);
}

export default Dashboard;