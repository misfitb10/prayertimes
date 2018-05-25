/************************************************************
 **
 * API used:   https://aladhan.com/prayer-times-api
 **
 ************************************************************/

import util from './util';

const prayerTimes = (function() {
    // Global misc consts
    const loading = document.querySelector('.loading') as HTMLDivElement;
    const error = document.querySelector('.error') as HTMLDivElement;
    const showClassName:string = 'show';

    // The base URL for every API call
    const baseApiURL:string = 'http://api.aladhan.com/v1';

    // Default timesApiURL. This will be loaded when the user doesn't want to enable geolocation
    const timesApiParams:object = {
        school: 1,
        method: 2,
        country: 'The Netherlands',
        city: 'The Hague'
    };

    let timesApiURL:string = baseApiURL + '/timingsByCity?' + util.params(timesApiParams);

    // Global because it will get populated through time stamp API call and then used in the prayer times API call
    let timeStamp:string = "";



    // If the browser doesn't support geolocation, show the user a fitting message
    const checkGeoSupported = function() {
        if (!navigator.geolocation){
            const noGeoLocationText:string = 'Geolocation is not supported by your browser. This means that you can\'t see prayer times based on your location.';
            console.log(noGeoLocationText);
            error.textContent = noGeoLocationText;
            error.classList.add(showClassName);
        }
    };

    const geoSuccess = function(position:any) {
        // Geo success is when the user has chosen for geolocation
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;

        // If there is a latitude and longitude,
        // get the timestamp needed first, then load the prayer times API
        if (latitude && longitude) {
            getTimeStamp().then(function() {
                getPrayerTimes(latitude, longitude).then(showLocationImage);
            })
        }
    };

    const geoError = function() {
        // Load default getTimesApi, because timestamp is only needed for geolocation
        // then show the message of the default The Hague prayer times; "Zonder 'locatietoegang'..."
        getPrayerTimes().then(showFixedLocationMessage);
    };

    const getTimeStamp = function() {
        const timeStampURL:string = baseApiURL + '/currentTimestamp?zone=Europe/Amsterdam';

        return fetch(timeStampURL)
            .then((response) => response.json())
            .then((responseJSON) => onGetTimeStampSuccess(responseJSON))
            .catch(() => handleError)
    };

    const onGetTimeStampSuccess = function(response:any) {
        // Set timeStamp let to response.data, because we need to use this let in the getPrayerTimes function
        timeStamp = response.data;
    };

    const getPrayerTimes = function(latitude?:number, longitude?:number) {
        // If there is a latitude and longitude, set the timesApiURL to a different API endpoint
        if (latitude && longitude) {
            const params:object = {
                school: 1,
                method: 3,
                latitude: latitude,
                longitude: longitude
            };

            timesApiURL = baseApiURL + '/timings/' + timeStamp + '?' + util.params(params);

            // Set the location image based on latitude and longitude
            setLocationImage(latitude, longitude);
        }

        return fetch(timesApiURL)
            .then((response) => response.json())
            .then((responseJSON) => onGetPrayerSuccess(responseJSON))
            .catch(() => handleError)
    };

    const onGetPrayerSuccess = function(getPrayerTimesResponse:any) {
        setDate(getPrayerTimesResponse);
        setPrayers(getPrayerTimesResponse);
        hideLoading();
        showPrayerData();
    };

    // Set today's date
    const setDate = function(getPrayerTimesResponse:any) {
        const date = document.querySelector('.date') as HTMLSpanElement;
        const responseDate = getPrayerTimesResponse.data.date;
        date.textContent = responseDate.hijri.date + ' / ' + responseDate.gregorian.date;
    };

    // Populate the 5 prayers with API data
    const setPrayers = function(getPrayerTimesResponse:any) {
        // These are the 5 prayers (elements) which will get populated by the API
        const fajr = document.querySelector('.fajr__time') as HTMLSpanElement;
        const dhuhr = document.querySelector('.dhuhr__time') as HTMLSpanElement;
        const asr = document.querySelector('.asr__time') as HTMLSpanElement;
        const maghrib = document.querySelector('.maghrib__time') as HTMLSpanElement;
        const isha = document.querySelector('.isha__time') as HTMLSpanElement;

        const responseTimings = getPrayerTimesResponse.data.timings;
        fajr.textContent = responseTimings.Fajr;
        dhuhr.textContent = responseTimings.Dhuhr;
        asr.textContent = responseTimings.Asr;
        maghrib.textContent = responseTimings.Maghrib;
        isha.textContent = responseTimings.Isha;
    };

    // Hide loading element, then show prayer data
    const hideLoading = function() {
        loading.classList.add('hide');
    };

    const showPrayerData = function() {
        const prayerData = document.querySelector('.prayer__data') as HTMLElement;
        prayerData.classList.add(showClassName)
    };

    // Show fixed location message. This is the default message of "Zonder 'locatietoegang'..."
    const showFixedLocationMessage = function() {
        const noGeoEl = document.querySelector('.noGeolocation') as HTMLParagraphElement;
        noGeoEl.classList.add(showClassName);
    };

    // Set Google Maps Static Image to show the user where we think he is
    const setLocationImage = function(latitude:number, longitude:number) {
        const locationMap = document.querySelector('.location__map') as HTMLDivElement;
        const params:object = {
            zoom: 15,
            size: '300x300',
            markers: 'color:green'
        };

        const baseURL:string = 'https://maps.googleapis.com/maps/api/staticmap?';
        const latLong = latitude + ',' + longitude;
        const url:string = baseURL + 'center=' + latLong + "&" + util.params(params) + '|' + latLong;
        const locationImg = document.createElement("img");
        locationImg.alt = "user location";
        locationImg.src = url;
        locationMap.appendChild(locationImg);
    };

    const showLocationImage = function() {
        const location = document.querySelector('.location') as HTMLDivElement;
        location.classList.add(showClassName);
    };

    // Generic error handler for API calls
    const handleError = function(jqXHR:any, textStatus:any, errorThrown:any) {
        const errorMessage:string = 'Excuses, er is iets misgegaan met ons systeem. Probeer het later nog eens.';
        loading.classList.add('hide');
        error.textContent = errorMessage;
        console.error('--- API response failed. ---');
        console.log('jqXHR: ', jqXHR);
        console.log('textStatus: ', textStatus);
        console.log('errorThrown: ', errorThrown);
        console.log('----------------------------');
    };

    const initGeo = function() {
        checkGeoSupported();
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    };

    return {
        init: initGeo
    }
})();

(function() {
    prayerTimes.init();
})();