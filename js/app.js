// Popolar attractions in Cape Town.
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
    "use strict";
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


var Location = function (data) {
    "use strict";
    var self = this;
    self.title = data.title;
    self.coordinates = data.coordinates;
};


var viewModel = function () {
    "use strict";
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

        // Ajax request to wikipedia
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
};
