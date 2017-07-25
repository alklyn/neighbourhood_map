
var Location = function (data) {
  var self = this;

  self.title = data.title;
  self.coordinates = data.coordinates;
};


var viewModel = function () {
  var self = this;
  self.searchValue = ko.observable('');
  self.wikiError = ko.observable(false);
  self.wikiData = ko.observableArray([]);

  self.locations = ko.observableArray([]);
  attractions.forEach(function (place) {
    self.locations.push(new Location(place));
  });

  self.updateLocationsList = function () {
    // Build a list of locations to display in the page.

    self.locations([]);
    self.filteredLocations = [];
    attractions.forEach(function (place) {
      var addItem = true;
      if ((place.title.toLowerCase().indexOf(self.searchValue().toLowerCase()) > -1) || (self.searchValue().length === 0)) {
        self.locations.push(new Location(place));
        self.filteredLocations.push(place);
      }
    });
  }

  self.getWikipediaData = function (place, state, country) {
    // Reset array before loading new data
      self.wikiData([]);

    // load wikipedia data
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + placeName + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){
        self.wikiError(true);
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
            response[1].forEach(function (title) {
              var url = 'https://en.wikipedia.org/wiki/' + title;
              self.wikiData.push({title: title, url: url});
            });

            clearTimeout(wikiRequestTimeout);
        }
    });
  }

  self.getLocationData = function (place) {
      console.log('Getting data about: ' + place.title);
      self.getWikipediaData(place.title, place.state, place.country);
  }

  self.searchValue.subscribe(function () {
    self.updateLocationsList();
  });
  self.updateLocationsList();

}
