# prayertimes
Daily prayer times based on geolocation, fallback location is The Hague. Made it for personal use.

In this project, I implemented the following:
* TypeScript
* [Islamic REST API](https://aladhan.com/prayer-times-api)
* HTML5 Web API: [geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
* [Google Maps Static API](https://developers.google.com/maps/documentation/maps-static/intro)
* [Revealing Module Pattern](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript)
* [Fetch Web API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), by using fetch/then/catch

## usage
* TypeScript/Browserify (install globally)
* Then execute the following command: tsc prayertimes.ts && browserify -e prayertimes.js -o main.js