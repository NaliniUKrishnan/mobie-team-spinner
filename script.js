document.addEventListener("DOMContentLoaded", function() {
    const firestore = firebase.firestore();
    const beesCollection = firestore.collection('bees');
    beesCollection.get().then((querySnapshot) => {
        const allBees = [];
        let winnerIds = [];
        let winnerNames = [];

        querySnapshot.forEach((doc) => {
            allBees.push(doc.data().name);
        });
        shuffleArray(allBees);
        displayLastWinners();
        const beeTrack = document.getElementById("bees-container");
        const startButton = document.getElementById("startButton");
        const topFourButton = document.getElementById("topFourButton");
        let winnerAnnounced = false;
        let isTopFourRace = false;

        startButton.addEventListener("click", function() {
            startCountdownAndRace(false);
        });

        topFourButton.addEventListener("click", function() {
            startCountdownAndRace(true);
        });

        function startRace(isTopFour) {
            isTopFourRace = isTopFour;
            winnerAnnounced = false;
            let winnerIds = [];
            let winnerNames = [];
            beesCollection.get().then((querySnapshot) => {
                let topPosition = 0;
                beeTrack.innerHTML = '';

                querySnapshot.forEach((doc) => {
                    let beeData = doc.data();
                    if (beeData.enabled) {
                        var beeContainer = createBeeContainer(beeData.name, topPosition);
                        beeTrack.appendChild(beeContainer);
                        topPosition += 30;
                        animateBee(beeContainer, beeData.name, doc.id);
                    }
                });
            });
        }

        function startCountdownAndRace(isTopFourRace) {
            beeTrack.innerHTML = '';
            displayCenterMessage("3", true);

            var countdownValue = 2;
            var countdownInterval = setInterval(function() {
                displayCenterMessage(String(countdownValue), true);
                if (countdownValue <= 0) {
                    clearInterval(countdownInterval);
                    if (isTopFourRace) {
                        startRace(true);
                    } else {
                        startRace(false);
                    }
                }
                countdownValue--;
            }, 1000);
        }

        function createBeeContainer(name, topPosition) {
            var beeContainer = document.createElement("div");
            beeContainer.className = "bee-container";
            beeContainer.style.top = topPosition + 'px';

            var nameLabel = document.createElement("div");
            nameLabel.className = "name-label";
            nameLabel.innerText = name;
            beeContainer.appendChild(nameLabel);

            var bee = document.createElement("div");
            bee.className = "bee";
            beeContainer.appendChild(bee);

            return beeContainer;
        }

        function animateBee(beeContainer, name, beeId) {
            let duration = Math.random() * 50 + 5;
            let tween = gsap.to(beeContainer, {
                duration: duration,
                ease: "none",
                x: "+=100vw",
                onUpdate: () => updateRace(beeContainer, name, beeId)
            });

            gsap.to(beeContainer, {
                duration: 0.2 + Math.random() * 0.3,
                y: "+=" + (10 + Math.random() * 15),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            setInterval(() => {
                if (Math.random() < 0.5) {
                    duration = Math.random() * 20 + 3;
                    tween.duration(duration);
                }
            }, 300);
        }

        function updateRace(beeContainer, name, beeId) {
            let beeRect = beeContainer.getBoundingClientRect();
            if (beeRect.right < window.innerWidth) {
                return;
            }

            if (isTopFourRace) {
                updateTopFourRace(name, beeId);
            } else if (!winnerAnnounced) {
                winnerAnnounced = true;
                announceWinner(name, beeId);
            }
        }

        function updateTopFourRace(name, beeId) {
            if (winnerNames.includes(name) || winnerNames.length >= 4) {
                return;
            }

            winnerNames.push(name);
            winnerIds.push(beeId); // Store beeId
            if (winnerNames.length === 4) {
                displayCenterMessage("Top 4 winners: " + winnerNames.join(", "), false);
                updateLastWinners(winnerIds);

                winnerIds.forEach(winnerId => {
                    beesCollection.doc(winnerId).update({ enabled: false });
                });

                refreshBeesList();
                displayLastWinners();
            }
        }

        function announceWinner(name, beeId) {
            displayCenterMessage("The winner is: " + name, false);
            beesCollection.doc(beeId).update({ enabled: false }).then(() => {
                refreshBeesList();
                updateLastWinners([beeId]);
                displayLastWinners();
            }).catch((error) => {
                console.error("Error updating bee: ", error);
            });
        }

        function updateLastWinners(winnerIds) {
            const lastWinnersCollection = firestore.collection('lastWinners');
            for (let i = 0; i < 4; i++) {
                let winnerDocId = i < winnerIds.length ? winnerIds[i] : '';
                lastWinnersCollection.doc((i + 1).toString()).set({ beeReference: winnerDocId });
            }
        }


        function displayCenterMessage(message, isCountdown) {
            let messageElement = document.getElementById("center-message");
            if (!messageElement) {
                messageElement = document.createElement("h1");
                messageElement.id = "center-message";
                document.body.appendChild(messageElement);
            }
            
            messageElement.style.display = "block";
            messageElement.innerHTML = message;

            if (isCountdown && message === "0") {
                setTimeout(() => {
                    messageElement.style.display = "none";
                }, 1000);
            }

            if (!isCountdown) {
                setTimeout(() => {
                    messageElement.style.display = "none";
                }, 10000);
            }
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function displayLastWinners() {
            const lastWinnersCollection = firestore.collection('lastWinners');
            lastWinnersCollection.get().then((querySnapshot) => {
                let winnersData = [];
                querySnapshot.forEach((doc) => {
                    if (doc.data().beeReference) {
                        winnersData.push({ dayIndex: parseInt(doc.id, 10) - 1, beeId: doc.data().beeReference });
                    }
                });

                if (winnersData.length === 0) {
                    document.getElementById("lastWinnersContent").innerText = "Last Winner: None";
                } else if (winnersData.length === 1) {
                    beesCollection.doc(winnersData[0].beeId).get().then((beeDoc) => {
                        const beeName = beeDoc.data().name;
                        document.getElementById("lastWinnersContent").innerText = beeName;
                    });
                } else {
                    let displayText = "";
                    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday"];
                    winnersData.forEach(winnerData => {
                        beesCollection.doc(winnerData.beeId).get().then((beeDoc) => {
                            const beeName = beeDoc.data().name;
                            displayText += dayNames[winnerData.dayIndex] + ": " + beeName + "\n";
                            document.getElementById("lastWinnersContent").innerText = displayText;
                        });
                    });
                }
            });
        }

    });
});


