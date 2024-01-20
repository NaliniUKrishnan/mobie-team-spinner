document.addEventListener("DOMContentLoaded", function() {
    var modal = document.getElementById("settingsModal");
    var btn = document.getElementById("appIconContainer");
    var span = document.getElementsByClassName("close")[0];
    var dragItem = document.querySelector(".modal-content");
    var beesListDiv = document.getElementById('beesList');
    var addBeeButton = document.getElementById('addBeeButton');
    var newBeeNameInput = document.getElementById('newBeeName');
    var enableAllBeesButton = document.getElementById('enableAllBeesButton');


    var firestore = firebase.firestore();
    var beesCollection = firestore.collection('bees');

    // Fetch and display bees list
    window.refreshBeesList = function() {
        beesListDiv.innerHTML = '';
        const enabledBeesList = document.getElementById('enabledBeesList');
        enabledBeesList.innerHTML = '';

        beesCollection.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var beeData = doc.data();
                var beeName = beeData.name;
                var beeId = doc.id;
                var beeEnabled = beeData.enabled;

                // Create a container for each bee list item
                var listItemContainer = document.createElement('div');
                listItemContainer.className = 'bee-list-item-container';

                // Create a sub-container for the bee image and name
                var beeContentContainer = document.createElement('div');
                beeContentContainer.className = 'bee-content-container';

                // Create and add the bee image
                var beeImage = document.createElement('img');
                beeImage.src = 'bee.png';
                beeImage.className = 'bee-image';
                beeContentContainer.appendChild(beeImage);

                // Create and add the bee name
                var listItem = document.createElement('div');
                listItem.className = 'bee-list-item';
                listItem.textContent = beeName;
                beeContentContainer.appendChild(listItem);

                // Append the sub-container to the main container
                listItemContainer.appendChild(beeContentContainer);

                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'ios-checkbox';
                checkbox.checked = beeEnabled;
                checkbox.id = 'checkbox-' + beeId;
                listItemContainer.appendChild(checkbox);

                // Event listener for checkbox
                checkbox.addEventListener('change', function() {
                    beesCollection.doc(beeId).update({ enabled: checkbox.checked }).then(() => {
                        refreshBeesList();
                    }).catch((error) => {
                        console.error("Error updating bee: ", error);
                    });
                });

                // Create and add the delete icon
                var deleteIcon = document.createElement('div');
                deleteIcon.className = 'delete-icon';
                deleteIcon.innerHTML = '&minus;';
                listItemContainer.appendChild(deleteIcon);

                // Event listener for delete icon
                deleteIcon.addEventListener('click', function() {
                    beesCollection.doc(beeId).delete().then(() => {
                        refreshBeesList();
                    }).catch((error) => {
                        console.error("Error deleting bee: ", error);
                    });
                });

                beesListDiv.appendChild(listItemContainer);

                gsap.to(beeImage, {
                    duration: 0.2 + Math.random() * 0.3,
                    y: "+=" + (5 + Math.random() * 5),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
                if (beeEnabled) {
                    var beeListItem = document.createElement('div');
                    beeListItem.className = 'enabled-bee-item';
                    beeListItem.textContent = beeName;
                    enabledBeesList.appendChild(beeListItem);
                }
            });
        });
    }
    refreshBeesList();

    enableAllBeesButton.addEventListener('click', function() {
        beesCollection.get().then((querySnapshot) => {
            const updatePromises = [];
            querySnapshot.forEach((doc) => {
                const updatePromise = beesCollection.doc(doc.id).update({ enabled: true });
                updatePromises.push(updatePromise);
            });
            return Promise.all(updatePromises);
        }).then(() => {
            refreshBeesList();
        }).catch((error) => {
            console.error("Error enabling all bees: ", error);
        });
    });

    addBeeButton.addEventListener('click', function() {
        var newBeeName = newBeeNameInput.value.trim();
        if (newBeeName) {
            beesCollection.add({ name: newBeeName }).then(() => {
                newBeeNameInput.value = '';
                refreshBeesList();
                }).catch((error) => {
                console.error("Error adding bee: ", error);
            });
        }
    });

    // Dragging functionality
    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;

    dragItem.addEventListener("mousedown", dragStart, false);
    document.addEventListener("mouseup", dragEnd, false);
    document.addEventListener("mousemove", drag, false);

    btn.onclick = function() {
        modal.style.display = "block";
    };

    span.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    function dragStart(e) {
        if (e.type === "mousedown") {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === dragItem) {
                active = true;
            }
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        active = false;
    }

    function drag(e) {
        if (active) {
            e.preventDefault();
        
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, dragItem);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
});
