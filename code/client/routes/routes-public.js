/*
* Routes: Public
* Routes that are visible to all (public) users.
*/

Router.route('index', {
  path: '/',
  template: 'santaTracker',
  waitOn: function(){
    // Subscribe to our Stops collection to pull in Santa's current location.
    Meteor.subscribe('santaStops');
  }
});
