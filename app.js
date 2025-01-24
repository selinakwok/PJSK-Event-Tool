var x = window.matchMedia("(max-width: 620px)");

var selectedRank = null; 
function selectRank(selectedButton, rank) {
    // Remove 'selected' class from all buttons
    const buttons = document.querySelectorAll('.main__rank-button');
    buttons.forEach(button => {
        button.classList.remove('selected');
    });
    
    selectedButton.classList.add('selected');
    selectedRank = rank;
}

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

document.getElementById("draw").onclick = draw;

async function fetchEventRankings(eventNumbers, rank) {
    const responses = []; 

    for (const eventNumber of eventNumbers) {
        const url = `https://api.sekai.best/event/${eventNumber}/rankings/graph?region=tw&rank=${rank}`;
        console.log(url)
        const response = await fetch(url);
        console.log(response.status);
        
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
        }
        try {
            const json = await response.json(); 
            console.log(json)
            responses.push(json); 
        } catch (error) {
            console.error(`Failed to fetch data for event ${eventNumber}:`, error);
        }
    }
    return responses; 
}

async function draw() {
    console.log(selectedRank)
    const errorMsg = document.getElementById("main__error");
    if (selectedRank === null) {
        errorMsg.innerText = "Rank not selected";
        return
    }

    var input = document.getElementById('txtbox').value;
    const txtbox = document.getElementById('txtbox');
    input = input.replace(/\s+/g, '');

    const regex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
    if (!regex.test(input)) {
        txtbox.classList.add('error');
        errorMsg.innerText = "Must be comma-separated numbers or ranges of numbers\neg. 36\neg. 45, 46, 48\neg. 41, 60, 117-119"
        // if (x.matches) {
        //     document.getElementsByClassName("main__error")[0].style.marginBottom = "3rem";
        // }
        return
    }
    else {
        txtbox.classList.remove('error');
        errorMsg.innerText = "";

        var events = input.split(',')
        const eventNos = [];
        events.forEach(part => {
            if (part.includes('-')) {
                const rangeParts = part.split('-');
                const start = parseInt(rangeParts[0]); 
                const end = parseInt(rangeParts[1]); 

                for (let i = start; i <= end; i++) {
                    eventNos.push(i);
                }
    
            } else {
                const number = parseInt(part);
                eventNos.push(number);
            }
        });
        console.log(eventNos);

        const responses = await fetchEventRankings(eventNos, selectedRank);
        console.log("Fetched Responses:", responses);
    }
}