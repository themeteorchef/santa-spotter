Template.santaTracker.rendered = function(){
  // Wrap our Mapbox setup in a Tracker.autorun() call so that once
  // Mapbox.loaded() is true, our map is displayed on the template.

  Tracker.autorun(function () {
    var coordinatesArray = [],
        santaStops       = Stops.find().fetch();

    if( santaStops ){

      for(i=0; i < santaStops.length; i++){
        coordinatesArray.push( [ santaStops[i].longitude, santaStops[i].latitude ] );
      }

      if ( Mapbox.loaded() && coordinatesArray.length == 224 ) {
        // If Mapbox loads as expected, pass it our accessToken, along with the
        // details of our map. Note: you'll need to setup a map via mapbox.com in
        // order to get the token (themeteorchef.450d4794). This is unique to an
        // individual map.
        L.mapbox.accessToken = "pk.eyJ1IjoidGhlbWV0ZW9yY2hlZiIsImEiOiJmelotbTdrIn0.QmNnWntI9zqeqLrxS6mRkA";
        var map = L.mapbox.map('map', 'themeteorchef.450d4794', {
          zoom: 3,
          minZoom: 3,
          maxZoom: 6
        });

        var geojson = {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            properties: {
              color: "#0099ff",
              weight: 8,
              opacity: 0
            },
            geometry: {
              type: "LineString",
              coordinates: coordinatesArray
            }
          }]
        };

        // Add this generated geojson object to the map.
        L.geoJson(geojson, {
          style: function(feature) {
            return feature.properties
          }
        }).addTo(map);

        // Create a counter with a value of 0.
        var j = 0;

        // Create a custom icon with Santa's head.
        var santaIcon = L.icon({
          iconUrl: '/santa-marker.svg',
          iconSize: [48,48]
        });

        // Create a marker and add it to the map.
        var marker = L.marker([0, 0], {
          icon: santaIcon
        }).addTo(map);

        function randomIntFromInterval(min,max){
          return Math.floor(Math.random()*(max-min+1)+min);
        }

        // Define function to handle movement of marker.
        function tick() {
          // Set the marker to be at the same point as one
          // of the segments or the line.
          var latLng = L.latLng(
            geojson.features[0].geometry.coordinates[j][1],
            geojson.features[0].geometry.coordinates[j][0]
          )

          map.panTo(latLng);
          marker.setLatLng(latLng);
          var markerStyle = marker._icon.attributes[3].value;
          $('.beacon').attr('style', markerStyle);


          // Move to the next point of the line
          // until `j` reaches the length of the array.
          if (++j < geojson.features[0].geometry.coordinates.length){
            setTimeout(tick, randomIntFromInterval(2500,5000));
          }
        }

        // Start movement of marker.
        setTimeout(function(){
          tick();

          $('.leaflet-marker-icon').after('<div class="beacon"></div>');
        }, 1000);

      } // end if Mapbox.loaded()
    }
  });
}
