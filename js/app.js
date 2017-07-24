var getWikipediaData = function (placeName) {
  // load wikipedia data
  var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + placeName + '&format=json&callback=wikiCallback';
  var wikiRequestTimeout = setTimeout(function(){
      $wikiElem.text("failed to get wikipedia resources");
  }, 8000);

  $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      jsonp: "callback",
      success: function( response ) {
          var articleList = response[1];

          for (var i = 0; i < articleList.length; i++) {
              articleStr = articleList[i];
              var url = 'http://en.wikipedia.org/wiki/' + articleStr;
              $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
          };

          clearTimeout(wikiRequestTimeout);
      }
  });
}

var Location = function (data) {
  var self = this;

  self.title = data.title;
  self.coordinates = data.coordinates;
};


var viewModel = function () {
  var self = this;
  self.searchValue = ko.observable('');

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

  self.getLocationData = function (name) {
    console.log('Getting data about: ' + name);
  }

  self.searchValue.subscribe(function () {
    self.updateLocationsList();
  });
  self.updateLocationsList();
}
