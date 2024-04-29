var sendDataButton = document.getElementById("getStockData");
var addTickerButton = document.getElementById("addTicker");
var dropdownButton = document.querySelector('.collapsible');
var dropdownContent = document.querySelector('.content');
var currTicker = document.querySelector(".currTicker");
var parentList = document.getElementById('parentListTickers');

var dates = []
var histPricesData = []
var volumesData = []

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
function generateGraphs() {
    const ctx = document.getElementById('histPrices').getContext('2d');
    const ctx2 = document.getElementById('volumeChart').getContext('2d');

    if (Chart.getChart("histPrices")) {
        Chart.getChart("histPrices")?.destroy();
    }
    console.log(dates);
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: histPricesData
        },
        options: {
        }
    });

    if (Chart.getChart("volumeChart")) {
        Chart.getChart("volumeChart")?.destroy();
    }

    new Chart(ctx2, {
        type: 'line',
        data: {
            labels: dates,
            datasets: volumesData
        },
        options: {
        }
    });
}

//Get API Data
function getDataFromAPI() {
    var vals = [];
    var innerPs = document.querySelectorAll(".innerP");

    innerPs.forEach(function(innerPara) {
        vals.push(innerPara.textContent)
    });

    vals = [...new Set(vals)];
    const queryString = vals.map(vals => "ticker=" + vals).join('&');

    fetch('/get_stock_data/?' + queryString)
    .then(response => response.json())
    .then(data => {
        const closePrices = data.close_prices;
        const volumes = data.volumes_data;
        dates = data.dates;
        histPricesData = []
        volumesData = []
                
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

        generateGraphs();
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

    getDataFromAPI();
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

    getDataFromAPI();
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

addTickerButton.addEventListener("click", function() {
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

    getDataFromAPI();
})

Chart.defaults.plugins.tooltip.format = 'YYYY-MM-DD';
sendDataButton.addEventListener("click", getDataFromAPI);

//Bubble Menu
const bubbles = document.querySelectorAll('.bubble');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

let currentBubble = 0;

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

leftBtn.addEventListener('click', () => {
  currentBubble = (currentBubble - 1 + bubbles.length) % bubbles.length;
  updateActiveBubble();
});

rightBtn.addEventListener('click', () => {
  currentBubble = (currentBubble + 1) % bubbles.length;
  updateActiveBubble();
});

//Slider
var slider = document.getElementById("myRange");
var output = document.getElementById("slider-value");
function updatePercentage() {
    output.innerHTML = slider.value + "%";
}

updatePercentage();
slider.addEventListener("mouseup", updatePercentage);
