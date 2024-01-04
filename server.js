require("dotenv").config()
const dbConnectionString = process.env.RENDER_DB_CONNECTION_STRING

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const HighScore = require("./HighScores")

const app = express()
app.use(cors())
app.use(express.json())

// Content Security Policy middleware
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' data:; style-src 'self' https://fonts.googleapis.com; connect-src 'self' https://deckofcardsapi.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://deckofcardsapi.com"
    )
    next()
})

// MongoDB connection setup
mongoose.connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

// Serve static files from the root directory
app.use(express.static(__dirname)) // Assumes files are in the same directory as server.js

// Route for the root URL - Will serve the index.html or default file
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html") // Change "index.html" to your main HTML file
})

// Endpoint to fetch high scores
app.get("/highscores", async (req, res) => {
    try {
        const highScores = await HighScore.find().sort({ score: -1 })
        res.json(highScores)
    } catch (error) {
        console.error("Error fetching high scores:", error)
        res.status(500).json({ error: "Could not fetch high scores" })
    }
})

// Endpoint to add a score to high scores
app.post("/add-score", async (req, res) => {
    try {
        const { playerName, score } = req.body

        if (!playerName || !score) {
            return res
                .status(400)
                .json({ error: "Player name and score are required" })
        }

        // Create a new high score entry
        const newHighScore = new HighScore({ playerName, score })
        await newHighScore.save()

        res.status(201).json({
            message: "Score added successfully",
            highScore: newHighScore,
        })
    } catch (error) {
        console.error("Error adding score:", error)
        res.status(500).json({ error: "Failed to add score to high scores" })
    }
})

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
