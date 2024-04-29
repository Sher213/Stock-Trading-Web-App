var sendDataButton = document.getElementById("getStockData");
var addTickerButton = document.getElementById("addTicker");
var dropdownButton = document.querySelector('.collapsible');
var dropdownContent = document.querySelector('.content');
var currTicker = document.querySelector(".currTicker");
var parentList = document.getElementById('parentListTickers');
const bubbles = document.querySelectorAll('.bubble');
const leftBubbleBtn = document.getElementById('left-btn');
const rightBubbleBtn = document.getElementById('right-btn');
var sliderCont = document.querySelector(".slider-container");
var slider = document.getElementById("myRange");
var sliderPercent = document.getElementById("slider-value");

var tickerSymbols = [];

var dates = []
var histPricesData = []
var volumesData = []

var currentBubble = 0;

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

//Make the Graphs
function generateGraphs(event) {
    const ctx = document.getElementById('histPrices').getContext('2d');
    const ctx2 = document.getElementById('volumeChart').getContext('2d');
    if (!(event.target === leftBubbleBtn || event.target === rightBubbleBtn || event.target === slider)){
        if (Chart.getChart("histPrices")) {
            Chart.getChart("histPrices")?.destroy();
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: histPricesData
            },
            options: {
            }
        });
    }

    //Get the right amounts based on the slide value
    var slideDates = dates.slice(Math.round(dates.length * (slider.value / 100)), dates.length);
    var slidesVolumesData = JSON.parse(JSON.stringify(volumesData));
    if (event.target === slider) {
        for (let i = 0; i < volumesData.length; i++) {
            slidesVolumesData[i]['data'] = volumesData[i]['data'].slice(Math.round(volumesData[i]['data'].length * (slider.value / 100)), volumesData[i]['data'].length);
        }
    }

    if (currentBubble == 0) {
        sliderCont.style.opacity = 1;
        if (Chart.getChart("volumeChart")) {
            Chart.getChart("volumeChart")?.destroy();
        }

        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: slideDates,
                datasets: slidesVolumesData
            }
        });
    }
    else if (currentBubble == 1) {
        sliderCont.style.opacity = 0;
        if (Chart.getChart("volumeChart")) {
            Chart.getChart("volumeChart")?.destroy();
        }
        
        const lastVolumes = []
        const backgroundColor = []
        for (let i = 0; i < volumesData.length; i++) {
            const randRGB1 = Math.floor(Math.random() * (256))
            const randRGB2 = Math.floor(Math.random() * (256))

            lastVolumes.push(volumesData[i]['data'][volumesData[i]['data'].length-1]);
            backgroundColor.push(`rgb(${randRGB1}, ${randRGB2}, 192)`)
        }

        new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: tickerSymbols,
                datasets: [{
                label: "Volumes ($)",
                data: lastVolumes,
                hoverOffset: 4
                }]
            }
        });
    }
    else if (currentBubble == 2) {
        sliderCont.style.opacity = 0;
        if (Chart.getChart("volumeChart")) {
            Chart.getChart("volumeChart")?.destroy();
        }
        
        const lastVolumes = []
        const backgroundColor = []
        for (let i = 0; i < volumesData.length; i++) {
            const randRGB1 = Math.floor(Math.random() * (256))
            const randRGB2 = Math.floor(Math.random() * (256))

            lastVolumes.push(volumesData[i]['data'][volumesData[i]['data'].length-1]);
            backgroundColor.push(`rgb(${randRGB1}, ${randRGB2}, 192)`)
        }

        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: tickerSymbols,
                datasets: [{
                label: "Volumes ($)",
                data: lastVolumes,
                hoverOffset: 4
                }]
            }
        });
    }
    else {
        sliderCont.style.opacity = 0;
        if (Chart.getChart("volumeChart")) {
            Chart.getChart("volumeChart")?.destroy();
        }
    }
}

//Get API Data
function getDataFromAPI(event) {
    var innerPs = document.querySelectorAll(".innerP");

    innerPs.forEach(function(innerPara) {
        tickerSymbols.push(innerPara.textContent)
    });

    tickerSymbols = [...new Set(tickerSymbols)];
    const queryString = tickerSymbols.map(vals => "ticker=" + vals).join('&');

    fetch('/get_stock_data/?' + queryString)
    .then(response => response.json())
    .then(data => {
        const closePrices = data.close_prices;
        const volumes = data.volumes_data;
        dates = data.dates;
        histPricesData = [];
        volumesData = [];
        for (let i = 0; i < closePrices.length; i++) {
            const randRGB1 = Math.floor(Math.random() * (256))
            const randRGB2 = Math.floor(Math.random() * (256))

            histPricesData.push({
                label: innerPs[i].textContent,
                data: closePrices[i],
                borderColor: `rgb(${randRGB1}, ${randRGB2}, 192)`,
                tension: 0.1
            });
        }

        for (let i = 0; i < volumes.length; i++) {
            const randRGB1 = Math.floor(Math.random() * (256))
            const randRGB2 = Math.floor(Math.random() * (256))

            volumesData.push({
                label: innerPs[i].textContent,
                data: volumes[i],
                borderColor: `rgb(${randRGB1}, ${randRGB2}, 192)`,
                tension: 0.1
            });
        }

        generateGraphs(event);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function cancelListItem(event) {
    const listItem = event.target.parentNode;
    parentList.removeChild(listItem);

    var val = currTicker.value;
    fetch('/update/user_tickers/?ticker=' + val, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
    })
    .then(response => response.json())
    .catch(error => console.error('Error fetching data:', error));

    getDataFromAPI(event);
}

function cancelListItem2(event) {
    const listItem = event.target.parentNode;
    const pItem = listItem.querySelector('p')
    var val = pItem.textContent;
    parentList.removeChild(listItem);

    fetch('/update/user_tickers/?ticker=' + val, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
    })
    .then(response => response.json())
    .catch(error => console.error('Error fetching data:', error));

    getDataFromAPI(event);
    }

dropdownButton.addEventListener("click", function() {
    dropdownContent.classList.toggle("active");
    if (dropdownContent.style.display === "block") {
        dropdownContent.style.display = "none";
    } else {
        dropdownContent.style.display = "block";
    }
});
        
var innerCancelButtons = document.querySelectorAll(".innerButton");
var innerPs = document.querySelectorAll(".innerP");
var innerLis = document.querySelectorAll(".innerLi");

innerCancelButtons.forEach(function(button) {
    button.addEventListener('click', cancelListItem2);
});

innerLis.forEach(function(li) {
    li.style.display = 'flex';
    li.style.alignItems = "center";
    li.style.paddingRight = "15px";
});

addTickerButton.addEventListener("click", function(event) {
    var val = currTicker.value;

    //get all current values added to the list of tickers and only add to list if not already in it
    var tickersList = []
    var innerPs = document.querySelectorAll(".innerP");
    innerPs.forEach(function(innerPara) {
        tickersList.push(innerPara.textContent)
    });
    if (tickersList.includes(val)) {
        return;
    }

    const newLi = document.createElement('li');
    const newP = document.createElement('p');

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', cancelListItem);

    newLi.style.display = 'flex';
    newLi.style.alignItems = "center";
    newP.style.paddingRight = "15px";

    newP.textContent = val;
    newP.className = "innerP";
    newLi.appendChild(newP);
    newLi.appendChild(cancelButton);

    parentList.append(newLi);

    fetch('/update/user_tickers/?ticker=' + val, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
    })
    .then(response => response.json())
    .catch(error => console.error('Error fetching data:', error));

    getDataFromAPI(event);
})

Chart.defaults.plugins.tooltip.format = 'YYYY-MM-DD';
sendDataButton.addEventListener("click", getDataFromAPI);

//Bubble Menu
function updateActiveBubble() {
  bubbles.forEach((bubble, index) => {
    if (index === currentBubble) {
      bubble.style.backgroundColor = '#4caf50';
    } else {
      bubble.style.backgroundColor = '#d3d3d3';
    }
  });
}

updateActiveBubble();

leftBubbleBtn.addEventListener('click', (event) => {
  currentBubble = (currentBubble - 1 + bubbles.length) % bubbles.length;
  updateActiveBubble();
  generateGraphs(event);
});

rightBubbleBtn.addEventListener('click', (event) => {
  currentBubble = (currentBubble + 1) % bubbles.length;
  updateActiveBubble();
  generateGraphs(event);
});

//Slider
function updatePercentage(event) {
    sliderPercent.innerHTML = (100 - slider.value) + "%";
    if (event){
        generateGraphs(event);
    }
}

updatePercentage();
slider.addEventListener("mouseup", updatePercentage);
