document.getElementById("spinButton").addEventListener("click", function() {
    var names = ["Fared", "Barry", "Martin"];
    var index = Math.floor(Math.random() * names.length);
    document.getElementById("result").innerHTML = "The wheel picks: " + names[index];
});
