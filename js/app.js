
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
  self.wikiNoResultsFound = ko.observable(false);
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
          // Check if wikipedia search returned any results
          if (self.wikiSearchMade()) {
            self.wikiNoResultsFound(response[1].length === 0);
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

// Popolar attractions in Cape Town.
var attractions = [
  {title: 'Table mountain', coordinates: {lat: -33.962822, lng: 18.4076519}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Cape of Good Hope', coordinates: {lat: -34.3568425, lng: 18.4739882}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Two Oceans Aquarium', coordinates: {lat: -33.9080317, lng: 18.4176607}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Victoria and Alfred Waterfront', coordinates: {lat: -33.90363, lng: 18.420529}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Boulders Beach', coordinates: {lat: -34.192783, lng: 18.4327457}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Robben Island', coordinates: {lat: -33.8076073, lng: 18.3712309}, state: 'Western Cape', country: 'South Africa'},
  {title: 'World of Birds Wildlife Sanctuary and Monkey Park', coordinates: {lat: -34.016799, lng: 18.36196}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Camps Bay Beach', coordinates: {lat: -33.9506605, lng: 18.3776413}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Constantia', coordinates: {lat: -34.0276319, lng: 18.396417}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Hottentots Holland Nature Reserve', coordinates: {lat: -34.0334007, lng: 19.0632778}, state: 'Western Cape', country: 'South Africa'},
  {title: 'GrandWest Casino and Entertainment World', coordinates: {lat: -33.9177148, lng: 18.547582}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Kirstenbosch National Botanical Garden', coordinates: {lat: -33.9875011, lng: 18.432722}, state: 'Western Cape', country: 'South Africa'},
  {title: 'Platteklip Gorge', coordinates: {lat: -33.9613302, lng: 18.4087109}, state: 'Western Cape', country: 'South Africa'},
  {title: 'The Cape Wheel', coordinates: {lat: -33.9053211, lng: 18.4199256}, state: 'Western Cape', country: 'South Africa'}
];


// Sort by title. From mozilla example.
attractions.sort(function(a, b) {
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

// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;

// Flag set if markers are made visible
var visible = true;

// Create a new blank array for all the listing markers.
var markers = [];

// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

var initMap = function () {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.9466716, lng: 18.7745458},
    zoom: 18,
    mapTypeControl: false
  });

  createMarkers(attractions)
  showMarkers(markers);
};

var createMarkers = function (placesArray) {
  var largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('fa1a0a');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('0a0aBB');

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
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  });
};


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
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
          infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

    infowindow.open(map, marker);
  }
}


// This function will loop through the markers array and display them all.
var showMarkers = function (markers) {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  markers.forEach (function (marker) {
    marker.setMap(map);
    bounds.extend(marker.position);
  });
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
var hideMarkers = function () {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}
