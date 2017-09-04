// Sort by title. From mozilla example.
attractions.sort((a, b) => {
    "use strict";
    const titleA = a.title.toLowerCase(); // ignore upper and lowercase
    const titleB = b.title.toLowerCase(); // ignore upper and lowercase
    if (titleA < titleB) {
        return -1;
    }
    if (titleA > titleB) {
        return 1;
    }
    return 0;
});


class Location {
    constructor (data) {
        "use strict";
        const self = this;
        self.title = data.title;
        self.state = data.state;
        self.country = data.country;
        self.coordinates = data.coordinates;
    }
}

class ViewModel {
    constructor() {
        const self = this;
        self.searchValue = ko.observable("");
        self.wikiError = ko.observable(false);
        self.wikiData = ko.observableArray([]);
        self.wikiNoResultsFound = ko.observable(false);
        self.wikiSearchMade = ko.observable(false);
        self.unwantedPlaces = [];
        self.googleError = ko.observable(false);
        self.locations = ko.observableArray([]);

        attractions.forEach((place) => {
            self.locations.push(new Location(place));
        });

        self.searchValue.subscribe(() => {
            self.updateLocationsList();
            displayMarkers(markers, self.unwantedPlaces);
        });


        // Build a list of locations to display in the page.
        self.updateLocationsList = () => {
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

        // Search for wikipedia articles about the place.
        self.getWikipediaData = (placeName) => {
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

        // Get information about a place
        self.getLocationData = (place) => {
            // console.log(place);
            self.wikiSearchMade(true);
            self.getWikipediaData(place.title);
            animateMarker(place.title);
        };

        self.updateLocationsList();
    }

    // Format search terms. Replace spaces with plus signs
    formatQuery(query) {
        query = query.trim();
        let result = "";
        for(let i = 0; i < query.length; i++) {
            result += query[i].replace(" ","+");
        }
        return result;
    }

    // Reformat Wikipedia response to make it easier to use
    // Wikipedia response is split into 3 main sections
    // Title, snippet & url
    formatWikiData(response) {
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
    }

    // Display error message if if there is an error loading map.
    setGoogleError(status) {
        this.googleError(status);
    }
}


const viewModel = new ViewModel();

// Delay the initialization of ViewModel until the page has loaded.
// Solves the error I was getting below
// https://stackoverflow.com/questions/15090015/why-am-i-getting-a-cannot-read-property-nodetype-of-null-error-with-knockout
$(document).ready(() => {
    ko.applyBindings(viewModel);
});
