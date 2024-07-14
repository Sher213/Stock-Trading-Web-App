var sendDataButton = document.getElementById("getStockData");
var addTickerButton = document.getElementById("addTicker");
var dropdownButton = document.querySelector('.collapsible');
var dropdownContent = document.querySelector('.content');
var currTicker = document.querySelector(".currTicker");
var parentList = document.getElementById('parentListTickers');
var infoCont = document.querySelector(".info-container");
var infoUl = document.querySelector(".stocks-info-list");
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
        infoCont.style.opacity = 0;
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
        infoCont.style.opacity = 0;
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
        infoCont.style.opacity = 0;
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
    else if (currentBubble == 3) {
        sliderCont.style.opacity = 0;
        infoCont.style.opacity = 1;
        if (Chart.getChart("volumeChart")) {
            Chart.getChart("volumeChart")?.destroy();
        }
    }
}

// Function to create the info section
function createAboutSection(data) {
    const container = document.createElement('div');

    const aboutsHeading = document.createElement('h3');
    aboutsHeading.textContent = 'About';
    container.appendChild(aboutsHeading);

    // Create and append the snippet paragraph
    const snippetPara = document.createElement('p');
    snippetPara.textContent = data.snippet;
    container.appendChild(snippetPara);

    // Create and append the link to Wikipedia
    const linkPara = document.createElement('p');
    const link = document.createElement('a');
    link.href = data.link;
    link.textContent = data.link_text;
    link.target = '_blank';
    linkPara.appendChild(link);
    container.appendChild(linkPara);

    // Create and append the info items
    console.log(data[0].info);
    data[0].info.forEach(item => {
        const infoPara = document.createElement('p');
        if (item.link) {
            const infoLink = document.createElement('a');
            infoLink.href = item.link;
            infoLink.textContent = `${item.label}: ${item.value}`;
            infoLink.target = '_blank';
            infoPara.appendChild(infoLink);
        } else {
            infoPara.textContent = `${item.label}: ${item.value}`;
        }
        container.appendChild(infoPara);
    });

    return container;
}

// Function to create the stats section
function createStatsSection(data) {
    // Get the container element
    const container = document.createElement('div');

    const statsHeading = document.createElement('h3');
    statsHeading.textContent = 'Stats';
    container.appendChild(statsHeading);

    // Iterate over the data array and create elements for each item
    data.forEach(item => {
        // Create the container for each info item
        const infoItem = document.createElement('div');
        infoItem.classList.add('info-item');

        // Create and append the label
        const labelHeading = document.createElement('h3');
        labelHeading.textContent = item.label || 'No label available';
        infoItem.appendChild(labelHeading);

        // Create and append the description
        const descriptionPara = document.createElement('p');
        descriptionPara.textContent = item.description || 'No description available';
        infoItem.appendChild(descriptionPara);

        // Create and append the value
        const valuePara = document.createElement('p');
        valuePara.textContent = item.value || 'No value available';
        infoItem.appendChild(valuePara);

        // Append the info item to the container
        container.appendChild(infoItem);
    });

    return container;
}

// Function to create the news section
function createNewsSection(data) {
    // Get the container element
    const container = document.createElement('div');
    
    const newsHeading = document.createElement('h3');
    newsHeading.textContent = 'News';
    container.appendChild(newsHeading);

    // Iterate over the data array and create elements for each item
    data.forEach(item => {
        // Create the container for each news item
        const infoItem = document.createElement('div');
        infoItem.classList.add('info-item');

        // Create and append the thumbnail
        const thumbnail = document.createElement('img');
        thumbnail.src = item.thumbnail || '';
        thumbnail.alt = item.source || 'Thumbnail';
        infoItem.appendChild(thumbnail);

        // Create and append the content container
        const content = document.createElement('div');

        // Create and append the snippet
        const snippetPara = document.createElement('p');
        snippetPara.textContent = item.snippet || 'No snippet available.';
        content.appendChild(snippetPara);

        // Create and append the link
        const linkPara = document.createElement('p');
        const link = document.createElement('a');
        link.href = item.link || '#';
        link.textContent = item.source || 'Source';
        link.target = '_blank';
        linkPara.appendChild(link);
        content.appendChild(linkPara);

        // Create and append the date
        const datePara = document.createElement('p');
        datePara.textContent = item.date || 'No date available.';
        content.appendChild(datePara);

        // Append the content to the info item
        infoItem.appendChild(content);

        // Append the info item to the container
        container.appendChild(infoItem);
    });

    return container;
}

//Get Google Finance API Data
function getDataFromGFinanceAPI(event) {
    const queryString = tickerSymbols.map(vals => "ticker=" + vals).join('&');

    fetch('/get_stock_news/?' + queryString)
    .then(response => response.json())
    .then(data => {
        const newsResults = data.news_results;
        const stats = data.stats;
        const abouts = data.abouts;
        console.log(stats);
        for (let i = 0; i < stats.length; i++) {
            // Create new list item
            const newListItem = document.createElement('li');
            newListItem.className = 'stocks-info-item';

            const ticketTitle = document.createElement('h1');
            ticketTitle.textContent = tickerSymbols[i];

            // Create news container
            newsContainer = createNewsSection(newsResults[i]);

            // Create stats container
            statsContainer = createStatsSection(stats[i])

            // Create about container
            console.log(abouts[i][0].info);
            aboutsContainer = createAboutSection(abouts[i]);

            // Append containers to list item
            newListItem.appendChild(ticketTitle)
            newListItem.appendChild(newsContainer);
            newListItem.appendChild(statsContainer);
            newListItem.appendChild(aboutsContainer);

            // Append new list item to the list
            infoUl.appendChild(newListItem);
            console.log("CLEAR");
        }
    })
}

//Get yFinance API Data
function getDataFromYFinanceAPI(event) {
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
        getDataFromGFinanceAPI(event);
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

    getDataFromYFinanceAPI(event);
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

    getDataFromYFinanceAPI(event);
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

    getDataFromYFinanceAPI(event);
})

Chart.defaults.plugins.tooltip.format = 'YYYY-MM-DD';
sendDataButton.addEventListener("click", getDataFromYFinanceAPI);

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
