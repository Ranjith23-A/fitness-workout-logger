const Workout = require("../models/Workout");

// Add a workout
const addWorkout = async (req, res) => {
    try {
        const {
            exercise,
            category,
            sets,
            reps,
            weight,
            duration,
            calories
        } = req.body;

        if (!exercise || !category) {
            return res.status(400).json({
                message: "Exercise and category are required"
            });
        }

        const workout = await Workout.create({
            user: req.user.userId,
            exercise,
            category,
            sets,
            reps,
            weight,
            duration,
            calories
        });

        res.status(201).json({
            message: "Workout added successfully!",
            workout
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
};


// Get all workouts for logged-in user
const getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json(workouts);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
};


// Export controllers
module.exports = {
    addWorkout,
    getWorkouts
};