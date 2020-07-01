/***** GEOLOCATION *****/
if('geolocation' in navigator){
    navigator.geolocation.getCurrentPosition((position) =>{
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${KEY}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('country').value=data.name;
            })
    })
}


/****** COUNTRY/CITY JS  ******/
document.getElementById('lookUpForm').addEventListener('submit', function (e) {

    /* prevent form of refreshing */
    e.preventDefault();
    document.getElementById('chartContainer').style.display = "none";

    const MAX_DAYS = 6;

    /* objects to preserve data per day */
    let temperature = [];
    let weatherIcons = [];
    let labelsTemp = [];

    for (let i = 0; i < MAX_DAYS; i++) {
        temperature.push([]);
        weatherIcons.push([]);
        labelsTemp.push([]);
    };

    /* Retrieving the forecast period */
    const weekdays = ["sun", "mon", "tue", "wed", "thur", "fri", "sat"];
    const today = new Date();
    let forecastPeriod = MAX_DAYS - 1;
    let forecasts = [formatDate(today)];
    for (let i = 1; i <= forecastPeriod; i++) {
        forecasts.push(formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)));
    };


    /* get input */
    const countryInput = document.getElementById('country').value.charAt(0).toUpperCase() + document.getElementById('country').value.toLowerCase().slice(1);



    /* fetch weather data */
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${countryInput}&units=metric&appid=${KEY}`)
        .then(response => response.json())
        .then(city => {

            /* fetch and display name city/country */
            document.getElementById('cityCountry').innerText = city.city.name;

            let pressures = [];
            let windspeeds = [];
            let humidity = [];

            /* fetch data forecast period */
            city.list.forEach(date => {

                /* data for whole period */
                forecasts.forEach((forecast, i) => {

                    if (date.dt_txt.includes(`${forecast}`)) {

                        /* chart labels */
                        let completeTime = date.dt_txt.split(" ").slice(1)
                        completeTime = completeTime.toString().split(':')
                        labelsTemp[`${i}`].push(completeTime[0] + "h" + completeTime[1])

                        /* date */
                        let d = (new Date(forecast)).getDay();
                        d = weekdays[d];
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
                    fetch(`https://api.unsplash.com/photos/random?query=${countryInput}&client_id=${UNSPLASH_SECRET}`)
                        .then(response => response.json())
                        .then(data => {
                        document.getElementById('cityImg').setAttribute('src', `${data.urls.thumb}`)
                    })
                        .catch( () => {
                            document.getElementById('cityImg').setAttribute('src', 'resources/img/weather.png')
                            document.getElementById('cityImg').style.cssText='width:200px;'
                        })

                    calculatePressure(pressures, date);
                    calculateWindspeed(windspeeds, date);
                    calculateHumidity(humidity, date);
                }


            });

        })
        .catch( () => {
            document.getElementById('country').value="";

            alert('something went wrong, try to fill in your city/country again')

        });

    /* assisting function for weather data */
    function calculatePressure(pressures, date) {
        pressures.push(date.main.pressure);
        document.querySelector('.pressure').innerText = `Pressure: ${avg(pressures)} mb`;
    };

    function calculateWindspeed(windspeeds, date) {
        windspeeds.push(date.wind.speed);
        let windspeedAvg = avg(windspeeds);
        document.querySelector('.windspeed').innerText = `Wind: ${windspeedAvg} kmph`;
    };

    function calculateHumidity(humidity, date) {
        humidity.push(date.main.humidity);
        let humidityAvg = avg(humidity);
        document.querySelector('.humidity').innerText = `Humidity: ${humidityAvg} %`;
    };

    /* show charts on click */
    document.getElementById('weatherData').style.display = "block";
    let days = Array.from(document.getElementsByClassName('day'));
    days.forEach((day, i) => {
        day.addEventListener('click', function () {

           let weekday= document.getElementsByClassName('dayOfWeek')[i].innerText;

            chart(labelsTemp[i], temperature[i], "Time","temperature (°C)",weekday);
            document.getElementById('chartContainer').style.display = "block";
        });
    });


   /*** Assisting functions ***/
   /* date formatting */
   function formatDate(date) {
       var d = new Date(date),
           month = '' + (d.getMonth() + 1),
           day = '' + d.getDate(),
           year = d.getFullYear();

       if (month.length < 2)
           month = month.padStart(2,"0");
       if (day.length < 2)
           day = day.padStart(2,"0");

       return [year, month, day].join('-');
   }
   /* calculate average*/
    function avg(array) {

        let averageTemp = Math.round(array.reduce(function (sum, value) {
            return sum + value;
        }, 0) / array.length);
        return averageTemp;
    }
    /* get icon which is used the most over the day */
    function getOccurrence(array) {
        let iconObject = new Map;
        let chosenIcon = "";
        array.forEach(icon => {
            if (!iconObject.has(icon)) {
                iconObject.set(icon, 0)

            };
            iconObject.set(icon, iconObject.get(icon) + 1);

        });

        iconObject.forEach((quantity, key) => {
            if (quantity > iconObject.get(chosenIcon) || !iconObject.has(chosenIcon)) {
                chosenIcon = key;
            };
        });

        return chosenIcon;

    }
    /* Creating Chart */
    function chart(labelsArr, valuesArr, xAxesLabel,yAxesLabel,weekday) {

        tempChart = document.getElementById("tempChart").getContext("2d");

        // global chart options
        Chart.defaults.global.defaultFontFamily = "roboto";
        Chart.defaults.global.defaultFontSize = 18;
        Chart.defaults.global.defaultFontColor = "#fff";

        // the chart
        let statChart = new Chart(tempChart, {
            type: "line", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
            data: {
                labels: labelsArr,
                datasets: [
                    {
                        label:"",
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
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: xAxesLabel
                        },
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: yAxesLabel
                        },
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
    };

});


/****** SEARCHBAR JS  ******/
document.getElementById('lookUpForm').addEventListener('submit', function (evt) {
    submitFn(this, evt);
});
document.getElementById('searchBtn').addEventListener('click', function (evt) {
    searchToggle(this, evt);
})
document.getElementById('closeBtn').addEventListener('click', function (evt) {
    searchToggle(this, evt);
});

/*assisting functions */
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
        document.getElementById('weatherData').style.display = "none"
    } else {

        _html = "";
    }

    $(obj).find('.result-container').html('<span>' + _html + '</span>');
    $(obj).find('.result-container').fadeIn(100);

    evt.preventDefault();
}

