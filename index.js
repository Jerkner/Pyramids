const mainEl = document.getElementById("main")
const cardContainerEl = document.getElementById("cardContainer")
import relationships from "./relationships.js"
import convertFaceCards from "./utils.js"

let cardsArray = []
let deckId = ""
let drawnCard = null
let cardsInDeck = 24

async function fetchDeck() {
    const res = await fetch(
        `https://deckofcardsapi.com/api/deck/new/draw/?count=28`
    )
    const data = await res.json()

    cardsArray = data.cards.map((card, index) => ({
        ...card,
        value: JSON.parse(convertFaceCards(card.value)),
        index,
    }))
    deckId = data.deck_id

    renderCards()
    renderDeckCard()
}

async function drawNextCard() {
    const res = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
    )
    const data = await res.json()

    drawnCard = data.cards[0]
    drawnCard.value = convertFaceCards(drawnCard.value)

    cardsInDeck -= 1
    renderDeckCard()
    console.log(cardsInDeck)
}

function renderDeckCard() {
    const deckEl = document.getElementById("deck")
    deckEl.addEventListener("click", drawNextCard)

    const imageSrc =
        cardsInDeck === 0
            ? "null.png"
            : drawnCard && drawnCard.image
            ? drawnCard.image
            : "Back.png"
    const cardHtml = `<div class="card" id="deckCard">
                        <img src="${imageSrc}" />
                        <p><span class="remaining">${cardsInDeck} remaining</span>Click deck to draw card</p>
                    </div>`

    deckEl.innerHTML = cardHtml
}

function renderCards() {
    let rowsHTML = `
    <div id="deck"></div>
    <button class="restart" onClick="location.reload()">
        Restart game
    </button>
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
                cardImageSrc = areRelatedNull ? card.image : "Back.png"
            }

            rowsHTML += `<div class="${cardClass}">
                        <img data-card-index="${cardIndex}" src="${cardImageSrc}" />
                    </div>`
            cardIndex++
        }

        rowsHTML += `</div>`
    }

    cardContainerEl.innerHTML = rowsHTML

    cardContainerEl.addEventListener("click", function (event) {
        const cardIndex = parseInt(event.target.dataset.cardIndex)
        checkWin()

        if (
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
                renderDeckCard()
                renderCards()
            }
        }
    })
}
function areRelatedCardsNull(cardIndices) {
    return cardIndices.every(
        (index) => index === null || cardsArray[index] === null
    )
}

fetchDeck()

function resetGame() {
    location.reload()
}

function checkWin() {
    if (cardsArray.filter((card) => card !== null).length == 0) {
        console.log("win")

        mainEl.innerHTML = `<div class="win">
            <h1>Congratulations!</h1>
            <p>Click the button below to play again.</p>
            <button id="restartBtn">Click here!</button>
        </div>`

        const restartBtn = document.getElementById("restartBtn")
        restartBtn.addEventListener("click", resetGame)
    }
}
