var map;

// Create a new blank array for all the listing markers.
var markers = [];


var initMap = function () {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -33.9466716, lng: 18.7745458},
        zoom: 18,
        mapTypeControl: false
    });

    createMarkers(attractions);
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
    placesArray.forEach(function (location, index) {
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
var populateInfoWindow = function (marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
        infowindow.marker = marker;
        infowindow.setContent("<div>" + marker.title + "</div>");
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener("closeclick", function () {
            infowindow.marker = null;
        });

        var detailsContent = getPlacesDetails(marker, infowindow);
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        var getStreetView = function (data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position
                );
                infowindow.setContent("<div>" + marker.title + "</div><div id=\"pano\"></div>" + detailsContent);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById("pano"), panoramaOptions
                );
            } else {
                infowindow.setContent("<div>" + marker.title + "</div>" +
                "<div>No Street View Found</div>");
            }
        };

        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        console.log(infowindow.content);
        infowindow.open(map, marker);
    }
};


// This function will hide markers in the list of unwanted markers and display
// those that are not
var displayMarkers = function (markers, unwantedPlaces) {
    var bounds = new google.maps.LatLngBounds();
    markers.forEach(function (marker) {
        var isNotWanted = function (placeName) {
            return placeName === marker.title;
        };
        if (unwantedPlaces.find(isNotWanted)) {
            marker.setMap(null);
        } else {
            marker.setMap(map);
            bounds.extend(marker.position);
        }
    });
    map.fitBounds(bounds);
};

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
var makeMarkerIcon = function (markerColor) {
    var markerImage = new google.maps.MarkerImage(
        "http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|" + markerColor +
        "|40|_|%E2%80%A2",
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34)
    );
    return markerImage;
};


var toggleBounce = function (marker) {
    // Toggle bounce animation
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
};


var animateMarker = function (name) {
    // Make selected marker bounce
    markers.forEach(function (marker) {
        if (marker.title === name) {
            // make sure only one marker is bouncing at a time.
            toggleBounce(marker);
        } else {
            marker.setAnimation(null);
        }
    });
};


// This is the PLACE DETAILS search - it's the most detailed so it's only
// executed when a marker is selected, indicating the user wants more
// details about that place.
function getPlacesDetails(marker, infowindow) {
  console.log("Getting places details.");
  var query = marker.title;
  console.log("query in getPlacesDetails: " + query);
  var innerHTML = "";
  var details = textSearchPlaces(query);
  console.log(details);
  var service = new google.maps.places.PlacesService(map);
  service.getDetails({
    placeId: marker.id
  }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Set the marker property on this infowindow so it isn't created again.
      innerHTML = '<div>';
      if (place.name) {
        innerHTML += '<strong>' + place.name + '</strong>' + '<br>place_id: ' + marker.id;
      }
      if (place.formatted_address) {
        innerHTML += '<br>' + place.formatted_address;
      }
      if (place.formatted_phone_number) {
        innerHTML += '<br>' + place.formatted_phone_number;
      }
      if (place.opening_hours) {
        innerHTML += '<br><br><strong>Hours:</strong><br>' +
            place.opening_hours.weekday_text[0] + '<br>' +
            place.opening_hours.weekday_text[1] + '<br>' +
            place.opening_hours.weekday_text[2] + '<br>' +
            place.opening_hours.weekday_text[3] + '<br>' +
            place.opening_hours.weekday_text[4] + '<br>' +
            place.opening_hours.weekday_text[5] + '<br>' +
            place.opening_hours.weekday_text[6];
      }
      if (place.photos) {
        innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
            {maxHeight: 100, maxWidth: 200}) + '">';
      }
      innerHTML += '</div>';
  } else {

      innerHTML = "<div>something went wrong</div>";
  }
  // console.log(status);
  return innerHTML;
  });
}


var textSearchPlaces = function functionName(query) {
    console.log("query in textSearchPlaces: " + query);
    var bounds = map.getBounds();
    var placesService = new google.maps.places.PlacesService(map);
    var data = false;
    placesService.textSearch({
        query: query,
        bounds: bounds
    }, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
          data = results;
          console.log(data);
      } else {
          data = false;
      }
    });
    console.log(data);
    return data;
}
