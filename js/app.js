// Sort by title. From mozilla example.
attractions.sort(function (a, b) {
    "use strict";
    let titleA = a.title.toLowerCase(); // ignore upper and lowercase
    let titleB = b.title.toLowerCase(); // ignore upper and lowercase
    if (titleA < titleB) {
        return -1;
    }
    if (titleA > titleB) {
        return 1;
    }

    return 0;
});


let Location = function (data) {
    "use strict";
    let self = this;
    self.title = data.title;
    self.state = data.state;
    self.country = data.country;
    self.coordinates = data.coordinates;
};


let ViewModel = function () {
    "use strict";
    let self = this;
    self.searchValue = ko.observable("");
    self.wikiError = ko.observable(false);
    self.wikiData = ko.observableArray([]);
    self.wikiNoResultsFound = ko.observable(false);
    self.wikiSearchMade = ko.observable(false);
    self.unwantedPlaces = [];
    self.googleError = ko.observable(false);

    self.locations = ko.observableArray([]);
    attractions.forEach(function (place) {
        self.locations.push(new Location(place));
    });

    // Build a list of locations to display in the page.
    self.updateLocationsList = function () {
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

    // Format search terms. Replace spaces with plus signs
    self.formatQuery = function (query) {
        query = query.trim();
        let result = "";
        for(let i = 0; i < query.length; i++) {
            result += query[i].replace(" ","+");
        }
        return result;
    };

    // Search for wikipedia articles about the place.
    self.getWikipediaData = function (placeName) {
        // Reset array before loading new data
        self.wikiData([]);
        self.wikiError(false);
        let query = self.formatQuery(placeName);
        console.log(query);

        // load wikipedia data
        let wikiUrl = `http://en.wikipedia.org/w/api.php?action=opensearch&search=${query}&format=json&callback=wikiCallback`;
        $.ajax({
            // ajax settings
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback"
        }).done(function (response) {
            // successful
            // Check if wikipedia search returned any results
            if (self.wikiSearchMade()) {
                self.wikiNoResultsFound(response[1].length === 0);
            }
            self.wikiData(self.formatWikiData(response));
        }).fail(function (jqXHR, textStatus) {
            // error handling
            self.wikiError(true);
        });
    };

    // Reformat Wikipedia response to make it easier to use
    // Wikipedia response is split into 3 main sections
    // Title, snippet & url
    self.formatWikiData = function (response) {
        let len = response[1].length;
        let data = [];
        for (let m = 0; m < len; m++) {
            data.push({});
        }
        for(let index = 0; index < response.length; index++) {
            let section = response[index];
            switch (index) {
                case 1:
                    for (let i = 0; i < len; i++) {
                        data[i].title = section[i];
                    }
                    // console.log(section);
                    break;
                case 2:
                    for (let j = 0; j < len; j++) {
                        data[j].snippet = section[j];
                    }
                    // console.log(section);
                break;
                case 3:
                    for (let k = 0; k < len; k++) {
                        data[k].url = section[k];
                    }
                    // console.log(section);
                    break;
                default:
                    //skip any thing else
            }
        }
        // console.log(data);
        return data;
    };


    // Get information about a place
    self.getLocationData = function (place) {
        // console.log(place);
        self.wikiSearchMade(true);
        self.getWikipediaData(place.title);
        animateMarker(place.title);
    };


    self.searchValue.subscribe(function () {
        self.updateLocationsList();
        displayMarkers(markers, self.unwantedPlaces);
    });

    // Display error message if if there is an error loading map.
    self.setGoogleError = function (status) {
        self.googleError(status);
    };
    self.updateLocationsList();
};


let viewModel = new ViewModel();

// Delay the initialization of ViewModel until the page has loaded.
// Solves the error I was getting below
// https://stackoverflow.com/questions/15090015/why-am-i-getting-a-cannot-read-property-nodetype-of-null-error-with-knockout
$(document).ready(function() {
    ko.applyBindings(viewModel);
});
