const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true
        },

        target: {
            type: Number,
            required: true,
            min: 1
        },

        progress: {
            type: Number,
            default: 0,
            min: 0
        },

        unit: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Goal", goalSchema);