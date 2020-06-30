
/****** COUNTRY/CITY JS  ******/
document.getElementById('lookUpForm').addEventListener('submit', function (e) {

    /* prevent form of refreshing */
    e.preventDefault()


    /* objects to preserve data per day */
    const temperature = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],

    }
    const weatherIcons = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],

    }
    const labelsTemp = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],

    }


    /* Retrieving the forecast period */
    const weekdays = ["sun", "mon", "tue", "wed", "thur", "fri", "sat"]
    const today = new Date()
    let forecastPeriod = 5
    let forecasts = [formatDate(today)]
    for (let i = 1; i <= forecastPeriod; i++) {
        forecasts.push(formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)))
    }


    /* get input */
    let countryInput = document.getElementById('country').value.charAt(0).toUpperCase() + document.getElementById('country').value.toLowerCase().slice(1)

    /* fetch weather data */
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${countryInput}&units=metric&appid=bdb1c5c0cd0402c22d5535153d2a00e5`)
        .then(response => response.json())
        .then(city => {

            /* fetch and display name city/country */
            document.getElementById('cityCountry').innerText = city.city.name

            /* fetch data forecast period */
            let dateData = city.list
            dateData.forEach(date => {

                /* data for whole period */
                forecasts.forEach((forecast, i) => {

                    if (date.dt_txt.includes(`${forecast}`)) {

                        /* chart labels */
                        let time = date.dt_txt.split(" ").slice(1)
                        labelsTemp[`${i}`].push(time)

                        /* date */
                        let d = new Date((forecast));
                        d = weekdays[d.getDay()];
                        document.getElementsByClassName('dayOfWeek')[i].innerText = `${d}`

                        /* temp */
                        temperature[`${i}`].push(date.main.temp)
                        let tempAvg = avg(temperature[`${i}`])
                        document.getElementsByClassName('temperature')[i].innerText = `${tempAvg}°C`

                        /* Icons*/
                        weatherIcons[`${i}`].push(date.weather[0].icon)
                        let icon = getOccurrence(weatherIcons[`${i}`])
                        document.getElementsByClassName('weatherIcon')[i].setAttribute('src', `http://openweathermap.org/img/w/${icon}.png`)
                        document.getElementsByClassName('weatherIcon')[i].setAttribute('alt', `weatherIcon`)


                    }


                });

                /* data for only today */
                if (date.dt_txt.includes(`${forecasts[0]}`)) {

                    /* random country/city image unsplash api */
                    fetch(`https://api.unsplash.com/photos/random?query=${countryInput}&client_id=VygnjCLX2COnnK-wMIGIlxO91a6CyM7C_2WeL9fPqc0`)
                        .then(response => response.json())
                        .then(data => {
                        document.getElementById('cityImg').setAttribute('src', `${data.urls.thumb}`)
                    });

                    /* get pressure */
                    let pressures = [];
                    pressures.push(date.main.pressure)
                    let pressureAvg = avg(pressures)
                    document.querySelector('.pressure').innerText = `Pressure: ${pressureAvg} mb`

                    /* get windspeed */
                    let windspeeds = [];
                    windspeeds.push(date.wind.speed)
                    let windspeedAvg = avg(windspeeds)
                    document.querySelector('.windspeed').innerText = `Wind: ${windspeedAvg} kmph`

                    /* get humidity */
                    let humidity = [];
                    humidity.push(date.main.humidity)
                    let humidityAvg = avg(humidity)
                    document.querySelector('.humidity').innerText = `Humidity: ${humidityAvg} %`
                }


            });

        })

    /* show charts on click */
    document.getElementById('weatherData').style.display = "block"
    let days = Array.from(document.getElementsByClassName('day'))
    days.forEach((day, i) => {
        let weekday="";
        day.addEventListener('click', function () {
            chart("");
            weekday = day.children[0].innerText

            if(i==0){
                weekday = day.children[1].children[0].children[0].innerText
                console.log(weekday)
            }
            console.log(weekday)
            chart(labelsTemp[i], temperature[i], "temperature (°C)",weekday)
            document.getElementById('chartContainer').style.display = "block";
        });
    })


   /*** Assisting functions ***/
   /* date formatting */
   function formatDate(date) {
       var d = new Date(date),
           month = '' + (d.getMonth() + 1),
           day = '' + d.getDate(),
           year = d.getFullYear();

       if (month.length < 2)
           month = '0' + month;
       if (day.length < 2)
           day = '0' + day;

       return [year, month, day].join('-');
   }
   /* calculate average*/
    function avg(array) {

        let averageTemp = Math.round(array.reduce(function (sum, value) {
            return sum + value;
        }, 0) / array.length);
        return averageTemp
    }
    /* get icon which is used the most over the day */
    function getOccurrence(array) {
        let iconObject = new Map;
        let chosenIcon = "";
        array.forEach(icon => {
            if (!iconObject.has(icon)) {
                iconObject.set(icon, 0)

            }
            iconObject.set(icon, iconObject.get(icon) + 1)

        });

        iconObject.forEach((quantity, key) => {
            if (quantity > iconObject.get(chosenIcon) || !iconObject.has(chosenIcon)) {
                chosenIcon = key;
            }
        });

        return chosenIcon

    }
    /* Creating Chart */
    function chart(labelsArr, valuesArr, title,weekday) {
        let tempChart = document.getElementById("tempChart").getContext("2d");

        // global chart options
        Chart.defaults.global.defaultFontFamily = "roboto";
        Chart.defaults.global.defaultFontSize = 18;
        Chart.defaults.global.defaultFontColor = "#fff";
        Chart.defaults.global.defaultPadding = "100";

        // the chart
        let statChart = new Chart(tempChart, {
            type: "line", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
            data: {
                labels: labelsArr,
                datasets: [
                    {
                        label: title,
                        data: valuesArr,
                        borderWidth: 1,
                        borderColor: "#fff",
                        fill: false, // fill in below line
                        lineTension: 0.3, // make line more fluent
                        radius: 4,
                        hoverRadius: 8,
                        borderWidth: 2,
                        backgroundColor: ["rgba(177, 186, 119)", "rgb(154, 76, 63)", "rgb(133, 60, 87)", "rgb(50, 80, 80)", "rgba(177, 186, 119)", "rgb(154, 76, 63)", "rgb(133, 60, 87)", "rgb(50, 80, 80)"], // dots color
                        borderColor: "#fff", // line color
                        borderDash: [10, 5], // dashing line


                    },
                ],
            },
            options: {
                scales: {

                    yAxes: [{

                        ticks: {
                            beginAtZero: false,

                        },
                        gridLines: {
                            zeroLineColor: '#fff'
                        },
                    }],
                },
                title: {
                    display: true,
                    text: `More detail: ${weekday}`,
                    fontFamily: ['Notable', 'sans-serif'],
                    fontSize: 20,
                    fontColor: "#fff",
                },
                legend: {

                    display: "top",
                    labels: {
                        fontColor: "#fff",
                        boxWidth: 0,

                    },

                },
                layout: {
                    //padding{}
                },
                //tooltips{}
            },
        });
    }

});


/****** SEARCHBAR JS  ******/
document.getElementById('lookUpForm').addEventListener('submit', function (evt) {
    submitFn(this, evt)
})
document.getElementById('searchBtn').addEventListener('click', function (evt) {
    searchToggle(this, evt)
})
document.getElementById('closeBtn').addEventListener('click', function (evt) {
    searchToggle(this, evt)
})

function searchToggle(obj, evt) {
    var container = $(obj).closest('.search-wrapper');

    if (!container.hasClass('active')) {
        container.addClass('active');
        evt.preventDefault();
    } else if (container.hasClass('active') && $(obj).closest('.input-holder').length == 0) {
        container.removeClass('active');
        // clear input
        container.find('.search-input').val('');
        // clear and hide result container when we press close
        container.find('.result-container').fadeOut(100, function () {
            $(this).empty();
        });
    }
}

function submitFn(obj, evt) {
    value = $(obj).find('.search-input').val().trim();


    if (!value.length) {
        _html = "Add a country or city friend :D";
    } else {

        _html = "";
    }

    $(obj).find('.result-container').html('<span>' + _html + '</span>');
    $(obj).find('.result-container').fadeIn(100);

    evt.preventDefault();
}

