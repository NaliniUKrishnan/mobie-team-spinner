document.addEventListener("DOMContentLoaded", function() {
    const firestore = firebase.firestore();
    const beesCollection = firestore.collection('bees');
    // const allBees = ["Ian", "Barry", "Martin", "Ben", "Fared", "Peter", "Aaron", "Alice", "Ryan", "Karen", "Ollie"];
    beesCollection.get().then((querySnapshot) => {
        const allBees = [];
        querySnapshot.forEach((doc) => {
            allBees.push(doc.data().name);
        });
        shuffleArray(allBees);
        const beeToggles = document.getElementById("beeToggles");
        const beeTrack = document.getElementById("bees-container");
        const startButton = document.getElementById("startButton");
        let winnerAnnounced = false;

        // Create toggles for each bee
        allBees.forEach(name => {
            const toggleContainer = document.createElement("div");
            toggleContainer.className = "toggle-container";

            const toggleLabel = document.createElement("label");
            toggleLabel.innerText = name;
            toggleLabel.htmlFor = "toggle-" + name;

            const toggleInput = document.createElement("input");
            toggleInput.type = "checkbox";
            toggleInput.id = "toggle-" + name;
            toggleInput.className = "bee-toggle";
            toggleInput.checked = true;

            toggleContainer.appendChild(toggleLabel);
            toggleContainer.appendChild(toggleInput);
            beeToggles.appendChild(toggleContainer);
        });

        startButton.addEventListener("click", function() {
            console.log("Start button clicked");
            beeTrack.innerHTML = '';
            displayCenterMessage("3", true);

            var countdownValue = 2;
            var countdownInterval = setInterval(function() {
                displayCenterMessage(String(countdownValue), true);
                if (countdownValue <= 0) {
                    clearInterval(countdownInterval);
                    startRace();
                }
                countdownValue--;
            }, 1000);
        });

    function startRace() {
        let topPosition = 0;
        allBees.forEach(function(name) {
            const toggleInput = document.getElementById("toggle-" + name);
            if (toggleInput && toggleInput.checked) {
                var beeContainer = createBeeContainer(name, topPosition);
                beeTrack.appendChild(beeContainer);
                topPosition += 30;
                animateBee(beeContainer, name);
            }
        });
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

    function animateBee(beeContainer, name) {
        let duration = Math.random() * 50 + 5;
        let tween = gsap.to(beeContainer, {
            duration: duration,
            ease: "none",
            x: "+=100vw",
            onUpdate: function() {
                let beeRect = beeContainer.getBoundingClientRect();
                if (beeRect.right >= window.innerWidth && !winnerAnnounced) {
                    winnerAnnounced = true;
                    displayCenterMessage("The winner is: " + name, false);
                }
            }
        });

        gsap.to(beeContainer, {
            duration: 0.2 + Math.random() * 0.3,
            y: "+=" + (10 + Math.random() * 15),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        setInterval(function() {
            if (Math.random() < 0.5) {
                duration = Math.random() * 20 + 3;
                tween.duration(duration);
            }
        }, 300);
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
            }, 4000);
        }
    }
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    });
});


