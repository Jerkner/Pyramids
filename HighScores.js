const mongoose = require("mongoose")

const highScoreSchema = new mongoose.Schema({
    playerName: String,
    score: Number,
})

const HighScore = mongoose.model("HighScore", highScoreSchema)

module.exports = HighScore
