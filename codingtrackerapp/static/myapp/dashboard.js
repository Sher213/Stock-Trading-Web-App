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

const yFinanceKey = 'yFinanceData';
const gFinanceKey = 'gFinanceData';

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

function createAboutSection(data) {
    const container = document.createElement('div');
    container.classList.add('about-section'); // Add the about-section class
    container.id = 'about-section'; // Add the about-section ID

    const aboutsHeading = document.createElement('h3');
    aboutsHeading.textContent = 'About';
    container.appendChild(aboutsHeading);

    // Create and append the snippet paragraph
    const snippetPara = document.createElement('p');
    snippetPara.textContent = data.snippet;
    container.appendChild(snippetPara);

    if (data[0].title == "No About Available.") {
        snippetPara.textContent = "No About Available.";
        return container;
    }

    // Create and append the link to Wikipedia
    const linkPara = document.createElement('p');
    const link = document.createElement('a');
    link.href = data.link;
    link.textContent = data.link_text;
    link.target = '_blank';
    linkPara.appendChild(link);
    container.appendChild(linkPara);

    // Create and append the info items
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
    const container = document.createElement('div');
    container.classList.add('stats-section'); // Add the stats-section class
    container.id = 'stats-section'; // Add the stats-section ID

    const statsHeading = document.createElement('h3');
    statsHeading.textContent = 'Stats';
    container.appendChild(statsHeading);

    if (data[0].title == "No Stats Available.") {
        const descriptionPara = document.createElement('p');
        descriptionPara.textContent = 'No Stats Available';
        container.appendChild(descriptionPara);
        return container;
    }

    // Iterate over the data array and create elements for each item
    data.forEach(item => {
        // Create the container for each info item
        const infoItem = document.createElement('div');
        infoItem.classList.add('info-item'); // Add the info-item class

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
    const container = document.createElement('div');
    container.classList.add('news-section'); // Add the news-section class
    container.id = 'news-section'; // Add the news-section ID

    const newsHeading = document.createElement('h3');
    newsHeading.textContent = 'News';
    container.appendChild(newsHeading);

    if (data[0].title == "No News Available.") {
        const descriptionPara = document.createElement('p');
        descriptionPara.textContent = 'No News Available';
        container.appendChild(descriptionPara);
        return container;
    }

    // Iterate over the data array and create elements for each item
    data.forEach(item => {
        // Create the container for each news item
        const infoItem = document.createElement('div');
        infoItem.classList.add('info-item'); // Add the info-item class

        // Create and append the thumbnail
        const thumbnail = document.createElement('img');
        thumbnail.src = item.thumbnail || '';
        thumbnail.alt = item.source || 'Thumbnail';
        infoItem.appendChild(thumbnail);

        // Create and append the content container
        const content = document.createElement('div');
        content.classList.add('content'); // Add the content class

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
        datePara.classList.add('date'); // Add the date class
        content.appendChild(datePara);

        // Append the content to the info item
        infoItem.appendChild(content);

        // Append the info item to the container
        container.appendChild(infoItem);
    });

    return container;
}

// Save data to localStorage
function saveDataToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load data from localStorage
function loadDataFromLocalStorage(key) {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : null;
}

// Process and display the data from both APIs, and generate graphs
function processData(data, key, event) {
    var innerPs = document.querySelectorAll(".innerP");
    if (key === 'yFinanceData') {
        const closePrices = data.close_prices;
        const volumes = data.volumes_data;
        dates = data.dates;

        // Process historical prices and volumes (YFinance)
        histPricesData = [];
        volumesData = [];

        for (let i = 0; i < innerPs.length; i++) {
            const randRGB1 = Math.floor(Math.random() * 256);
            const randRGB2 = Math.floor(Math.random() * 256);

            histPricesData.push({
                label: innerPs[i].textContent,
                data: closePrices[i],
                borderColor: `rgb(${randRGB1}, ${randRGB2}, 192)`,
                tension: 0.1
            });
        }

        for (let i = 0; i < innerPs.length; i++) {
            const randRGB1 = Math.floor(Math.random() * 256);
            const randRGB2 = Math.floor(Math.random() * 256);

            volumesData.push({
                label: innerPs[i].textContent,
                data: volumes[i],
                borderColor: `rgb(${randRGB1}, ${randRGB2}, 192)`,
                tension: 0.1
            });
        }

        // Generate graphs after processing data
        generateGraphs(event);
    }
    else if (key === 'gFinanceData') {
        const newsResults = data.news_results;
        const stats = data.stats;
        const abouts = data.abouts;
        
        // Process and display the data (GFinance)
        for (let i = 0; i < innerPs.length; i++) {
            const newListItem = document.createElement('li');
            newListItem.className = 'stocks-info-item';

            const ticketTitle = document.createElement('h1');
            ticketTitle.textContent = tickerSymbols[i];

            const newsContainer = createNewsSection(newsResults[i]);
            const statsContainer = createStatsSection(stats[i]);
            const aboutsContainer = createAboutSection(abouts[i]);

            newListItem.appendChild(ticketTitle);
            newListItem.appendChild(newsContainer);
            newListItem.appendChild(statsContainer);
            newListItem.appendChild(aboutsContainer);

            infoUl.appendChild(newListItem);
        }
    }
}

// Combined function to fetch data from both YFinance and GFinance APIs
function getDataFromAPIs(event) {
    var innerPs = document.querySelectorAll(".innerP");
    tickerSymbols = [];

    innerPs.forEach(function(innerPara) {
        tickerSymbols.push(innerPara.textContent);
    });

    tickerSymbols = [...new Set(tickerSymbols)];

    // Load YFinance data from localStorage if available
    const savedYFinanceData = loadDataFromLocalStorage(yFinanceKey);

    if (savedYFinanceData) {
        // Process YFinance data if found
        processData(savedYFinanceData, yFinanceKey, event);
        // Fetch GFinance data
        getDataFromGFinanceAPI(event, gFinanceKey);
    } else {
        // Fetch YFinance data if not found in localStorage
        const yFinanceQueryString = tickerSymbols.map(vals => "ticker=" + vals).join('&');

        fetch('/get_stock_data/?' + yFinanceQueryString)
        .then(response => response.json())
        .then(data => {
            // Fetch GFinance data
            getDataFromGFinanceAPI(event, gFinanceKey);
            // Save and process YFinance data
            saveDataToLocalStorage(yFinanceKey, data);
            processData(data, yFinanceKey, event);
        })
        .catch(error => console.error('Error fetching YFinance data:', error));
    }

}

// Fetch GFinance data with localStorage support
function getDataFromGFinanceAPI(event, key) {
    var innerPs = document.querySelectorAll(".innerP");
    tickerSymbols = [];

    innerPs.forEach(function(innerPara) {
        tickerSymbols.push(innerPara.textContent);
    });

    tickerSymbols = [...new Set(tickerSymbols)];

    const savedGFinanceData = loadDataFromLocalStorage(key);

    if (savedGFinanceData) {
        // Process GFinance data if found
        processData(savedGFinanceData, gFinanceKey, event);
    } else {
        const queryString = tickerSymbols.map(vals => "ticker=" + vals).join('&');

        fetch('/get_stock_news/?' + queryString)
        .then(response => response.json())
        .then(data => {
            // Save and process GFinance data
            saveDataToLocalStorage(key, data);
            processData(data, gFinanceKey, event);
        })
        .catch(error => console.error('Error fetching GFinance data:', error));
    }
}

// Function to clear all saved data from localStorage
function clearAllLocalStorage() {
    localStorage.removeItem('yFinanceData');
    localStorage.removeItem('gFinanceData');
}

function clearNewsFeed() {
    // Select the element with the class name 'stocks-info-list'
    const stocksInfoList = document.querySelector('.stocks-info-list');

    // Check if the element exists
    if (stocksInfoList) {
        // Remove all child elements
        while (stocksInfoList.firstChild) {
            stocksInfoList.removeChild(stocksInfoList.firstChild);
        }
    }
}

// Example of how to trigger data fetching with a refresh button
function onPageLoad(event) {
    getDataFromAPIs(event);
}

// Call onPageLoad function on window load
window.onload = onPageLoad;

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

    clearAllLocalStorage();
    clearNewsFeed();
    getDataFromAPIs(event);
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

    clearAllLocalStorage();
    clearNewsFeed();
    getDataFromAPIs(event);
}

        
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
    newLi.className = "innerLi";
    const newP = document.createElement('p');

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', cancelListItem);
    cancelButton.className = 'innerButton';

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

    clearAllLocalStorage();
    clearNewsFeed();
    getDataFromAPIs(event);
})

//Bubble Menu
function updateActiveBubble() {
  bubbles.forEach((bubble, index) => {
    if (index === currentBubble) {
      bubble.style.backgroundColor = '#024188';
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
