const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    exercise: String,
    category: String,
    sets: Number,
    reps: Number,
    weight: Number,
    duration: Number,
    calories: Number
}, { timestamps: true });

module.exports = mongoose.model("Workout", workoutSchema);