const mongoose = require("mongoose")

const highScoreSchema = new mongoose.Schema(
    {
        playerName: String,
        score: Number,
    },
    {
        timestamps: true, // Add timestamps for createdAt and updatedAt
    }
)

const HighScore = mongoose.model("HighScore", highScoreSchema)

module.exports = HighScore
