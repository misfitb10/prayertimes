/************************************************************
 **
 * API used:   https://aladhan.com/prayer-times-api
 **
 ************************************************************/

import util from './util';

// Interfaces
// import IGeo from './interfaces/IGeo';
import IGoogleMapsParams from './interfaces/IGoogleMapsParams';
import IPrayerTimesParams from "./interfaces/IPrayerTimesParams";

// Constants
import { error, loading, showClassName } from "./constants";

// Generic API Error Handler
import apiErrorHandler from './apiErrorHandler';



const prayerTimes = (() => {
    // The base URL for every API call
    const baseApiURL:string = 'http://api.aladhan.com/v1';

    // Default timesApiURL. This will be loaded when the user doesn't want to enable geolocation
    const timesApiParams:IPrayerTimesParams = {
        school: 1,
        method: 2,
        country: 'The Netherlands',
        city: 'The Hague'
    };

    let timesApiURL:string = baseApiURL + '/timingsByCity?' + util.params(timesApiParams);

    // Global because it will get populated through time stamp API call and then used in the prayer times API call
    let timeStamp:string;



    // If the browser doesn't support geolocation, show the user a fitting message
    const checkGeoSupported = (): void => {
        if (!navigator.geolocation){
            showGeoNotification();
            return;
        } else {
            navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
        }
    };

    const showGeoNotification = (): void => {
        const noGeoLocationText:string = 'Geolocation is not supported by your browser. This means that you can\'t see prayer times based on your location.';
        console.error(noGeoLocationText);
        error.textContent = noGeoLocationText;
        error.classList.add(showClassName);
    };

    // Geo success is when the user has chosen for geolocation
    const geoSuccess = (position: any): void => {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;

        // If there is a latitude and longitude,
        // get the timestamp needed first, then load the prayer times API
        if (latitude && longitude) {
            getTimeStamp().then(() => {
                getPrayerTimes(latitude, longitude).then(showLocationImage);
            })
        }
    };

    const geoError = (): void => {
        // Load default getPrayerTimes, because timestamp is only needed for geolocation
        // then show the message of the default The Hague prayer times; "Zonder 'locatietoegang'..."
        getPrayerTimes().then(showFixedLocationMessage);
    };

    const getTimeStamp = () => {
        const timeStampURL:string = baseApiURL + '/currentTimestamp?zone=Europe/Amsterdam';

        return fetch(timeStampURL)
            .then((response) => response.json())
            .then((responseJSON) => onGetTimeStampSuccess(responseJSON))
            .catch(apiErrorHandler.init)
    };

    const onGetTimeStampSuccess = (response: any): void => {
        // Set timeStamp let to response.data, because we need to use this let in the getPrayerTimes function
        timeStamp = response.data;
    };

    const getPrayerTimes = (latitude?: number, longitude?: number) => {
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
            .catch(apiErrorHandler.init)
    };

    const onGetPrayerSuccess = (getPrayerTimesResponse: any): void => {
        setDate(getPrayerTimesResponse);
        setPrayers(getPrayerTimesResponse);
        hideLoading();
        showPrayerData();
    };

    // Set today's date
    const setDate = (getPrayerTimesResponse: any) => {
        const date = document.querySelector('.date') as HTMLSpanElement;
        const responseDate = getPrayerTimesResponse.data.date;
        date.textContent = responseDate.hijri.date + ' / ' + responseDate.gregorian.date;
    };

    // Populate the 5 prayers with API data
    const setPrayers = (getPrayerTimesResponse: any) => {
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

    // Hide loading element
    const hideLoading = (): void => loading.classList.add('hide');

    // Show prayer data by adding a showing class (which makes it `display: block`)
    const showPrayerData = (): void => {
        const prayerData = document.querySelector('.prayer__data') as HTMLElement;
        prayerData.classList.add(showClassName)
    };

    // Show fixed location message by adding a showing class (which makes it `display: block`)
    const showFixedLocationMessage = (): void => {
        const noGeoEl = document.querySelector('.noGeolocation') as HTMLParagraphElement;
        noGeoEl.classList.add(showClassName);
    };

    // Set Google Maps Static Image to show the user where we think he is
    const setLocationImage = (latitude: number, longitude: number): void => {
        const locationMap = document.querySelector('.location__map') as HTMLDivElement;
        const params:IGoogleMapsParams = {
            zoom: 15,
            size: '300x300',
            markers: 'color:green'
        };

        const baseURL:string = 'https://maps.googleapis.com/maps/api/staticmap?';
        const latLong:string = latitude + ',' + longitude;
        const url:string = baseURL + 'center=' + latLong + '&' + util.params(params) + '|' + latLong;
        locationMap.appendChild(createLocationImage(url));
    };

    // Create `<img>` tag which contains an alt attribute and the source (url)
    // The url comes from setLocationImage
    const createLocationImage = (url: string) => {
        const locationImg = document.createElement('img');
        locationImg.alt = 'locatie';
        locationImg.src = url;

        return locationImg;
    };

    // Show location by adding a showing class (which makes it `display: block`)
    const showLocationImage = (): void => {
        const location = document.querySelector('.location') as HTMLDivElement;
        location.classList.add(showClassName);
    };

    // We can actually get rid of init, because in the return, we can do init: checkGeoSupported
    // But this is future-proof. We can add more methods to the init if we want to
    const init = (): void => checkGeoSupported();

    return {
        init: init
    }
})();



// Is this readable?
( () => prayerTimes.init() )();