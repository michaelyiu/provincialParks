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
    //call loadmap and loadweather with pseudo state variables 
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
        // if(parkApp.directionsDisplay != null)
        // {
        //     parkApp
        // }

        const selectedPark = $(this).find(':selected').val();
        console.log(selectedPark);
        const selectedParkInfo = parkApp.parks.filter((park) => {
            if (park.Name === selectedPark) {
                return park
            };
        })
     
        parkApp.getWeather(selectedParkInfo[0].Lat, selectedParkInfo[0].Lng);

        parkApp.displayInfo(selectedParkInfo[0].Name, selectedParkInfo[0].Address, selectedParkInfo[0].Contact, selectedParkInfo[0].Classification, selectedParkInfo[0]['Opening Day'], selectedParkInfo[0]['Closing Day'], selectedParkInfo[0].Notes)

        //defining the parks locaiton marker     
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
        calculateAndDisplayRoute(parkApp.directionsService, parkApp.directionsDisplay, pos1, pos2);  
        
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

function calculateAndDisplayRoute(directionsService, directionsDisplay, pos1, pos2) {

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
			<h2>Address: ${address}</h2>
			<h2>Contact Info: ${contact}</h2>
			<h3>Classification: ${classification}</h3>
			<h3>Opening Day: ${opening}</h3>
			<h3>Closing Day: ${closing}</h3>
			<h3>Notes: ${notes}</h3>
		`)
}

parkApp.displayCurrentWeather = (temp, feels, icon, iconDes, forecast, day1Day, day1Month, day1Date, day1Conditions, day1Pop, day1Hum, day1icon, day1iconURL, day2Day, day2Month, day2Date, day2Pop, day2Conditions, day2Hum, day2icon, day2iconURL, day3Day, day3Month, day3Date, day3Pop, day3Conditions, day3Hum, day3icon, day3iconURL) => {
    $('#weather').empty();
    $('#weather').append(`
        <div class="currentWeather">
            <h2>Currently</h2>
		    <h3>currently ${temp}°C</h3>
    		<h3>feels like ${feels}°C</h3>
    		<img src="${icon}" alt="${iconDes}" />
    		<a href="${forecast}">See full forecast here</a>
        </div>
        <div class="forecast">
            <h2>3 Day Forecast</h2>
           <div class= "forecastWrapper">
                <div class="day1 day">
                    <h2>${day1Day}, ${day1Month}, ${day1Date}</h2> 
                    <h2>${day1Conditions}, ${day1Pop}, ${day1Hum}</h2>
                    <img src="${day1iconURL}" alt="${day1icon}"/> 
                </div>
                <div className="day2 day">
                    <h2>${day2Day}, ${day2Month}, ${day2Date}</h2> 
                    <h2>${day2Conditions}, ${day2Pop}, ${day2Hum}</h2>
                    <img src="${day2iconURL}" alt="${day2icon}"/> 
                </div>
                <div className="day3 day">
                    <h2>${day3Day}, ${day3Month}, ${day3Date}</h2> 
                    <h2>${day3Conditions}, ${day3Pop}, ${day3Hum}</h2>
                    <img src="${day3iconURL}" alt="${day3icon}"/>  
                </div>
           </div>
        </div>
		`)
}


parkApp.getWeather = async (lat, lng) => {
    await $.ajax({
        url: `http://api.wunderground.com/api/7df53cd529eab04d/conditions/q/${lat},${lng}.json`,
        method: 'GET',
        dataType: 'json'
    }).then((res) => {
        // console.log(res);
        parkApp.feels = res.current_observation.feelslike_c
        parkApp.icon = res.current_observation.icon_url
        parkApp.iconDes = res.current_observation.icon
        parkApp.temp = res.current_observation.temp_c
        parkApp.forecast = res.current_observation.forecast_url
        // parkApp.displayCurrentWeather(temp, feels, icon, iconDes, forecast);
    })

    //retrieving forecast 
    await $.ajax({
        url: `http://api.wunderground.com/api/7df53cd529eab04d/forecast/q/${lat},${lng}.json`,
        method: 'GET',
        dataType: 'json' 
    }).then((res2) => {
        console.log(res2)
        //forecast day 1
        
        const day1 = res2.forecast.simpleforecast.forecastday[1];
        const day1Day = day1.date.weekday_short;
        const day1Month = day1.date.monthname;
        const day1Date = day1.date.day;
        const day1Conditions = day1.conditions;
        const day1Pop = day1.pop;
        const day1Hum = day1.avehumidity
        const day1icon = day1.icon
        const day1iconURL = day1.icon_url 
        // console.log(day1Day, day1Month, day1Date, day1Conditions, day1Pop, day1Hum, day1icon, day1iconURL);

        //forecast day 2 
        const day2 = res2.forecast.simpleforecast.forecastday[2];
        const day2Day = day2.date.weekday_short;
        const day2Month = day2.date.monthname;
        const day2Date = day2.date.day;
        const day2Conditions = day2.conditions;
        const day2Pop = day2.pop;
        const day2Hum = day2.avehumidity
        const day2icon = day2.icon
        const day2iconURL = day2.icon_url 
        // console.log(day2Day, day2Month, day2Date, day2Pop, day2Conditions, day2Hum, day2icon, day2iconURL);

        //forecast day 3
        const day3 = res2.forecast.simpleforecast.forecastday[3];
        const day3Day = day3.date.weekday_short;
        const day3Month = day3.date.monthname;
        const day3Date = day3.date.day;
        const day3Conditions = day3.conditions;
        const day3Pop = day3.pop;
        const day3Hum = day3.avehumidity
        const day3icon = day3.icon
        const day3iconURL = day3.icon_url
        // console.log(day3Day, day3Month, day3Date, day3Pop, day3Conditions, day3Hum, day3icon, day3iconURL);

        parkApp.displayCurrentWeather(parkApp.temp, parkApp.feels, parkApp.icon, parkApp.iconDes, parkApp.forecast, day1Day, day1Month, day1Date, day1Conditions, day1Pop, day1Hum, day1icon, day1iconURL, day2Day, day2Month, day2Date, day2Pop, day2Conditions, day2Hum, day2icon, day2iconURL, day3Day, day3Month, day3Date, day3Pop, day3Conditions, day3Hum, day3icon, day3iconURL);
    })
}

//adding twitter widget 

parkApp.init = () => {

    parkApp.loadMap();    
    parkApp.config();
    parkApp.select();
    parkApp.displayInfo();

}




$(function () {
    parkApp.init();
});