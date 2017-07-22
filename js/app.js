var Location = function (data) {
  var self = this;

  self.title = data.title;
  self.coordinates = data.coordinates;
};


var viewModel = function () {
  var self = this;

  self.locations = ko.observableArray([]);
  LOCATIONS.forEach(function (place) {
    self.locations.push(new Location(place))
  });
}
