Template.santaTracker.rendered = function(){
  Tracker.autorun(function () {
    if (Mapbox.loaded()) {
      L.mapbox.accessToken = "pk.eyJ1IjoidGhlbWV0ZW9yY2hlZiIsImEiOiJmelotbTdrIn0.QmNnWntI9zqeqLrxS6mRkA";
      L.mapbox.map('map', 'themeteorchef.450d4794', {
        zoom: 3,
        minZoom: 3,
        maxZoom: 6
      });
    }
  });
}
