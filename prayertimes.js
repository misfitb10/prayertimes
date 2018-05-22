/************************************************************
 **
 * API used:   https://aladhan.com/prayer-times-api
 **
 ************************************************************/

const prayerTimes = (function() {
    "use strict";

    // Global misc consts
    const $loading = $('.loading');
    const $error = $('.error');
    const fadeSpeed = 500;

    // The base URL for every API call
    const baseApiURL = 'http://api.aladhan.com/v1';

    // Default timesApiURL. This will be loaded when the user doesn't want to enable geolocation
    var timesApiParams = {
        school: 1,
        method: 2,
        country: 'The Netherlands',
        city: 'The Hague'
    };

    let timesApiURL = baseApiURL + '/timingsByCity?' + $.param(timesApiParams);

    // Global because it will get populated through time stamp API call and then used in the prayer times API call
    let timeStamp = "";



    // If the browser doesn't support geolocation, show the user a fitting message
    const checkGeoSupported = function() {
        if (!navigator.geolocation){
            const noGeoLocationText = 'Geolocation is not supported by your browser. This means that you can\'t see prayer times based on your location.';
            console.log(noGeoLocationText);
            $error.text(noGeoLocationText).fadeIn(fadeSpeed)
        }
    };

    const geoSuccess = function(position) {
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
        const timeStampURL = baseApiURL + '/currentTimestamp?zone=Europe/Amsterdam';

        return $.get(timeStampURL)
            .done(onGetTimeStampSuccess)
            .fail(handleError);
    };

    const onGetTimeStampSuccess = function(response) {
        // Set timeStamp let to response.data, because we need to use this let in the getPrayerTimes function
        timeStamp = response.data;
    };

    const getPrayerTimes = function(latitude, longitude) {
        // If there is a latitude and longitude, set the timesApiURL to a different API endpoint
        if (latitude && longitude) {
            const params = {
                school: 1,
                method: 3,
                latitude: latitude,
                longitude: longitude
            };

            timesApiURL = baseApiURL + '/timings/' + timeStamp + '?' + $.param(params);

            // Set the location image based on latitude and longitude
            setLocationImage(latitude, longitude);
        }

        return $.get(timesApiURL)
            .done(onGetPrayerSuccess)
            .fail(handleError)
    };

    const onGetPrayerSuccess = function(getPrayerTimesResponse) {
        setDate(getPrayerTimesResponse);
        setPrayers(getPrayerTimesResponse);
        hideLoading();
    };

    // Set today's date
    const setDate = function(getPrayerTimesResponse) {
        const $date = $('.date');
        const responseDate = getPrayerTimesResponse.data.date;
        $date.text(responseDate.hijri.date + ' / ' + responseDate.gregorian.date);
    };

    // Populate the 5 prayers with API data
    const setPrayers = function(getPrayerTimesResponse) {
        // These are the 5 prayers (elements) which will get populated by the API
        const $fajr = $('.fajr__time');
        const $dhuhr = $('.dhuhr__time');
        const $asr = $('.asr__time');
        const $maghrib = $('.maghrib__time');
        const $isha = $('.isha__time');

        const responseTimings = getPrayerTimesResponse.data.timings;
        $fajr.text(responseTimings.Fajr);
        $dhuhr.text(responseTimings.Dhuhr);
        $asr.text(responseTimings.Asr);
        $maghrib.text(responseTimings.Maghrib);
        $isha.text(responseTimings.Isha);
    };

    // Hide loading element, then show prayer data
    const hideLoading = function() {
        $loading.fadeOut(fadeSpeed, function() {
            $('.prayer__data').fadeIn(fadeSpeed);
        });
    };

    // Show fixed location message. This is the default message of "Zonder 'locatietoegang'..."
    const showFixedLocationMessage = function() {
        $('.noGeolocation').fadeIn(fadeSpeed);
    };

    // Set Google Maps Static Image to show the user where we think he is
    const setLocationImage = function(latitude, longitude) {
        const params = {
            zoom: 15,
            size: '300x300',
            markers: 'color:green'
        };

        const baseURL = 'https://maps.googleapis.com/maps/api/staticmap?';
        const latLong = latitude + ',' + longitude;
        const url = baseURL + 'center=' + latLong + "&" + $.param(params) + '|' + latLong;
        const locationImage = '<img alt="user location" src="' + url + '" />';
        $('.location__map').append(locationImage);
    };

    const showLocationImage = function() {
        $('.location').fadeIn(fadeSpeed);
    };

    // Generic error handler for API calls
    const handleError = function(jqXHR, textStatus, errorThrown) {
        $loading.fadeOut(fadeSpeed);
        $error.text('Excuses, er is iets misgegaan met ons systeem. Probeer het later nog eens.');
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

$(function() {
    prayerTimes.init();
});