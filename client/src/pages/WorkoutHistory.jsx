import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function WorkoutHistory() {
    const navigate = useNavigate();

    const [workouts, setWorkouts] = useState([]);
    const [message, setMessage] = useState("");

    const [editingWorkout, setEditingWorkout] = useState(null);

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

    useEffect(() => {
        fetchWorkouts();
    }, []);


    // DELETE WORKOUT
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this workout?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await axios.delete(
                `http://localhost:5000/api/workouts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(response.data.message);

            fetchWorkouts();

        } catch (error) {
            console.error(error);

            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Cannot connect to server");
            }
        }
    };


    // START EDIT
    const handleEdit = (workout) => {
        setEditingWorkout({
            ...workout
        });

        setMessage("");
    };


    // UPDATE WORKOUT
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await axios.put(
                `http://localhost:5000/api/workouts/${editingWorkout._id}`,
                {
                    exercise: editingWorkout.exercise,
                    category: editingWorkout.category,
                    sets: editingWorkout.sets,
                    reps: editingWorkout.reps,
                    weight: editingWorkout.weight,
                    duration: editingWorkout.duration,
                    calories: editingWorkout.calories
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(response.data.message);

            setEditingWorkout(null);

            fetchWorkouts();

        } catch (error) {
            console.error(error);

            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Cannot connect to server");
            }
        }
    };


    return (
        <div>

            <h1>Workout History</h1>

            {message && <p>{message}</p>}


            {/* EDIT FORM */}
            {editingWorkout && (
                <div>

                    <hr />

                    <h2>Edit Workout</h2>

                    <form onSubmit={handleUpdate}>

                        <div>
                            <label>Exercise: </label>

                            <input
                                type="text"
                                value={editingWorkout.exercise}
                                onChange={(e) =>
                                    setEditingWorkout({
                                        ...editingWorkout,
                                        exercise: e.target.value
                                    })
                                }
                            />
                        </div>

                        <br />

                        <div>
                            <label>Category: </label>

                            <select
                                value={editingWorkout.category}
                                onChange={(e) =>
                                    setEditingWorkout({
                                        ...editingWorkout,
                                        category: e.target.value
                                    })
                                }
                            >
                                <option value="Strength">
                                    Strength
                                </option>

                                <option value="Cardio">
                                    Cardio
                                </option>

                                <option value="Flexibility">
                                    Flexibility
                                </option>

                                <option value="Sports">
                                    Sports
                                </option>

                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>

                        <br />

                        <div>
                            <label>Sets: </label>

                            <input
                                type="number"
                                value={editingWorkout.sets}
                                onChange={(e) =>
                                    setEditingWorkout({
                                        ...editingWorkout,
                                        sets: e.target.value
                                    })
                                }
                            />
                        </div>

                        <br />

                        <div>
                            <label>Reps: </label>

                            <input
                                type="number"
                                value={editingWorkout.reps}
                                onChange={(e) =>
                                    setEditingWorkout({
                                        ...editingWorkout,
                                        reps: e.target.value
                                    })
                                }
                            />
                        </div>

                        <br />

                        <div>
                            <label>Weight: </label>

                            <input
                                type="number"
                                value={editingWorkout.weight}
                                onChange={(e) =>
                                    setEditingWorkout({
                                        ...editingWorkout,
                                        weight: e.target.value
                                    })
                                }
                            />

                            kg
                        </div>

                        <br />

                        <div>
                            <label>Duration: </label>

                            <input
                                type="number"
                                value={editingWorkout.duration}
                                onChange={(e) =>
                                    setEditingWorkout({
                                        ...editingWorkout,
                                        duration: e.target.value
                                    })
                                }
                            />

                            minutes
                        </div>

                        <br />

                        <div>
                            <label>Calories: </label>

                            <input
                                type="number"
                                value={editingWorkout.calories}
                                onChange={(e) =>
                                    setEditingWorkout({
                                        ...editingWorkout,
                                        calories: e.target.value
                                    })
                                }
                            />
                        </div>

                        <br />

                        <button type="submit">
                            Save Changes
                        </button>

                        <button
                            type="button"
                            onClick={() => setEditingWorkout(null)}
                        >
                            Cancel
                        </button>

                    </form>

                    <hr />

                </div>
            )}


            {/* WORKOUT LIST */}
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


                            {/* EDIT BUTTON */}
                            <button
                                onClick={() =>
                                    handleEdit(workout)
                                }
                            >
                                Edit
                            </button>


                            {" "}


                            {/* DELETE BUTTON */}
                            <button
                                onClick={() =>
                                    handleDelete(workout._id)
                                }
                            >
                                Delete
                            </button>

                        </div>
                    ))}

                </div>
            )}


            <br />

            <button
                onClick={() =>
                    navigate("/add-workout")
                }
            >
                Add Another Workout
            </button>

            <br />
            <br />

            <button
                onClick={() =>
                    navigate("/dashboard")
                }
            >
                Back to Dashboard
            </button>

        </div>
    );
}

export default WorkoutHistory;