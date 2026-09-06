const express = require("express");

const {
    addWorkout,
    getWorkouts
} = require("../controllers/workoutController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addWorkout);
router.get("/", protect, getWorkouts);

module.exports = router;