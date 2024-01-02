import relationships from "./relationships.js"
import convertFaceCards from "./utils.js"
const mainEl = document.getElementById("main")
const rulesEl = document.getElementById("rules")
const highScoresEl = document.getElementById("highScores")
const cardContainerEl = document.getElementById("cardContainer")

let cardsArray = []
let deckId = ""
let drawnCard = null
let cardsInDeck = null

let highScoreArray = []

fetch("http://localhost:3000/highscores")
    .then((response) => response.json())
    .then((data) => {
        highScoreArray = data
    })
    .catch((error) => {
        console.error("Error fetching high scores:", error)
    })

async function fetchDeck() {
    const deckData = await fetchCards()
    if (deckData) {
        mapCardData(deckData)
        await drawFirstCard()
        renderCards()
        renderDeckCard()
    }
}

async function drawFirstCard() {
    try {
        const res = await fetch(
            `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
        )
        const data = await res.json()
        cardsInDeck = data.remaining
        updateDrawnCard(data)
    } catch (error) {
        handleCardError(error)
    }
}

async function fetchCards() {
    try {
        const res = await fetch(
            `https://deckofcardsapi.com/api/deck/new/draw/?count=28`
        )
        return await res.json()
    } catch (error) {
        console.error("Error fetching deck:", error)
        return null
    }
}

function mapCardData(data) {
    if (data) {
        cardsArray = data.cards.map((card, index) => ({
            ...card,
            value: JSON.parse(convertFaceCards(card.value)),
            index,
        }))
        deckId = data.deck_id
    }
}

async function drawNextCard() {
    try {
        const cardData = await fetchCard()
        if (cardData) {
            updateDrawnCard(cardData)
            cardsInDeck = cardData.remaining
            renderDeckCard()
        }
    } catch (error) {
        handleCardError(error)
    }
}

async function fetchCard() {
    try {
        const res = await fetch(
            `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
        )
        return await res.json()
    } catch (error) {
        console.error("Error fetching card:", error)
        return null
    }
}

function updateDrawnCard(data) {
    if (data && data.cards && data.cards.length > 0) {
        drawnCard = data.cards[0]
        drawnCard.value = convertFaceCards(drawnCard.value)
    }
}

function handleCardError(error) {
    console.error("Error fetching card:", error)
}

function renderDeckCard() {
    const deckEl = document.getElementById("deck")
    updateEventListener(deckEl)
    const pText = generateText()
    const cardHtml = generateCardHtml("blank.png", pText)
    deckEl.innerHTML = cardHtml

    if (drawnCard && drawnCard.image) {
        const img = new Image()
        img.onload = function () {
            deckEl.querySelector("img").src = drawnCard.image
        }
        img.src = drawnCard.image
    }
}

function updateEventListener(deckEl) {
    deckEl.addEventListener("click", cardsInDeck ? drawNextCard : resetGame)
}

function generateText() {
    return cardsInDeck
        ? `<p>Click to<br>draw a card<span class="remaining"><span>${cardsInDeck}</span> remaining</span></p>`
        : `<p>You are out of cards.<br><br>Click here to play again.</p>`
}

function generateCardHtml(imageSrc, pText) {
    return `<div class="card deck-card">
                ${pText}
                <img class="card deck-drawn-card" src="${imageSrc}" />
            </div>`
}
function renderCards() {
    let rowsHTML = `
    <div id="deck"></div>
    <div class="buttons">
        <button class="btn" onClick="location.reload()">
            Restart game
        </button>
        <button class="btn" id="highScoresBtn">
            High scores
        </button>
        <button class="btn" id="rulesBtn">
            Rules
        </button>
    </div>
    `

    let cardIndex = 0

    for (let i = 0; i < 7; i++) {
        rowsHTML += `<div class="row row${i}">`

        for (let j = 0; j <= i; j++) {
            const card = cardsArray[cardIndex]

            let cardImageSrc = ""
            let cardClass = "card"

            if (!card) {
                cardImageSrc = "null.png"
                cardClass = "card empty"
            } else {
                const relatedCards = relationships[cardIndex]
                const areRelatedNull = areRelatedCardsNull(relatedCards)
                cardImageSrc = areRelatedNull ? card.image : "back.png"
                cardClass = areRelatedNull ? "card clickable" : "card"
            }

            rowsHTML += `<div class="${cardClass}">
                        <img data-card-index="${cardIndex}" src="${cardImageSrc}" />
                    </div>`
            cardIndex++
        }

        rowsHTML += `</div>`
    }

    cardContainerEl.innerHTML = rowsHTML
    const rulesBtn = document.getElementById("rulesBtn")
    rulesBtn.addEventListener("click", toggleRules)
    const highScoresBtn = document.getElementById("highScoresBtn")
    highScoresBtn.addEventListener("click", toggleHighScores)

    cardContainerEl.addEventListener("click", function (event) {
        const cardIndex = parseInt(event.target.dataset.cardIndex)
        checkWin()

        if (
            drawnCard &&
            !isNaN(cardIndex) &&
            areRelatedCardsNull(relationships[cardIndex]) &&
            cardsArray[cardIndex] &&
            cardsArray[cardIndex].value
        ) {
            const clickedCardValue = cardsArray[cardIndex].value
            const isAce =
                (clickedCardValue === 1 && drawnCard.value === 14) ||
                (clickedCardValue === 14 && drawnCard.value === 1)

            if (
                Math.abs(clickedCardValue - drawnCard.value) === 1 ||
                isAce ||
                (clickedCardValue === 2 && drawnCard.value === 14) ||
                (clickedCardValue === 14 && drawnCard.value === 2)
            ) {
                drawnCard.value = clickedCardValue
                drawnCard = { ...cardsArray[cardIndex] }
                cardsArray[cardIndex] = null

                const cardElement = cardContainerEl.querySelector(
                    `[data-card-index="${cardIndex}"]`
                )
                if (!cardsArray[cardIndex]) {
                    cardElement.classList.add("empty")
                } else {
                    cardElement.classList.remove("empty")
                }
                renderCards()
                renderDeckCard()
            }
        }
    })
}

function areRelatedCardsNull(cardIndices) {
    return cardIndices.every(
        (index) => index === null || cardsArray[index] === null
    )
}

function toggleRules(event) {
    event.stopPropagation()

    const rulesHTML = `
        <div class="rules modal">
            <p>
                Clear all cards in the pyramid by playing cards adjacent by 1 (higher or lower) than the face-up card; reveal face-down cards by playing the cards overlapping them. Ace can be both high and low.<br><br>If there are no valid plays in the pyramid, draw from the pile for a new card.
            </p>
        </div>
    `

    if (!rulesEl.contains(event.target)) {
        closeAllModals()
        rulesEl.innerHTML = rulesEl.innerHTML ? "" : rulesHTML
    }
}

function toggleHighScores(event) {
    event.stopPropagation()
    const highScoresHTML = `
    <div class="high-scores modal">
    <h2>High scores</h2>
    <p class="scores-header">Cards left in deck:</p>
        ${highScoreArray
            .map(
                (entry, index) => `
            <div class="high-score-entry">
                <p>${index + 1}.  ${entry.playerName}</p>
                <p class="score">${entry.score}</p>
            </div>
        `
            )
            .join("")}
    </div>
`

    if (!highScoresEl.contains(event.target)) {
        closeAllModals()
        highScoresEl.innerHTML = highScoresEl.innerHTML ? "" : highScoresHTML
    }
}

function closeAllModals() {
    rulesEl.innerHTML = ""
    highScoresEl.innerHTML = ""
}

document.addEventListener("click", function (event) {
    if (rulesEl.innerHTML && !rulesEl.contains(event.target)) {
        rulesEl.innerHTML = ""
    }
})
document.addEventListener("click", function (event) {
    if (highScoresEl.innerHTML && !highScoresEl.contains(event.target)) {
        highScoresEl.innerHTML = ""
    }
})

function resetGame() {
    location.reload()
}

function checkWin() {
    if (cardsArray.filter((card) => card !== null).length == 0) {
        mainEl.innerHTML = `<div class="win">
            <h1>Congratulations!</h1>
            <p>You won with ${cardsInDeck} cards left in the deck!</p>
            <p>Add your name to the high scores!</p>
            <input type="text"
                maxlength="12"
                id="playerNameInput"
                placeholder="Enter your name" 
                required
            />
            <button class="btn" id="addScoreBtn">Add to High Scores</button>
            <button class="btn" id="restartBtn">Click here to play again!</button>
        </div>`

        const playerNameInput = document.getElementById("playerNameInput")
        playerNameInput.focus()

        const addScoreBtn = document.getElementById("addScoreBtn")
        addScoreBtn.addEventListener("click", addToHighScores)

        const restartBtn = document.getElementById("restartBtn")
        restartBtn.addEventListener("click", resetGame)
    }
}

async function addToHighScores() {
    const playerName = document.getElementById("playerNameInput").value
    if (playerName.length > 0) {
        try {
            const response = await fetch("http://localhost:3000/add-score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ playerName, score: cardsInDeck }),
            })

            if (response.ok) {
            } else {
                console.error("Failed to add score to high scores!")
            }
        } catch (error) {
            console.error("Error adding score:", error)
        }
        resetGame()
    } else {
        alert("Please enter your name!")
    }
}

fetchDeck()
