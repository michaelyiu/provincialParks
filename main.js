const parkApp = {};

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

parkApp.config = () => {

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

    //call loadmap and loadweather with pseudo state variables 
}

parkApp.select = () => {
    // console.log('select called')
    $('#provParks').on('change', function () {
        const selectedPark = $(this).find(':selected').val();
        console.log(selectedPark);
        const selectedParkInfo = parkApp.parks.filter((park) => {
            if (park.Name === selectedPark) {
                return park
            };
        })
        console.log(selectedParkInfo[0].Lat, selectedParkInfo[0].Lng)
        parkApp.loadMap(selectedParkInfo[0].Lat, selectedParkInfo[0].Lng);
        parkApp.getWeather(selectedParkInfo[0].Lat, selectedParkInfo[0].Lng);
        // console.log(selectedParkInfo);
        // console.log(selectedParkInfo[0]);
        parkApp.displayInfo(selectedParkInfo[0].Name, selectedParkInfo[0].Address, selectedParkInfo[0].Contact, selectedParkInfo[0].Classification, selectedParkInfo[0]['Opening Day'], selectedParkInfo[0]['Closing Day'], selectedParkInfo[0].Notes)

    })
}

// Define all variables, name, lat, lng, classification, opening day, closing day, notes, address, all from selected option


parkApp.loadMap = (lat = 43.6565336, lng = -79.3910906) => {
    const mapOptions = {
        center: {
            //enhaced object literal
            lat,
            lng
        },
        zoom: 10
    }

    // const mapDiv = document.getElementById('map');	
    const mapDiv = $('.map')[0];
    console.log(mapDiv)
    parkApp.map = new google.maps.Map(mapDiv, mapOptions);
    console.log(parkApp.map)
    const marker = new google.maps.Marker({
             position: mapOptions.center,
           });
    marker.setMap(parkApp.map);       
}

parkApp.displayInfo = (name = 'please select a park', address = '', contact = '', classification = '', opening = '', closing = '', notes = '') => {
    $('.parkInfo').html(`
			<h1>${name}</h1>
			<h2>${address}</h2>
			<h2>Contact Info: ${contact}</h2>
			<h3>Classification: ${classification}</h3>
			<h3>Opening Day: ${opening}</h3>
			<h3>Closing Day: ${closing}</h3>
			<h3>Notes: ${notes}</h3>
		`)
}

parkApp.displayWeather = (temp, feels, icon, iconDes, forecast) => {
    $('#weather').html(`
		<h2>currently ${temp}</h2>
		<h2>feels like ${feels}</h2>
		<img src="${icon}" alt="${iconDes}" />
		<img src="${forecast}" alt="" />
		`)
}

parkApp.getWeather = (lat = 43.6565336, lng = -79.3910906) => {
    // console.log(lat, lng, 'getweather');
    $.ajax({
        url: `http://api.wunderground.com/api/7df53cd529eab04d/conditions/q/${lat},${lng}.json`,
        method: 'GET',
        dataType: 'json',
    }).then((res) => {
        console.log(res);
        const feels = res.current_observation.feelslike_c
        const icon = res.current_observation.icon_url
        const iconDes = res.current_observation.icon
        const temp = res.current_observation.temp_c
        const forecast = res.current_observation.forecast_url
        parkApp.displayWeather(temp, feels, icon, iconDes, forecast);
    })
}

parkApp.init = () => {
    // console.log('hey')
    parkApp.config();
    parkApp.select();
    parkApp.getWeather();
    parkApp.displayWeather();
    parkApp.displayInfo();
    parkApp.loadMap();

}


$(function () {
    parkApp.init();

});