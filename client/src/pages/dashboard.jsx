import { useEffect, useState } from "react";

function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    return (
        <div>
            <h1>Fitness Dashboard</h1>

            {user ? (
                <div>
                    <h2>Welcome, {user.name}! 👋</h2>
                    <p>Email: {user.email}</p>
                </div>
            ) : (
                <p>Welcome to your dashboard!</p>
            )}

            <hr />

            <h2>Your Progress</h2>

            <div>
                <p>Total Workouts: 0</p>
                <p>Calories Burned: 0</p>
                <p>Workout Time: 0 minutes</p>
            </div>
        </div>
    );
}

export default Dashboard;