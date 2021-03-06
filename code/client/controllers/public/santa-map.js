Template.santaMap.rendered = function(){

  var setSantaLocation = function(latitude,longitude){
    // Create a Mapbox LatLng object with our passed values.
    var location = L.latLng(latitude,longitude);

    // Pan our map to the new location.
    map.panTo(location);

    // Move our marker to the new location.
    marker.setLatLng(location);
  }

  var loadDefaultData = function(){
    // Wrap our findOne and Session.set's in a Tracker.autorun so that when
    // the necessary data becomes available, we can fire our setSantaLocation()
    // function and update the map.
    Tracker.autorun(function(){
      var currentLocation = Stops.findOne({"current": true}, {fields: {"longitude": 1, "latitude": 1} });
      if ( currentLocation ) {
        Meteor.setTimeout(function(){
          setSantaLocation(currentLocation.latitude,currentLocation.longitude);
        },500);
      }
    });
  }

  // If Mapbox is ready to rock, next we need to pass it our access token.
  L.mapbox.accessToken = "<Enter Your Mapbox Public Key Here>";

  // Last but not least, to get our map on screen, we call the L.mapbox.map
  // function, passing the value for the ID of our map's container (in this
  // case our map is literally an empty div <div id="map"></div>). We also
  // pass the Mapbox ID of the map *style* we want to use, along with some
  // configuration values that we want our map to start up with. Once the map
  // is setup, we call our loadDefaultData() function to load Santa's current
  // location onto the map.
  var map = L.mapbox.map('map', '<username>.<mapId>', {
    zoom: 3,
    minZoom: 3,
    maxZoom: 6
  }).on('ready', loadDefaultData());

  // Create a Mapbox icon object to define the source image and size
  // of our Santa marker.
  var santaIcon = L.icon({
    iconUrl: '/santa-marker.svg',
    iconSize: [48,48]
  });

  // Create our marker using our Santa icon and it to the map/
  var marker = L.marker([0, 0], {
    icon: santaIcon
  }).addTo(map);
}

Template.santaMap.helpers({

  isNorthPole: function(){
    var getLocation = Stops.findOne({"current": true}, {fields: {"name": 1, "current": 1, "order": 1}});
    if ( getLocation.name == "The North Pole" && getLocation.order == 1 ) {
      Session.set('isSantaFinished', false);
      return true;
    } else if ( getLocation.name == "The North Pole" && getLocation.order == 333 ) {
      Session.set('isSantaFinished', true);
      return true;
    } else {
      return false;
    }
  },

  isSantaFinished: function(){
    return Session.get('isSantaFinished');
  }

});
