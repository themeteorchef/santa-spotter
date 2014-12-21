/*
* Routes: Public
* Routes that are visible to all (public) users.
*/


Router.route('index', {
  path: '/',
  template: 'santaTracker',
  waitOn: function(){
    Meteor.subscribe('santaStops');
  }
});
