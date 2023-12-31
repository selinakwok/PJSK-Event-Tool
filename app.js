var x = window.matchMedia("(max-width: 620px)");

document.getElementById("predict").onclick = predict;

var xhr = null;
getXmlHttpRequestObject = function () {
    if (!xhr) {
        // Create a new XMLHttpRequest object 
        xhr = new XMLHttpRequest();
    }
    return xhr;
};

function sendDataCallback() {
    // Check response is ready or not
    if (xhr.readyState == 4 && xhr.status == 201) {
        console.log("Data creation response received!");
        alert(xhr.responseText);
    }
}

function predict() {
    const ranks = [100, 200, 300, 400, 500, 1000, 2000, 3000, 4000, 5000, 10000];
    var rank;
    rank = parseInt(document.getElementById("txtbox").value);
    if (!ranks.includes(rank)) {
        document.getElementById("main__error").style.display = "block"; 
        if (x.matches) {
            document.getElementsByClassName("main__input")[0].style.marginBottom = "1rem";
        }
        return
    }
    else {
        if (document.getElementById("main__error").style.display == "block") {
            document.getElementById("main__error").style.display = "none"; 
            if (x.matches) {
                document.getElementsByClassName("main__input")[0].style.marginBottom = "3rem";
            }
        }

        xhr = getXmlHttpRequestObject();
        xhr.onreadystatechange = sendDataCallback;
        xhr.open("POST", "http://localhost:8000/predict", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify({"rank": rank}));
    }
}