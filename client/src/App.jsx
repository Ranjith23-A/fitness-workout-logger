import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import AddWorkout from "./pages/AddWorkout";
import WorkoutHistory from "./pages/WorkoutHistory";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/add-workout"
                    element={<AddWorkout />}
                />

                <Route
    path="/workout-history"
    element={<WorkoutHistory />}
/>


            </Routes>
        </BrowserRouter>
    );
}

export default App;