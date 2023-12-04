const mainEl = document.getElementById("main")
const rulesEl = document.getElementById("rules")
const cardContainerEl = document.getElementById("cardContainer")
import relationships from "./relationships.js"
import convertFaceCards from "./utils.js"

let cardsArray = []
let deckId = ""
let drawnCard = null
let cardsInDeck = null

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
        updateDrawnCard(data)
        cardsInDeck = data.remaining
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
        // renderDeckCard() // Update the deck card immediately with a placeholder
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
    handleDeckState(deckEl)
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
                <img src="${imageSrc}" />
            </div>`
}

function handleDeckState(deckEl) {
    if (cardsInDeck === 0) {
        deckEl.classList.add("overflow-hidden")
    }
}

function renderCards() {
    let rowsHTML = `
    <div id="deck" class="deck-class"></div>
    <div class="buttons">
        <button class="btn" onClick="location.reload()">
            Restart game
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
        <div class="rules-modal">
            <p>
                Clear all cards in the pyramid by playing cards adjacent by 1 (higher or lower) than the face-up card; reveal face-down cards by playing the cards overlapping them. Ace can be both high and low.<br><br>If there are no valid plays in the pyramid, draw from the pile for a new card.
            </p>
        </div>
    `

    if (!rulesEl.contains(event.target)) {
        rulesEl.innerHTML = rulesEl.innerHTML ? "" : rulesHTML
    }
}

document.addEventListener("click", function (event) {
    if (rulesEl.innerHTML && !rulesEl.contains(event.target)) {
        rulesEl.innerHTML = ""
    }
})

fetchDeck()

function resetGame() {
    location.reload()
}

function checkWin() {
    if (cardsArray.filter((card) => card !== null).length == 0) {
        mainEl.innerHTML = `<div class="win">
            <h1>Congratulations!</h1>
            <p>You won with ${cardsInDeck} cards left in the deck!</p>
            <button class="btn restart-btn" id="restartBtn">Click here to play again!</button>
        </div>`

        const restartBtn = document.getElementById("restartBtn")
        restartBtn.addEventListener("click", resetGame)
    }
}
