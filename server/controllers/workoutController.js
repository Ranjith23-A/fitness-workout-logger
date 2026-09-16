const Workout = require("../models/Workout");


// ADD WORKOUT
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


// GET WORKOUTS
const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user.userId
    }).sort({
      createdAt: -1
    });

    res.status(200).json(workouts);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
};


// UPDATE WORKOUT
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!workout) {
      return res.status(404).json({
        message: "Workout not found"
      });
    }

    const {
      exercise,
      category,
      sets,
      reps,
      weight,
      duration,
      calories
    } = req.body;

    workout.exercise = exercise;
    workout.category = category;
    workout.sets = sets;
    workout.reps = reps;
    workout.weight = weight;
    workout.duration = duration;
    workout.calories = calories;

    await workout.save();

    res.status(200).json({
      message: "Workout updated successfully!",
      workout
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
};


// DELETE WORKOUT
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!workout) {
      return res.status(404).json({
        message: "Workout not found"
      });
    }

    res.status(200).json({
      message: "Workout deleted successfully!"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
};


// EXPORT FUNCTIONS
module.exports = {
  addWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout
};