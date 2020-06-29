document.getElementById('lookUpForm').addEventListener('submit', function (e) {

    e.preventDefault()
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



    const weekdays = ["sun", "mon", "tue", "wed", "thur", "fri", "sat"]


    /* Retrieving the forecast period */
    let today = new Date()
    /* OPDRACHT FIX DIT MET FOR LOOP */
    let forecasts = [formatDate(today), formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)), formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)), formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)), formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4)), formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5))];

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


    /* get input */
    let countryInput = document.getElementById('country').value.charAt(0).toUpperCase() + document.getElementById('country').value.toLowerCase().slice(1)

    /* fetch weather data */
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${countryInput}&units=metric&appid=bdb1c5c0cd0402c22d5535153d2a00e5`)
        .then(response => response.json())
        .then(country => {


            /* fetch name city/country */
            document.getElementById('cityCountry').innerText=country.city.name
            /* fetch data forecast period */
            let dateData = country.list
            dateData.forEach(date => {
console.log(date)
                forecasts.forEach((forecast, i) => {

                    if (date.dt_txt.includes(`${forecast}`)) {

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
                        document.getElementsByClassName('weatherIcon')[i].setAttribute('src',  `http://openweathermap.org/img/w/${icon}.png`)
                        document.getElementsByClassName('weatherIcon')[i].setAttribute('alt',  `weatherIcon`)


                    }



                });
                /* data for today */
                if (date.dt_txt.includes(`${forecasts[0]}`)){

                    let pressures = [];
                    pressures.push(date.main.pressure)
                    let pressureAvg = avg( pressures)
                   document.querySelector('.pressure').innerText=`Pressure: ${pressureAvg} mb`

                    let windspeeds=[];
                    windspeeds.push(date.wind.speed)
                    let windspeedAvg = avg(windspeeds)
                    document.querySelector('.windspeed').innerText=`Wind: ${windspeedAvg} kmph`

                    let humidity=[];
                    humidity.push(date.main.humidity)
                    let humidityAvg = avg(humidity)
                    document.querySelector('.humidity').innerText=`Humidity: ${humidityAvg} %`
                }

            });


        })


    function avg(array) {

        let averageTemp = Math.round(array.reduce(function (sum, value) {
            return sum + value;
        }, 0) / array.length);
        return averageTemp
    }


    function getOccurrence(array) {
        let iconObject = new Map;
        let chosenIcon="";
        array.forEach(icon => {
            if (!iconObject.has(icon)){
                iconObject.set(icon,0)

            }
                iconObject.set(icon, iconObject.get(icon) + 1)

        });

        iconObject.forEach((quantity,key) =>{
            if(quantity>iconObject.get(chosenIcon) || !iconObject.has(chosenIcon)){
                chosenIcon = key;
            }
        });

        return chosenIcon

    }


});

/*

/* searchbar js */

document.getElementById('lookUpForm').addEventListener('submit', function(evt){submitFn(this, evt)})
document.getElementById('searchBtn').addEventListener('click', function(evt){searchToggle(this, evt)})
document.getElementById('closeBtn').addEventListener('click', function(evt){searchToggle(this, evt)})

    function searchToggle(obj, evt){
        var container = $(obj).closest('.search-wrapper');

        if(!container.hasClass('active')){
            container.addClass('active');
            evt.preventDefault();
        }
        else if(container.hasClass('active') && $(obj).closest('.input-holder').length == 0){
            container.removeClass('active');
            // clear input
            container.find('.search-input').val('');
            // clear and hide result container when we press close
            container.find('.result-container').fadeOut(100, function(){$(this).empty();});
        }
    }



function submitFn(obj, evt){
    value = $(obj).find('.search-input').val().trim();


    if(!value.length){
        _html = "Add a country or city friend :D";
    }
    else{
        _html += "<b>" + value + "</b>";
    }

    $(obj).find('.result-container').html('<span>' + _html + '</span>');
    $(obj).find('.result-container').fadeIn(100);

    evt.preventDefault();
}
