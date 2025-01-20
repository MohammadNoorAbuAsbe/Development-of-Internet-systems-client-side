/////////////////////////////////////////////////////////////////////////////////////////////////////
//#region Initialization and Global Variables 
const tbody = document.getElementById("flightsBody");
const findLateAirlineBtn = document.getElementById("findLateAirlineBtn");
const flightDetailsDiv = document.getElementById("flightDetails");
const modalBackground = document.getElementById("modalBackground");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const filterFlightsBtn = document.getElementById("filterFlightsBtn");
const btnAggregatedData = document.getElementById("btnAggregatedData");
const aggregatedData = document.getElementById("aggregatedData");
const btnLateAirline = document.getElementById("btnLateAirline");
const lateAirlineInfo = document.getElementById("lateAirlineInfo");
const closeButton = document.getElementById("closeButton");
const numberInp = document.getElementById("searchNumber");
const startDateInp = document.getElementById("searchDateStart");
const endDateInp = document.getElementById("searchDateEnd");
const typeInp = document.getElementById("searchType");
const countryInp = document.getElementById("searchCountry");
const cityInp = document.getElementById("searchCity");
const flightDetailTemplate = document.getElementById('flightDetailTemplate');
const lateAirlineText = document.getElementById("lateAirlineText");
const clock = document.getElementById('clockDisplay');
//#endregion 

/////////////////////////////////////////////////////////////////////////////////////////////////////
//#region Utility Functions
/**
* Adds an event listener to the specified element.
*
* @param {HTMLElement} element - The element to add the event listener to.
* @param {string} eventType - The type of event to listen for.
* @param {function} handler - The function to be executed when the event is triggered.
* @returns {void}
*/
function addEventListenerToElement(element, eventType, handler) {
    if (element) {
        element.addEventListener(eventType, handler);
    }
}

/**
* Determines whether a given number is prime.
*
* @param {number} num - The number to check for primality.
* @returns {boolean} - True if the number is prime, false otherwise.
*/
function isPrime(num) {
    if (num <= 1) return false; // numbers less than or equal to 1 are not prime numbers
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) return false;
    }
    return true;

}

/**
* Shows the specified element by removing the 'hidden' class.
* 
* @param {HTMLElement} element - The element to be shown.
* @returns {void}
*/
function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

/**
* Hides the specified element by adding the 'hidden' class to it.
* 
* @param {HTMLElement} element - The element to hide.
* @returns {void}
*/
function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

/**
* Updates the clock display with the current time.
* 
* This function retrieves the current time and formats it as a string in the format "HH:MM:SS".
* It then updates the text content of the clock element with the formatted time string.
* 
* @returns {void}
*/
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    clock.textContent = timeString;
}

/**
* Updates the counter for a specific key in an object.
*
* @param {Object} obj - The object to update the counter in.
* @param {string} key - The key to update the counter for.
* @returns {void}
*/
function updateObjectCounter(obj, key) {
    obj[key] = (obj[key] || 0) + 1;
}
//#endregion 

/////////////////////////////////////////////////////////////////////////////////////////////////////
//#region Data Manipulation and Filtering
/**
* Populates the table with flight data.
*
* @param {Array} flights - An array of flight objects.
* @returns {void}
*/
function populateTable(flights) {
    tbody.innerHTML = ""; // Clear existing rows from tbody
    flights.forEach(flight => {
        let row = tbody.insertRow();
        let details = getFlightTypeDetails(flight['type']);
        let flightTypeClass = `flight-type-${flight['type']}` || 'flight-type-default';
        row.classList.add(flightTypeClass);

        let importantFields = ['operatorShort', 'number', 'schedueTime', 'actualTime', 'type', 'city', 'airport', 'status', 'country'];
        importantFields.forEach((field, index) => {
            let cell = row.insertCell();
            if (field === 'type') {
                cell.innerHTML = `${details.icon} ${details.text}`; // Use both icon and text
            } else if (field === 'schedueTime' || field === 'actualTime') {
                let date = new Date(flight[field]);
                cell.textContent = date.toLocaleString();
            } else {
                cell.textContent = flight[field];
            }

            // Check if the current cell is for the flight number
            if (field === 'number') {
                // Change cursor to indicate clickable only if the number is prime
                if (isPrime(parseInt(flight[field], 10))) {
                    cell.style.cursor = 'pointer';
                    addEventListenerToElement(cell, 'click', function () {
                        window.open(`https://prime-numbers.fandom.com/wiki/${flight[field]}`, '_blank');
                    });
                }
            }
        });

        if (flight['schedueTime'] !== flight['actualTime']) {
            row.classList.add('schedule-discrepancy');
            // Add a tooltip to rows with a schedule discrepancy
            row.title = "טיסה זו חוותה עיכוב.";
        }

        addEventListenerToElement(row, 'mouseenter', function () {
            this.classList.add('row-hover');
        });

        addEventListenerToElement(row, 'mouseleave', function () {
            this.classList.remove('row-hover');
            if (flight['schedueTime'] !== flight['actualTime']) {
                this.classList.add('schedule-discrepancy');
            } else {
                this.classList.remove('schedule-discrepancy');
            }
        });

        // Add click event listener to each row
        addEventListenerToElement(row, 'click', function () {
            // Show the DIV
            flightDetailsDiv.innerHTML = ''; // Clear existing content
            flightDetailsDiv.appendChild(populateFlightDetails(flight)); // Append new content
            // Inside the row click event listener, after making flightDetailsDiv visible
            flightDetailsDiv.classList.add('highlight-active');

            // Smoothly scroll to the flightDetailsDiv
            flightDetailsDiv.scrollIntoView({ behavior: 'smooth' });
            showElement(modalBackground);
            showElement(flightDetailsDiv);
        });
    });
}

/**
* Returns the flight type details based on the given type.
*
* @param {string} type - The type of the flight.
* @returns {Object} - An object containing the flight type details.
*                    - The object has two properties: icon and text.
*                    - The icon property represents the icon for the flight type.
*                    - The text property represents the text label for the flight type.
*                    - If the type is 'D', the icon will be '✈️' and the text will be 'Departing'.
*                    - If the type is 'A', the icon will be '🛬' and the text will be 'Arriving'.
*                    - If the type is neither 'D' nor 'A', the icon will be '❓' and the text will be 'Unknown'.
*/
function getFlightTypeDetails(type) {
    let details = { icon: '', text: '' };
    switch (type) {
        case 'D': // Representing take-off
            details.icon = '✈️';
            details.text = 'Departing'; // Text label for Departing
            break;
        case 'A': // Representing landing
            details.icon = '🛬';
            details.text = 'Arriving'; // Text label for Arriving
            break;
        default:
            details.icon = '❓';
            details.text = 'Unknown'; // Default text label
    }
    return details;
}

/**
* Filters flights based on the provided criteria and updates the table and dashboard accordingly.
* 
* @returns {void}
*/
function filterFlights() {
    const number = numberInp.value;
    const startDate = startDateInp.value;
    const endDate = endDateInp.value;
    const type = typeInp.value.toUpperCase();
    const country = countryInp.value.toLowerCase();
    const city = cityInp.value.toLowerCase();

    const filteredFlights = jsonFlights.filter(flight => {
        const flightDate = new Date(flight.schedueTime);
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;
        // Adjust flightDate and startDateObj to start of day for comparison
        flightDate.setHours(0, 0, 0, 0);
        if (startDateObj) startDateObj.setHours(0, 0, 0, 0);
        if (endDateObj) endDateObj.setHours(23, 59, 59, 999); // Set to end of day for endDate comparison
        return (!number || flight.number.toString().includes(number)) &&
            (!startDate || flightDate >= startDateObj) &&
            (!endDate || flightDate <= endDateObj) &&
            (!type || flight.type === type) &&
            (!country || flight.country.toLowerCase().includes(country)) &&
            (!city || flight.city.toLowerCase().includes(city));
    });
    populateTable(filteredFlights);

    // Re-calculate aggregated data based on filtered flights
    const aggregatedData = aggregateFlightData(filteredFlights);

    // Update the dashboard with the new aggregated data
    displayAggregatedData(aggregatedData);
}

/**
* Calculates aggregated flight data based on the given flights.
*
* @param {Array} flights - An array of flight objects.
* @returns {Object} - An object containing aggregated flight data.
*
* @example
* const flights = [
*   { operatorLong: 'Airline A', actualTime: '2021-01-01T10:00:00', schedueTime: '2021-01-01T09:30:00', type: 'Type A', country: 'Country A' },
*   { operatorLong: 'Airline B', actualTime: '2021-01-01T11:00:00', schedueTime: '2021-01-01T10:30:00', type: 'Type B', country: 'Country B' },
*   { operatorLong: 'Airline A', actualTime: '2021-01-01T12:00:00', schedueTime: '2021-01-01T11:30:00', type: 'Type A', country: 'Country C' },
* ];
*
* const aggregatedData = aggregateFlightData(flights);
* console.log(aggregatedData);
* // Output:
* // {
* //   flightCountsPerAirline: { 'Airline A': 2, 'Airline B': 1 },
* //   averageDelayTimePerAirline: { 'Airline A': 1800000, 'Airline B': 0 },
* //   flightCountsByType: { 'Type A': 2, 'Type B': 1 },
* //   maxDelayPerAirline: { 'Airline A': 1800000, 'Airline B': 0 },
* //   countriesServedPerAirline: { 'Airline A': ['Country A', 'Country C'], 'Airline B': ['Country B'] }
* // }
*/
function aggregateFlightData(flights) {
    let flightCountsPerAirline = {};
    let averageDelayTimePerAirline = {};
    let flightCountsByType = {};
    let maxDelayPerAirline = {};
    let countriesServedPerAirline = {};

    flights.forEach(flight => {
        let airline = flight.operatorLong;
        let delayTime = new Date(flight.actualTime) - new Date(flight.schedueTime);

        // Flight counts per airline
        updateObjectCounter(flightCountsPerAirline, airline);

        // Average delay time per airline
        if (delayTime > 0) { // If there's a delay
            if (!averageDelayTimePerAirline[airline]) {
                averageDelayTimePerAirline[airline] = { totalDelay: 0, count: 0 };
            }
            averageDelayTimePerAirline[airline].totalDelay += delayTime;
            averageDelayTimePerAirline[airline].count += 1;
        }

        // Flight counts by type
        let type = flight.type;
        updateObjectCounter(flightCountsByType, type);

        // Maximum delay per airline
        if (!maxDelayPerAirline[airline] || delayTime > maxDelayPerAirline[airline]) {
            maxDelayPerAirline[airline] = delayTime;
        }

        // Countries served per airline
        let country = flight.country;
        if (!countriesServedPerAirline[airline]) {
            countriesServedPerAirline[airline] = new Set();
        }
        countriesServedPerAirline[airline].add(country);
    });

    // Convert Sets to Arrays for countriesServedPerAirline
    for (const airline in countriesServedPerAirline) {
        countriesServedPerAirline[airline] = Array.from(countriesServedPerAirline[airline]);
    }

    // Calculate average delay time
    for (const airline in averageDelayTimePerAirline) {
        let { totalDelay, count } = averageDelayTimePerAirline[airline];
        averageDelayTimePerAirline[airline] = totalDelay / count;
    }

    return {
        flightCountsPerAirline,
        averageDelayTimePerAirline,
        flightCountsByType,
        maxDelayPerAirline,
        countriesServedPerAirline,
    };
}
//#endregion 

/////////////////////////////////////////////////////////////////////////////////////////////////////
//#region Event Handlers

/**
* Scrolls the window to the top of the page with a smooth animation.
*/
const scrollToTopHandler = () => window.scrollTo({ top: 0, behavior: 'smooth' });
/**
* Scrolls the page to a specified element with smooth behavior.
*
* @param {Element} element - The element to scroll to.
* @returns {Function} - A function that scrolls the page to the specified element.
*/
const scrollToElementHandler = (element) => () => element.scrollIntoView({ behavior: 'smooth' });

/**
* Finds the airline with the most delays and updates the late airline info section.
* 
* This function iterates over the `jsonFlights` array and counts the number of delays for each airline.
* It then determines the airline with the highest number of delays and updates the late airline info section
* with the name of the airline and the number of delays.
* 
* @returns {void}
*/
function findMostLateAirline() {
    let airlineDelays = {}; // Object to store airlines and their delay counts

    jsonFlights.forEach(flight => {
        if (flight['schedueTime'] !== flight['actualTime']) {
            const airline = flight['operatorLong'];
            if (!airlineDelays[airline]) {
                airlineDelays[airline] = 1;
            } else {
                airlineDelays[airline]++;
            }
        }
    });

    let maxDelays = 0;
    let mostLateAirline = '';
    for (const airline in airlineDelays) {
        if (airlineDelays[airline] > maxDelays) {
            maxDelays = airlineDelays[airline];
            mostLateAirline = airline;
        }
    }

    // Update and show the late airline info section
    lateAirlineText.innerHTML = `חברת התעופה המאוחרת ביותר היא ${mostLateAirline} עם ${maxDelays} עיכובים.`;
    showElement(lateAirlineInfo);
    // After setting the innerHTML of lateAirlineText and making lateAirlineInfo visible
    lateAirlineInfo.classList.add('highlight-active');
    // Smoothly scroll to the lateAirlineInfo div
    lateAirlineInfo.scrollIntoView({ behavior: 'smooth' });
}
//#endregion 

/////////////////////////////////////////////////////////////////////////////////////////////////////
//#region UI Updates and Interactivity

/**
* Populates flight details in a template and returns the populated template.
* 
* @param {Object} flight - The flight object containing the flight details.
* @returns {Node} - The populated flight details template.
*/
function populateFlightDetails(flight) {
    const template = flightDetailTemplate.content.cloneNode(true);

    template.querySelector('.flight-number').textContent = flight.number;
    template.querySelector('.flight-status').textContent = flight.status;
    // Apply conditional styling based on flight status
    if (flight.status === 'On Time') {
        template.querySelector('.flight-status').classList.add('flight-status-on-time');
    } else {
        template.querySelector('.flight-status').classList.add('flight-status-delayed');
    }
    template.querySelector('.flight-sheduled').textContent = new Date(flight.schedueTime).toLocaleString();
    template.querySelector('.flight-actual').textContent = new Date(flight.actualTime).toLocaleString();
    template.querySelector('.flight-from').textContent = `${flight.city} (${flight.airport})`;
    template.querySelector('.flight-airline').textContent = flight.operatorLong;
    template.querySelector('.flight-country').textContent = flight.country;
    template.querySelector('.flight-city-code').textContent = flight.cityCode;
    template.querySelector('.flight-terminal').textContent = flight.terminal;
    template.querySelector('.flight-counter').textContent = flight.counter ? flight.counter : "אינו זמין";
    template.querySelector('.flight-zone').textContent = flight.zone ? flight.zone : "אינו זמין";

    // Close button functionality
    const closeButton = template.querySelector("#closeButton");
    addEventListenerToElement(closeButton, 'click', function () {
        flightDetailsDiv.classList.remove('highlight-active');
        hideElement(flightDetailsDiv);
        hideElement(modalBackground);
    });



    return template;
}

/**
* Displays aggregated data using Plotly charts.
*
* @param {Object} aggregatedData - The aggregated data object containing flight counts per airline, average delay time per airline, flight counts by type, max delay per airline, and countries served per airline.
* @returns {void}
*/
function displayAggregatedData(aggregatedData) {
    const commonPlotConfig = {
        plot_bgcolor: "#242424", // Dark background for the plot area
        paper_bgcolor: "#181818", // Dark background for the entire plot
        font: {
            color: "#d1d1d1", // Light text color for better contrast
            size: 14 // Default font size for chart titles and labels
        }
    };
    // Plot for Flight Counts Per Airline
    Plotly.newPlot('flightCountsPerAirline', [{
        x: Object.keys(aggregatedData.flightCountsPerAirline),
        y: Object.values(aggregatedData.flightCountsPerAirline),
        type: 'bar',
        hovertemplate: 'חֶברַת תְעוּפָה: %{x}<br>ספירת טיסות: %{y}<extra></extra>' // Custom hovertemplate
    }], {
        title: 'ספירת טיסות לכל חברת תעופה',
        ...commonPlotConfig // Spread operator to merge common config
    },
        { responsive: true });

    // Plot for Average Delay Time Per Airline
    Plotly.newPlot('averageDelayTimePerAirline', [{
        x: Object.keys(aggregatedData.averageDelayTimePerAirline),
        y: Object.values(aggregatedData.averageDelayTimePerAirline),
        type: 'scatter', // Use 'scatter' type for line charts
        mode: 'lines+markers', // Show both lines and markers
        hovertemplate: 'חֶברַת תְעוּפָה: %{x}<br>עיכוב: %{y} דקות<extra></extra>', // Custom template
        marker: {
            color: 'orange'
        }
    }], {
        title: 'זמן עיכוב ממוצע לכל חברת תעופה לאורך זמן',
        ...commonPlotConfig
    },
        { responsive: true });

    // Plot for Flight Counts By Type
    Plotly.newPlot('flightCountsByType', [{
        labels: Object.keys(aggregatedData.flightCountsByType),
        values: Object.values(aggregatedData.flightCountsByType),
        type: 'pie',
        hovertemplate: 'סוּג: %{label}<br>סְפִירָה: %{value}<extra></extra>' // Custom hovertemplate for pie chart
    }], {
        title: 'ספירת טיסות לפי סוג',
        ...commonPlotConfig
    },
        { responsive: true });

    // Plot for Max Delay Per Airline
    Plotly.newPlot('maxDelayPerAirline', [{
        x: Object.keys(aggregatedData.maxDelayPerAirline),
        y: Object.values(aggregatedData.maxDelayPerAirline).map(delay => delay / 3600000), // Convert milliseconds to hours
        type: 'bar',
        marker: {
            color: 'red'
        },
        hovertemplate: 'חֶברַת תְעוּפָה: %{x}<br>עיכוב מקסימלי: %{y} שעות<extra></extra>' // Custom hovertemplate
    }], {
        title: 'איחור מקסימלי לכל חברת תעופה',
        ...commonPlotConfig
    },
        { responsive: true });
    // Plot for Countries Served Per Airline
    Plotly.newPlot('countriesServedPerAirline', [{
        x: Object.keys(aggregatedData.countriesServedPerAirline),
        y: Object.values(aggregatedData.countriesServedPerAirline).map(countries => countries.length),
        type: 'bar',
        marker: {
            color: 'green'
        },
        hovertemplate: 'חֶברַת תְעוּפָה: %{x}<br>מדינות המוגשות: %{y}<extra></extra>' // Custom hovertemplate
    }], {
        title: 'מדינות המוגשות לפי חברת תעופה',
        ...commonPlotConfig
    },
        { responsive: true });
}
//#endregion 

/////////////////////////////////////////////////////////////////////////////////////////////////////
//#region Initialization and Event Binding

/**
* This code snippet initializes and sets up various event listeners and functions for a web page.
* It populates a table with flight data, updates a clock every second, adds a sticky navigation bar,
* and handles the functionality for finding the most late airline. It also includes functions for
* filtering flights, aggregating flight data, and scrolling to specific elements on the page.
* The code snippet demonstrates the usage of event listeners, DOM manipulation, and basic JavaScript
* functions and logic.
*/
populateTable(jsonFlights);

// Adding event listeners using the generic function
addEventListenerToElement(findLateAirlineBtn, 'click', findMostLateAirline);
addEventListenerToElement(scrollTopBtn, 'click', scrollToTopHandler);
addEventListenerToElement(filterFlightsBtn, 'click', filterFlights);
addEventListenerToElement(btnAggregatedData, 'click', scrollToElementHandler(aggregatedData));
addEventListenerToElement(btnLateAirline, 'click', scrollToElementHandler(lateAirlineInfo));

// Call aggregateFlightData and display its results
displayAggregatedData(aggregateFlightData(jsonFlights));

updateClock(); // Update the clock immediately
setInterval(updateClock, 1000); // Update the clock every second

const stickyNav = document.querySelector('.sticky-nav'); // Select the sticky navigation bar
let scrollThreshold = 10; // threshold for when the user starts scrolling down
addEventListenerToElement(window, 'scroll', function () {
    if (window.scrollY > scrollThreshold) {
        stickyNav.classList.add('low');
    } else {
        stickyNav.classList.remove('low');
    }
});

// Add mouseenter event listener to remove 'low' class on hover
addEventListenerToElement(stickyNav, 'mouseenter', function () {
    this.classList.remove('low');
});

// Add mouseleave event listener to re-add 'low' class when mouse leaves
// Only re-add 'low' if the page is scrolled down past the threshold
addEventListenerToElement(stickyNav, 'mouseleave', function () {
    if (window.scrollY > scrollThreshold) {
        this.classList.add('low');
    }
});

// Initially hide the 'Most Late Airline' scroll button
hideElement(btnLateAirline);

// Add event listener to the 'Find the Most Late Airline' button
addEventListenerToElement(findLateAirlineBtn, 'click', function () {
    // Logic to find the most late airline
    findMostLateAirline();

    // Hide the 'Find the Most Late Airline' button
    hideElement(this);

    // Show the 'Most Late Airline' scroll button
    showElement(btnLateAirline);
});
//#endregion 