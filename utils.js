export default function convertFaceCards(cardValue) {
    switch (cardValue) {
        case "2":
            return 2
        case "3":
            return 3
        case "4":
            return 4
        case "5":
            return 5
        case "6":
            return 6
        case "7":
            return 7
        case "8":
            return 8
        case "9":
            return 9
        case "10":
            return 10
        case "JACK":
            return 11
        case "QUEEN":
            return 12
        case "KING":
            return 13
        case "ACE":
            return 14
        default:
            return cardValue
    }
}
