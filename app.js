var x = window.matchMedia("(max-width: 620px)");

var selectedRank = null; 
function selectRank(selectedButton, rank) {
    const buttons = document.querySelectorAll('.main__rank-button');
    buttons.forEach(button => {
        button.classList.remove('selected');  // Remove 'selected' class from all buttons
    });
    selectedButton.classList.add('selected');
    selectedRank = rank;
}

document.getElementById("draw").onclick = draw;

async function fetchEventRankings(eventNumbers, rank) {
    const responses = {}; 
    let eventsJson = await $.getJSON("https://sekai-world.github.io/sekai-master-db-tc-diff/events.json");
    console.log("Events db loaded successfully");
        
    for (const eventNumber of eventNumbers) {
        let eventStart = eventsJson.find(item => item.id === eventNumber).startAt;
        console.log(eventStart);

        // const url = `https://proxy.cors.sh/https://api.sekai.best/event/${eventNumber}/rankings/graph?region=tw&rank=${rank}`;
        // console.log(url)
        // const response = await fetch(url, {
        //     headers: {
        //     'x-cors-api-key': 'temp_15167b58c2ad394989c4398605ad4385'
        //     }
        // });
        const url = `https://cors.selinakwokhiulam.workers.dev/?https://api.sekai.best/event/${eventNumber}/rankings/graph?region=tw&rank=${rank}`;
        console.log(url)
        const response = await fetch(url);
        console.log(response.status);
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
        }
        try {
            var json = await response.json(); 
            json = json["data"]["eventRankings"];
            var timeScore = json.map(item => ({
                x: parseFloat(((Date.parse(item.timestamp) - eventStart)/1000/60/60).toFixed(1)),
                y: item.score
            })
            )
            //console.log(timeScore)
            responses[eventNumber] = timeScore
            console.log(`Event ${eventNumber} timeScore added to responses`)
        } catch (error) {
            console.error(`Failed to fetch data for event ${eventNumber}:`, error);
        }
    }
    return responses; 
}

async function draw() {
    console.log(selectedRank)
    const errorMsg = document.getElementById("main__error");
    const drawBtn = document.getElementById("draw");
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
        drawBtn.classList.add('loading');
        drawBtn.innerText = "Loading";

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

        try {
            const responses = await fetchEventRankings(eventNos, selectedRank);
            //console.log(responses);
    
            var graphData = [];
            for (const key in responses) {
                graphData.push({
                    name: key,
                    type: "line",
                    markerType: "none",
                    lineThickness: 1.2,
                    showInLegend: true,
                    dataPoints: responses[key]
                })
            }

            // PLot line graph
            var chart = new CanvasJS.Chart("main__canvas", {
                animationEnabled: true,
                axisX: {
                    title: "Hours from start",
                    titleFontSize: 11,
                    labelFontSize: 10,
                    includeZero: true,
                },
                axisY: {
                    title: "Event points",
                    includeZero: true,
                    titleFontSize: 11,
                    labelFontSize: 10,
                    valueFormatString: "#M,,.",
                },
                legend:{
                    fontSize: 11,
                },
                toolTip:{
                    shared: true,
                    contentFormatter: function(e){
                        var content =  "<strong>Hour " + e.entries[0].dataPoint.x + "</strong>";
                        for(var i = 0; i < e.entries.length; i++){
                            var entry = e.entries[i];
                            content += "</br>" + entry.dataSeries.name + ": " +  entry.dataPoint.y;
                        }
                        return content;
                    },
                },
                data: graphData
            });
            drawBtn.classList.remove('loading');
            drawBtn.innerText = "Draw";
            chart.render();
        }
        catch(e) {
            errorMsg.innerText = "Errored, please try again :("
            drawBtn.classList.remove('loading');
            drawBtn.innerText = "Draw";
            return
        }
    }
}
