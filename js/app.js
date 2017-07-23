var Location = function (data) {
  var self = this;

  self.title = data.title;
  self.coordinates = data.coordinates;
};


var viewModel = function () {
  var self = this;
  self.searchValue = ko.observable('');

  self.locations = ko.observableArray([]);
  LOCATIONS.forEach(function (place) {
    self.locations.push(new Location(place));
  });

  self.updateLocationsList = function () {
    // Build a list of locations to display in the page.

    self.locations([]);
    LOCATIONS.forEach(function (place) {
      var addItem = true;
      if ((place.title.toLowerCase().indexOf(self.searchValue().toLowerCase()) > -1) || (self.searchValue().length === 0)) {
        self.locations.push(new Location(place));
      }
    });
  }


  self.searchValue.subscribe(function () {
    self.updateLocationsList();
  });
  self.updateLocationsList();
}
