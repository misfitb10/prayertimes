(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/************************************************************
 **
 * API used:   https://aladhan.com/prayer-times-api
 **
 ************************************************************/
exports.__esModule = true;
var util_1 = require("./util");
var prayerTimes = (function () {
    // Global misc consts
    var loading = document.querySelector('.loading');
    var error = document.querySelector('.error');
    var showClassName = 'show';
    // The base URL for every API call
    var baseApiURL = 'http://api.aladhan.com/v1';
    // Default timesApiURL. This will be loaded when the user doesn't want to enable geolocation
    var timesApiParams = {
        school: 1,
        method: 2,
        country: 'The Netherlands',
        city: 'The Hague'
    };
    var timesApiURL = baseApiURL + '/timingsByCity?' + util_1["default"].params(timesApiParams);
    // Global because it will get populated through time stamp API call and then used in the prayer times API call
    var timeStamp = "";
    // If the browser doesn't support geolocation, show the user a fitting message
    var checkGeoSupported = function () {
        if (!navigator.geolocation) {
            var noGeoLocationText = 'Geolocation is not supported by your browser. This means that you can\'t see prayer times based on your location.';
            console.log(noGeoLocationText);
            error.textContent = noGeoLocationText;
            error.classList.add(showClassName);
        }
    };
    var geoSuccess = function (position) {
        // Geo success is when the user has chosen for geolocation
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        // If there is a latitude and longitude,
        // get the timestamp needed first, then load the prayer times API
        if (latitude && longitude) {
            getTimeStamp().then(function () {
                getPrayerTimes(latitude, longitude).then(showLocationImage);
            });
        }
    };
    var geoError = function () {
        // Load default getTimesApi, because timestamp is only needed for geolocation
        // then show the message of the default The Hague prayer times; "Zonder 'locatietoegang'..."
        getPrayerTimes().then(showFixedLocationMessage);
    };
    var getTimeStamp = function () {
        var timeStampURL = baseApiURL + '/currentTimestamp?zone=Europe/Amsterdam';
        return fetch(timeStampURL)
            .then(function (response) { return response.json(); })
            .then(function (responseJSON) { return onGetTimeStampSuccess(responseJSON); })["catch"](function () { return handleError; });
    };
    var onGetTimeStampSuccess = function (response) {
        // Set timeStamp let to response.data, because we need to use this let in the getPrayerTimes function
        timeStamp = response.data;
    };
    var getPrayerTimes = function (latitude, longitude) {
        // If there is a latitude and longitude, set the timesApiURL to a different API endpoint
        if (latitude && longitude) {
            var params = {
                school: 1,
                method: 3,
                latitude: latitude,
                longitude: longitude
            };
            timesApiURL = baseApiURL + '/timings/' + timeStamp + '?' + util_1["default"].params(params);
            // Set the location image based on latitude and longitude
            setLocationImage(latitude, longitude);
        }
        return fetch(timesApiURL)
            .then(function (response) { return response.json(); })
            .then(function (responseJSON) { return onGetPrayerSuccess(responseJSON); })["catch"](function () { return handleError; });
    };
    var onGetPrayerSuccess = function (getPrayerTimesResponse) {
        setDate(getPrayerTimesResponse);
        setPrayers(getPrayerTimesResponse);
        hideLoading();
        showPrayerData();
    };
    // Set today's date
    var setDate = function (getPrayerTimesResponse) {
        var date = document.querySelector('.date');
        var responseDate = getPrayerTimesResponse.data.date;
        date.textContent = responseDate.hijri.date + ' / ' + responseDate.gregorian.date;
    };
    // Populate the 5 prayers with API data
    var setPrayers = function (getPrayerTimesResponse) {
        // These are the 5 prayers (elements) which will get populated by the API
        var fajr = document.querySelector('.fajr__time');
        var dhuhr = document.querySelector('.dhuhr__time');
        var asr = document.querySelector('.asr__time');
        var maghrib = document.querySelector('.maghrib__time');
        var isha = document.querySelector('.isha__time');
        var responseTimings = getPrayerTimesResponse.data.timings;
        fajr.textContent = responseTimings.Fajr;
        dhuhr.textContent = responseTimings.Dhuhr;
        asr.textContent = responseTimings.Asr;
        maghrib.textContent = responseTimings.Maghrib;
        isha.textContent = responseTimings.Isha;
    };
    // Hide loading element, then show prayer data
    var hideLoading = function () {
        console.log('heh?');
        loading.classList.add('hide');
    };
    var showPrayerData = function () {
        var prayerData = document.querySelector('.prayer__data');
        prayerData.classList.add(showClassName);
    };
    // Show fixed location message. This is the default message of "Zonder 'locatietoegang'..."
    var showFixedLocationMessage = function () {
        var noGeoEl = document.querySelector('.noGeolocation');
        noGeoEl.classList.add(showClassName);
    };
    // Set Google Maps Static Image to show the user where we think he is
    var setLocationImage = function (latitude, longitude) {
        var locationMap = document.querySelector('.location__map');
        var params = {
            zoom: 15,
            size: '300x300',
            markers: 'color:green'
        };
        var baseURL = 'https://maps.googleapis.com/maps/api/staticmap?';
        var latLong = latitude + ',' + longitude;
        var url = baseURL + 'center=' + latLong + "&" + util_1["default"].params(params) + '|' + latLong;
        var locationImg = document.createElement("img");
        locationImg.alt = "user location";
        locationImg.src = url;
        locationMap.appendChild(locationImg);
    };
    var showLocationImage = function () {
        var location = document.querySelector('.location');
        location.classList.add(showClassName);
    };
    // Generic error handler for API calls
    var handleError = function (jqXHR, textStatus, errorThrown) {
        var errorMessage = 'Excuses, er is iets misgegaan met ons systeem. Probeer het later nog eens.';
        loading.classList.add('hide');
        error.textContent = errorMessage;
        console.error('--- API response failed. ---');
        console.log('jqXHR: ', jqXHR);
        console.log('textStatus: ', textStatus);
        console.log('errorThrown: ', errorThrown);
        console.log('----------------------------');
    };
    var initGeo = function () {
        checkGeoSupported();
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    };
    return {
        init: initGeo
    };
})();
(function () {
    prayerTimes.init();
})();

},{"./util":2}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports["default"] = {
    params: function (obj) {
        return Object.keys(obj).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); }).join('&');
    }
};

},{}]},{},[1]);
