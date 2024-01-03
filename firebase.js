const firebaseConfig = {
    apiKey: "AIzaSyA2o_Rm_fXV3riFteK0IjU5mA0kQpBxjio",
    authDomain: "pyramids-bcfc7.firebaseapp.com",
    databaseURL:
        "https://pyramids-bcfc7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pyramids-bcfc7",
    storageBucket: "pyramids-bcfc7.appspot.com",
    messagingSenderId: "661684730417",
    appId: "1:661684730417:web:8010267de56bdea5c1f310",
}

// Add score to the database
function addToHighScores(playerName, score) {
    const dbRef = firebase.database().ref("highScores")
    const newScoreRef = dbRef.push()

    newScoreRef.set({
        playerName: playerName,
        score: score,
    })
}

// Fetch high scores from the database
function fetchHighScores() {
    const dbRef = firebase.database().ref("highScores")

    dbRef
        .orderByChild("score")
        .limitToLast(10)
        .once("value")
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const entry = childSnapshot.val()
                console.log(entry.playerName + ": " + entry.score)
                // You can update your UI here with the high scores
            })
        })
        .catch((error) => {
            console.error("Error fetching high scores:", error)
        })
}

export { addToHighScores, fetchHighScores }
