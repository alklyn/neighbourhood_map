
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
  self.wikiDataNotFound = ko.observable(false);
  self.wikiSearchMade = ko.observable(false);

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

  self.getWikipediaData = function (place) {
    // Reset array before loading new data
      self.wikiData([]);
      self.wikiError(false);

    // load wikipedia data
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + place + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){
        self.wikiError(true);
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
          console.log('Num results: ' + response[1].length);
          console.log('Search made: ' + self.wikiSearchMade());
          if (self.wikiSearchMade()) {
            self.wikiDataNotFound(response[1].length === 0);
          }

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
      self.wikiSearchMade(true);
      self.getWikipediaData(place.title);
  }

  self.searchValue.subscribe(function () {
    self.updateLocationsList();
  });
  self.updateLocationsList();

}
