# Pyramids Solitaire Game

This project implements a JavaScript-based Pyramid Solitaire game that allows players to clear cards in the pyramid by following specific rules. Additionally, it features a high score list integrated with MongoDB, Express.js, and Node.js.

## Game Rules

The game follows these rules:
- Clear all cards in the pyramid by playing cards adjacent by 1 (higher or lower) than the face-up card.
- Reveal face-down cards by playing the cards overlapping them.
- Ace can be both high and low.

## Features

- **Interactive Gameplay:** Play the Pyramid Solitaire game in your browser.
- **High Score List:** Track top scores achieved by players.
- **MongoDB Integration:** Utilizes MongoDB, MongoDB Compass, and MongoDB Atlas for storing and managing high scores.

## Project Structure

### Files
- `index.js`: Contains the game logic, including fetching cards, rendering, and gameplay functionality.
- `server.js`: Sets up the Express server, handles routes, serves static files, and manages endpoints for fetching high scores and adding new scores.
- `HighScores.js`: Defines the MongoDB schema for high scores.

### High Score Management

- The high score list is stored in a MongoDB database and managed through the provided Express endpoints.
- Endpoint for retrieving high scores: `GET /highscores`
- Endpoint for adding a score: `POST /add-score`

### Gameplay Mechanics

- The `index.js` file contains the game logic, handling card fetching, rendering, and player interactions.
- The game follows the specified rules, allowing players to clear the pyramid by playing adjacent cards or drawing new cards.

## Contact

For any queries, suggestions or support related to the game, contact me [here.](mailto:philip@jerkner.se).
