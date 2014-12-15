Template.santaTracker.rendered = function(){
  Tracker.autorun(function () {
    if (Mapbox.loaded()) {
      L.mapbox.accessToken = "pk.eyJ1IjoidGhlbWV0ZW9yY2hlZiIsImEiOiJmelotbTdrIn0.QmNnWntI9zqeqLrxS6mRkA";
      var map = L.mapbox.map('map', 'themeteorchef.450d4794', {
        zoom: 3,
        minZoom: 3,
        maxZoom: 6
      });

      // Generate a GeoJSON line. You could also load GeoJSON via AJAX
      // or generate it some other way.
      var geojson = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: {
            color: "#0099ff",
            weight: 10,
            opacity: 0.3
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [69.1833344, 34.5166667],
              [-83.5552139, 41.6639383],
              [-122.4194183, 37.7749295]
            ]
          }
        }]
      };

      // Add this generated geojson object to the map.
      L.geoJson(geojson).addTo(map);

      // Create a counter with a value of 0.
      var j = 0;

      // Create a marker and add it to the map.
      var marker = L.marker([0, 0], {
        icon: L.mapbox.marker.icon({
          'marker-color': '#f86767'
        })
      }).addTo(map);

      tick();
      function tick() {
          // Set the marker to be at the same point as one
          // of the segments or the line.
          marker.setLatLng(L.latLng(
              geojson.features[0].geometry.coordinates[j][1],
              geojson.features[0].geometry.coordinates[j][0]));

          // Move to the next point of the line
          // until `j` reaches the length of the array.
          if (++j < geojson.features[0].geometry.coordinates.length) setTimeout(tick, 1000);
      }

    } // end if Mapbox.loaded()
  });
}
