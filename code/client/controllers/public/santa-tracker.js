Template.santaMap.rendered = function(){

  var setSantaLocation = function(){
    var latitude  = Session.get('santaLatitude'),
        longitude = Session.get('santaLongitude');

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
      var currentLocation = Stops.findOne({"current": true});
      if ( currentLocation ) {
        Session.set('santaLatitude',currentLocation.latitude);
        Session.set('santaLongitude',currentLocation.longitude);
        Meteor.setTimeout(function(){
          setSantaLocation();
        },500);
      }
    });
  }

  // If Mapbox is ready to rock, next we need to pass it our access token.
  L.mapbox.accessToken = "pk.eyJ1IjoidGhlbWV0ZW9yY2hlZiIsImEiOiJmelotbTdrIn0.QmNnWntI9zqeqLrxS6mRkA";

  // Last but not least, to get our map on screen, we call the L.mapbox.map
  // function, passing the value for the ID of our map's container (in this
  // case our map is literally an empty div <div id="map"></div>). We also
  // pass the Mapbox ID of the map *style* we want to use, along with some
  // configuration values that we want our map to start up with. Once the map
  // is setup, we call our loadDefaultData() function to load Santa's current
  // location onto the map.
  var map = L.mapbox.map('map', 'themeteorchef.450d4794', {
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
