Template.santaTracker.rendered = function(){
  Tracker.autorun(function () {
    if (Mapbox.loaded()) {
      L.mapbox.accessToken = "pk.eyJ1IjoidGhlbWV0ZW9yY2hlZiIsImEiOiJmelotbTdrIn0.QmNnWntI9zqeqLrxS6mRkA";
      var map = L.mapbox.map('map', 'themeteorchef.kdnbci0g');
    }
  });
}
