Template.santaTracker.rendered = function(){
  // Wrap our Mapbox setup in a Tracker.autorun() call so that once
  // Mapbox.loaded() is true, our map is displayed on the template.
  Tracker.autorun(function () {
    if (Mapbox.loaded()) {
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

      /*
        TODO:
        1. Get list of locations/stops with Latitude & Longitude.
        2. Write a loader to pull locations/stops into database.
        3. Write a Chron Job to start Santa at 11am UTC (UTC +13, Tonga Time).
        4. Over the course of a full day, move Santa every 5 minutes. // 24 hours = 1,440 minutes / ~280 stops = ~5 minutes per stop.
        5. Track the server connection of Meteor.
        6. If Meteor disconnects/reconnects, setup function to restart Chron Job.
        7. Profit.
      */

      // Define our GeoJSON line. GeoJSON is a specification that allows us to
      // quickly and consistently plot out different geometry on our map. Here,
      // we want to create a path for Santa Claus to follow, so we setup the
      // style of our line and pass an array of coordinates (each coordinate is
      // a two-number array itself). Note that we're pulling in our coordinates
      // from a Mongo collection so that we can decide the starting point if
      // our server goes down.
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
            coordinates: [
              [178.4416667, -18.14138889],
              [174.7633315, -36.8484597],
              [174.776236, -41.2864603],
              [172.633333, -43.533333],
              [166.45, -22.2666667],
              [168.3216667, -17.73555556],
              [159.95, -9.4333333],
              [158.65, 53.0166667],
              [147.333333, -42.916667],
              [144.966667, -37.816667],
              [151.2166667, -33.88305556]
            ]
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

      // Create a marker and add it to the map.
      var marker = L.marker([0, 0], {
        icon: L.mapbox.marker.icon({
          'marker-color': '#f86767'
        })
      }).addTo(map);

      // Start movement of marker.
      tick();

      // Define function to handle movement of marker.
      function tick() {
          // Set the marker to be at the same point as one
          // of the segments or the line.
          var latLng = L.latLng(
            geojson.features[0].geometry.coordinates[j][1],
            geojson.features[0].geometry.coordinates[j][0]
          )
          marker.setLatLng(latLng);

          //map.panTo(latLng);

          // Move to the next point of the line
          // until `j` reaches the length of the array.
          if (++j < geojson.features[0].geometry.coordinates.length) setTimeout(tick, 5000);
      }

    } // end if Mapbox.loaded()
  });
}
