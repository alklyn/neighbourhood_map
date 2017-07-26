// Popolar attractions in Cape Town.
"use strict";
var attractions = [
    {title: "Table mountain", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.962822, lng: 18.4076519}},
    {title: "Cape of Good Hope", state: "Western Cape", country: "South Africa", coordinates: {lat: -34.3568425, lng: 18.4739882}},
    {title: "Two Oceans Aquarium", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.9080317, lng: 18.4176607}},
    {title: "Victoria and Alfred Waterfront", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.90363, lng: 18.420529}},
    {title: "Boulders Beach", state: "Western Cape", country: "South Africa", coordinates: {lat: -34.192783, lng: 18.4327457}},
    {title: "Robben Island", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.8076073, lng: 18.3712309}},
    {title: "World of Birds Wildlife Sanctuary and Monkey Park", state: "Western Cape", country: "South Africa", coordinates: {lat: -34.016799, lng: 18.36196}},
    {title: "Camps Bay Beach", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.9506605, lng: 18.3776413}},
    {title: "Constantia", state: "Western Cape", country: "South Africa", coordinates: {lat: -34.0276319, lng: 18.396417}},
    {title: "Hottentots Holland Nature Reserve", state: "Western Cape", country: "South Africa", coordinates: {lat: -34.0334007, lng: 19.0632778}},
    {title: "GrandWest Casino and Entertainment World", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.9177148, lng: 18.547582}},
    {title: "Kirstenbosch National Botanical Garden", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.9875011, lng: 18.432722}},
    {title: "Platteklip Gorge", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.9613302, lng: 18.4087109}},
    {title: "The Cape Wheel", state: "Western Cape", country: "South Africa", coordinates: {lat: -33.9053211, lng: 18.4199256}}
];


// Sort by title. From mozilla example.
attractions.sort(function (a, b) {
    var titleA = a.title.toLowerCase(); // ignore upper and lowercase
    var titleB = b.title.toLowerCase(); // ignore upper and lowercase
    if (titleA < titleB) {
        return -1;
    }
    if (titleA > titleB) {
        return 1;
    }

    return 0;
});


var map;

// Create a new blank array for all the listing markers.
var markers = [];


var Location = function (data) {
    var self = this;
    self.title = data.title;
    self.coordinates = data.coordinates;
};


var viewModel = function () {
    var self = this;
    self.searchValue = ko.observable("");
    self.wikiError = ko.observable(false);
    self.wikiData = ko.observableArray([]);
    self.wikiNoResultsFound = ko.observable(false);
    self.wikiSearchMade = ko.observable(false);
    self.unwantedPlaces = [];

    self.locations = ko.observableArray([]);
    attractions.forEach(function (place) {
        self.locations.push(new Location(place));
    });

    self.updateLocationsList = function () {
        // Build a list of locations to display in the page.

        self.locations([]);
        self.unwantedPlaces = [];
        attractions.forEach(function (place) {
            if ((place.title.toLowerCase().indexOf(self.searchValue().toLowerCase()) > -1) || (self.searchValue().length === 0)) {
                self.locations.push(new Location(place));
            } else {
                // save a list of names of unwanted locations
                self.unwantedPlaces.push(place.title);
            }
        });
    };

    self.getWikipediaData = function (place) {
        // Reset array before loading new data
        self.wikiData([]);
        self.wikiError(false);

        // load wikipedia data
        var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + place + "&format=json&callback=wikiCallback";
        var wikiRequestTimeout = setTimeout(function () {
            self.wikiError(true);
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback",
            success: function (response) {
                // Check if wikipedia search returned any results
                if (self.wikiSearchMade()) {
                    self.wikiNoResultsFound(response[1].length === 0);
                }

                response[1].forEach(function (title) {
                    var url = "https://en.wikipedia.org/wiki/" + title;
                    self.wikiData.push({title: title, url: url});
                });

                clearTimeout(wikiRequestTimeout);
            }
        });
    };

    self.getLocationData = function (place) {
        // Search for info about the place
        self.wikiSearchMade(true);
        self.getWikipediaData(place.title);
        animateMarker(place.title);
    };

    self.searchValue.subscribe(function () {
        self.updateLocationsList();
        displayMarkers(markers, self.unwantedPlaces);
    });
    self.updateLocationsList();
}


var initMap = function () {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -33.9466716, lng: 18.7745458},
        zoom: 18,
        mapTypeControl: false
    });

    createMarkers(attractions)
    displayMarkers(markers, []);
};

var createMarkers = function (placesArray) {
// Reset markers array

var largeInfowindow = new google.maps.InfoWindow();

// Style the markers a bit. This will be our listing marker icon.
var defaultIcon = makeMarkerIcon("fa1a0a");

// Create a "highlighted location" marker color for when the user
// mouses over the marker.
var highlightedIcon = makeMarkerIcon("0a0aBB");

// The following group uses the location array to create an array of markers on initialize.
placesArray.forEach (function (location, index) {
// Create a marker per location, and put into markers array.
var marker = new google.maps.Marker({
position: location.coordinates,
title: location.title,
animation: google.maps.Animation.DROP,
id: index
});

// Push the marker to our array of markers.
markers.push(marker);
// Create an onclick event to open an infowindow at each marker.
marker.addListener("click", function () {
populateInfoWindow(this, largeInfowindow);
});
// Two event listeners - one for mouseover, one for mouseout,
// to change the colors back and forth.
marker.addListener("mouseover", function () {
this.setIcon(highlightedIcon);
});
marker.addListener("mouseout", function () {
this.setIcon(defaultIcon);
});
});
};


// This function populates the infowindow when the marker is clicked. We"ll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
// Check to make sure the infowindow is not already opened on this marker.
if (infowindow.marker != marker) {
infowindow.marker = marker;
infowindow.setContent("<div>" + marker.title + "</div>");
// Make sure the marker property is cleared if the infowindow is closed.
infowindow.addListener("closeclick", function () {
infowindow.marker = null;
});

var streetViewService = new google.maps.StreetViewService();
var radius = 50;
// In case the status is OK, which means the pano was found, compute the
// position of the streetview image, then calculate the heading, then get a
// panorama from that and set the options
function getStreetView(data, status) {
if (status == google.maps.StreetViewStatus.OK) {
var nearStreetViewLocation = data.location.latLng;
var heading = google.maps.geometry.spherical.computeHeading(
nearStreetViewLocation, marker.position);
infowindow.setContent("<div>" + marker.title + "</div><div id=\"pano\"></div>");
var panoramaOptions = {
position: nearStreetViewLocation,
pov: {
heading: heading,
pitch: 30
}
};
var panorama = new google.maps.StreetViewPanorama(
document.getElementById("pano"), panoramaOptions);
} else {
infowindow.setContent("<div>" + marker.title + "</div>" +
"<div>No Street View Found</div>");
}
}
// Use streetview service to get the closest streetview image within
// 50 meters of the markers position
streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

infowindow.open(map, marker);
}
}


// This function will hide markers in the list of unwanted markers and display
// those that are not
var displayMarkers = function (markers, unwantedPlaces) {
var bounds = new google.maps.LatLngBounds();
markers.forEach(function (marker) {
var isNotWanted = function (placeName) {
return placeName === marker.title;
}
if (unwantedPlaces.find(isNotWanted)) {
marker.setMap(null);
}
else {
marker.setMap(map);
bounds.extend(marker.position);
}
});
map.fitBounds(bounds);
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
var markerImage = new google.maps.MarkerImage(
"http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|"+ markerColor +
"|40|_|%E2%80%A2",
new google.maps.Size(21, 34),
new google.maps.Point(0, 0),
new google.maps.Point(10, 34),
new google.maps.Size(21,34));
return markerImage;
}


var toggleBounce = function (marker) {
// Toggle bounce animation
if (marker.getAnimation() !== null) {
marker.setAnimation(null);
} else {
marker.setAnimation(google.maps.Animation.BOUNCE);
}
}


var animateMarker = function (name) {
// Make selected marker bounce
markers.forEach(function (marker) {
if (marker.title === name) {
// make sure only one marker is bouncing at a time.
toggleBounce(marker);
}
else {
marker.setAnimation(null);
}
});
}
