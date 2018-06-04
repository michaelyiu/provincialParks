const parkApp = {
};
// //forEach array.name new array return as a new select 
// 	//create option tag and push to select input that will already live in html 
parkApp.displayList = () => {
    parkApp.parks.forEach((park) => {
        const option =
            `
			<option value="${park.Name}">${park.Name}</option>					
		`
        $('#provParks').append(option);
    })
};

parkApp.config = async () => {
    //retrieving all firebase information 
    const config = {
        apiKey: "AIzaSyD20JLqE4tFouRUW8KXOLzTe_8nSwBOVg4",
        authDomain: "provincialparks-12adb.firebaseapp.com",
        databaseURL: "https://provincialparks-12adb.firebaseio.com",
        projectId: "provincialparks-12adb",
        storageBucket: "provincialparks-12adb.appspot.com",
        messagingSenderId: "552178127869"
    };
    firebase.initializeApp(config);

    const parkAppFirebaseRef = firebase.app().database().ref();
    parkAppFirebaseRef.once('value')
        .then(function (snap) {
            parkApp.parks = snap.val();
            // console.log(parkApp.parks);
            // call the next function here
            parkApp.displayList();
        })

    parkApp.markers = null;
    parkApp.directionsService = new google.maps.DirectionsService;
    parkApp.directionsDisplay = new google.maps.DirectionsRenderer;

    await parkApp.geolocation();
}

parkApp.geolocation = (callback) => {
    let promise = new Promise(function (resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                
                function (position) {
                    parkApp.latitude = position.coords.latitude;
                    parkApp.longitude = position.coords.longitude;
                    
                    //defining geolocation marker 
                    parkApp.geolocationMarker = new google.maps.Marker({
                        position: {
                            lat: parkApp.latitude, 
                            lng: parkApp.longitude
                        },
                        map: parkApp.map
                    });

                    resolve(position.coords.latitude + "," + position.coords.longitude)
                });
        } else {
            reject("Unknown");
        }
    });
    return promise;
};




parkApp.select = () => {
    $('#provParks').on('change', function () {

        $('.content').css('display','flex');
        //smooth scroll
        $('html, body').animate({
            scrollTop: $('.content').offset().top
        }, 1000);

        //clearing the park marker each time a new park is selected
        if (parkApp.markers != null) {
            parkApp.markers.setMap(null);
        }
       
        const selectedPark = $(this).find(':selected').val();
        console.log(selectedPark);
        const selectedParkInfo = parkApp.parks.filter((park) => {
            if (park.Name === selectedPark) {
                return park
            };
        })
     
        parkApp.getWeather(selectedParkInfo[0].Lat, selectedParkInfo[0].Lng);

        parkApp.displayInfo(selectedParkInfo[0].Name, selectedParkInfo[0].Address, selectedParkInfo[0].Contact, selectedParkInfo[0].Classification, selectedParkInfo[0]['Opening Day'], selectedParkInfo[0]['Closing Day'], selectedParkInfo[0].Notes)

        //defining the parks location marker     
        parkApp.markers = new google.maps.Marker({
            position: {
                lat: selectedParkInfo[0].Lat,
                lng: selectedParkInfo[0].Lng
            },
            map: parkApp.map
        });

        //making both markers appear on the same window 
        let bounds = new google.maps.LatLngBounds();
        
        let markers = [
            parkApp.geolocationMarker,
            parkApp.markers];
            
        let pos1 = new google.maps.LatLng(parkApp.latitude, parkApp.longitude); 
        let pos2 = new google.maps.LatLng(selectedParkInfo[0].Lat, selectedParkInfo[0].Lng)
           
        bounds.extend(pos1);
        bounds.extend(pos2);
        
        parkApp.map.fitBounds(bounds); 
        parkApp.directionsDisplay.setMap(parkApp.map);
        parkApp.calculateAndDisplayRoute(parkApp.directionsService, parkApp.directionsDisplay, pos1, pos2);  
        
        //back to top button
        $('.back-to-top').on('click', function () {
            $('html, body').animate({
                scrollTop: $('header').offset().top
            }, 1000);
        })

        //twiter widget 
        window.twttr = (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
                t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
            t._e = [];
            t.ready = function (f) {
                t._e.push(f);
            };
            return t;
        }(document, "script", "twitter-wjs"));
    })
}

parkApp.calculateAndDisplayRoute = function(directionsService, directionsDisplay, pos1, pos2) {

    directionsService.route({
        origin: pos1,
        destination: pos2,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

parkApp.loadMap = (lat, lng) => {
   const mapOptions = {
        center: {
            //enhaced object literal
            lat,
            lng
        },
        zoom: 10
    }

    const mapDiv = $('.map')[0];

    parkApp.map = new google.maps.Map(mapDiv, mapOptions.center);
    
}

parkApp.displayInfo = (name = 'please select a park', address = '', contact = '', classification = '', opening = '', closing = '', notes = '') => {
    $('.parkInfo').html(`
        <h1>${name}</h1>
        <h2>${address}</h2>
        <h3><span>Contact Info:</span> ${contact}</h3>
        <h3><span>Classification:</span> ${classification}</h3>
        <h3><span>Opening Day:</span> ${opening}</h3>
        <h3><span>Closing Day:</span> ${closing}</h3>
        <h3><span>Notes:</span> ${notes}</h3>
    `)
}

parkApp.displayCurrentWeather = () => {
    $('#weather').empty();
    $('#weather').append(`
    <h1 class="currentWeatherTitle">Current Weather</h1>
    <div class="currentWeather">
            <div class="currentWeatherContainerImage">
                <h2>${parkApp.weather}</h2>
                <img src="${parkApp.icon}" alt="${parkApp.iconDes}" />
            </div>
        <div class="currentWeatherContainer">
            <h3><span>Currently</span>: ${parkApp.temp}°C</h3>
            <h3><span>Feels Like</span>: ${parkApp.feels}°C</h3>
            <button class="showForecast">See 3 Day Forecast</button>
        </div>
    </div>        
    `)
    $('.showForecast').on('click',() => {
        $('.forecastContainer').show()
        $('.currentWeather').hide()
        $('.currentWeatherTitle').hide()
    })
}

parkApp.displayForecast = (data) => {
    const days = Object.keys(data)
    .map((key) => {
        const currentDay = data[key];
        return `
        <div class="${key} day">
            <h3 class="date">${currentDay.day}, ${currentDay.month}, ${currentDay.date}</h3>
            <h3>Conditions: ${currentDay.conditions}</h3>
            <img src="${currentDay.iconURL}" alt="${currentDay.icon}" />
            <h3> POP: ${currentDay.pop}%</h3>
            <h3> Rel. Humidity: ${currentDay.hum}%</h3>
        </div>    
      `
    })

    $('#weather').append(`
        <div class="forecastContainer">
            <button class="hideForecast"><i class="fas fa-times"></i></button>
            <h2>3 Day Forecast</h2>
            <div class="forecast">
                ${days.join('')}
            </div>
        </div>
    `)

    $('.hideForecast').on('click', () => {
        $('.forecastContainer').hide()
        $('.currentWeather').show()
        $('.currentWeatherTitle').show()
    })
}

parkApp.getWeather = async (lat, lng) => {
    await $.ajax({
        url: `https://api.wunderground.com/api/7df53cd529eab04d/conditions/q/${lat},${lng}.json`,
        method: 'GET',
        dataType: 'json'
    }).then((res) => {
        console.log(res)
        parkApp.feels = res.current_observation.feelslike_c
        parkApp.icon = res.current_observation.icon_url
        parkApp.iconDes = res.current_observation.icon
        parkApp.temp = res.current_observation.temp_c
        parkApp.forecast = res.current_observation.forecast_url
        parkApp.weather = res.current_observation.weather
    })

    //retrieving forecast 
    await $.ajax({
        url: `https://api.wunderground.com/api/7df53cd529eab04d/forecast/q/${lat},${lng}.json`,
        method: 'GET',
        dataType: 'json' 
    }).then((res2) => {

        const data = {}

        for(let i = 1; i < 4; i++) {
            data[`day${i}`] === undefined ? data[`day${i}`] = {} : null ;
            let currentDay = data[`day${i}`]
            const forecast = res2.forecast.simpleforecast.forecastday[i]
            
            currentDay.day = forecast.date.weekday_short
            currentDay.month = forecast.date.monthname
            currentDay.date = forecast.date.day
            currentDay.conditions = forecast.conditions
            currentDay.pop = forecast.pop
            currentDay.hum = forecast.avehumidity
            currentDay.icon = forecast.icon
            currentDay.iconURL = forecast.icon_url
        }

        parkApp.displayCurrentWeather();
        parkApp.displayForecast(data);
    })
}
 
parkApp.init = () => {
     parkApp.loadMap();    
    parkApp.config();
    parkApp.select();
    parkApp.displayInfo();

}

$(function () {
    parkApp.init();
});