Before we get started, I should note that this recipe is a little different than what we've covered so far. Being that Christmas is only a few days away, it seemed like a fun opportunity to create something that was a little more "seasonal." The techniques you'll learn will apply indefinitely, but keep in mind that **the demo we'll create is designed to be real time**.

After December 25th, we won't be tracking Santa any longer, so the demo will be more or less idle. If you read this after Christmas, keep in mind that everything is relevant, but if you want to see everything in action, make sure to [clone a copy of the source](https://github.com/themeteorchef/santa-tracker/) and adjust the timing of the cron jobs (more on this later) to get Santa moving! If you get stuck, you're more than welcome to post a comment here or send me an email to [help@themeteorchef.com](mailto:help@themeteorchef.com).

### Getting Started
In order to get Santa moving on the map, we need to make sure we have a way to load a map into our interface as well as a way to "time" his movements. Let's take a look at what we need to get going.

<p class="block-header">Terminal</p>
```.lang-bash
meteor add trepafi:mapbox
```
We'll make use of the [`trepafi:mapbox`](https://atmospherejs.com/trepafi/mapbox) package to gain access to the [Mapbox.js API (at v2.1.4)](https://www.mapbox.com/mapbox.js/api/v2.1.4/). This is what we'll use to actually generate our map and keep track of Santa's location.

<p class="block-header">Terminal</p>
```.lang-bash
meteor add percolate:synced-cron
```
Because we need to stay in sync with Santa's sleigh, we'll need the ability to fire functions _at a specific time_. The [`percolate:synced-cron`](https://atmospherejs.com/percolate/synced-cron) package will allow us to setup a pair of "jobs" that can be run at a later time and help to track Santa.

<div class="note">
  <h3>A quick note</h3>
  <p>This recipe relies on several other packages that come as part of <a href="https://github.com/themeteorchef/base">Base</a>, the boilerplate kit used here on The Meteor Chef. The packages listed above are merely additions to the packages that are included by default in the kit. Make sure to reference the <a href="https://github.com/themeteorchef/base#packages-included">Packages Included</a> list for Base to ensure you have fulfilled all of the dependencies.</p>  
</div>

#### Signing Up For Mapbox
The service that we'll use for handling our map, Mapbox, requires that you sign up for an account. This is because Mapbox hosts the actual style for our map and we request it via an API key (explained below). To get setup with Mapbox, header over to [their home page](https://www.mapbox.com/) and click "Sign up" in the top right. Also, make sure to [download a copy of their desktop application Mapbox Studio](https://www.mapbox.com/mapbox-studio). This is what you will use to style your map.

Once you've [downloaded Studio and setup a map](https://www.mapbox.com/mapbox-studio), you can publish it to the Mapbox website by selecting the "Settings" option from the left-hand menu of the application (this is the desktop app, here) and clicking the blue "Upload to Mapbox" button. Note: the Map ID they display is the same Map ID that you'll make use of below when we configure Mapbox, so jot it down.

Make sure to reference all of [Mapbox's documentation](https://www.mapbox.com/mapbox.js/api/v2.1.4/). We'll skim the surface here but they have a lot to offer, so spend some time poking around.

### Setting Up Santa's Location Data

In order to track Santa, we'll need to pull from some sort of data set. Because Santa Claus is somewhat of a security nut (fair, considering his profile and all), he's asked that we use some _sample_ data in our recipe. We've hooked up the demo to his Sleigh's API, but what you'll see here is merely an example of what he's beaming down to us. Cool? Cool. Alright, how do we find out where santa is?

#### Loading Our Data

First, we need to populate our database with Santa's pre-approved sample data.

<p class="block-header">/server/_santa-stops.js</p>
```.lang-javascript
SANTA_STOPS = [
  {
    "order":1,
    "name":"The North Pole",
    "longitude":0,
    "latitude":90,
    "current":true
  },
  [...]
  {
    "order":333,
    "name":"The North Pole",
    "longitude":0,
    "latitude":90,
    "current":true
  }
]
```

Our dataset is simply an array of objects (stops) assigned to a global `SANTA_STOPS` variable. Note that the structure of our data calls for five keys, all of which should be self explanatory except for `current`. The `current` key is what we will use to set Santa's current position (remember, our demo is hooked up to Santa's API but locally we have to fudge it). Let's take a look at how to get our data _into_ the database.

<p class="block-header">/server/startup.js</p>
```.lang-javascript
Meteor.startup(function(){
  var stops = SANTA_STOPS;
  for(i=0; i < stops.length; i++){
    var stop      = stops[i],
        checkStop = Stops.findOne({"order": stop.order});
    if( !checkStop ){
      Stops.insert(stop);
    }
  }
});
```

Fairly spartan. All we're doing here is assigning our global `SANTA_STOPS` variable to a local `stops` variable and then iterating on it in a `for()` loop. For each stop, we simply look for the `order` value in our `Stops` collection (defined for us already in `/collections/stops.js`). If it doesn't already exist, we insert it.

<div class="note">
  <h3>A quick note</h3>
  <p>We're pulling from the order value here because we'll be checking for which of our stops is the North Pole later on. Depending on the nature of the data in your own application (i.e. if your data is dynamic), you'll probably want to look at a unique ID value or a unique name value. <a href="http://i.imgur.com/IW8simF.gif">The more you know</a>.</p>
</div>

### Publishing & Subscribing to Our Data

So our data is loaded up, but we need to control the flow a little bit. To make sure we're sending the right pieces down the wire, we need to _publish_ it from the server and _subscribe_ to it on the client.

<p class="block-header">/server/publications.js</p>
```.lang-javascript
Meteor.publish('santaStops', function(){
  return Stops.find({"current": true}, {fields: {
      "current": 1,
      "longitude": 1,
      "latitude": 1,
      "name": 1,
      "order": 1
    }
  });
});
```

Very simple. Here we define our publication as `santaStops`, returning the result of a `find()` lookup for documents where `current` is equal to `true`. Pay attention! We are _not_ returning every single documet (Santa stop) in our database: only the one we need. In addition to that, we're also specifying only the fields we need. But wait...you've specified every field the object would have?

Busted! You're right. I've done this here as a reminder that it's important to always consider _what_ data you're sending down the wire. Even though we will make use of everything here, being explicit means we can avoid unwanted data publishing mistakes later. Let's see how we're making use of our publication over on the client.

<p class="block-header">/client/routes/routes-public.js</p>
```.lang-javascript
Router.route('index', {
  path: '/',
  template: 'santaTracker',
  waitOn: function(){
    Meteor.subscribe('santaStops');
  }
});
```

Here, we're keeping things nice and simple. Making use of [Iron Router's `waitOn` option](https://github.com/EventedMind/iron-router/blob/devel/Guide.md#the-waiton-option) we simply pass our subscription `Meteor.subscribe('santaStops');`. Now whenever we visit our `/` index route, Iron Router will pause to subscribe to this data. Once it has it, it will continue loading and display the map to the user. [Sweet](http://youtu.be/EFFqwFv6j-Y?t=7s)!

### Setting Up Santa's Map

Before we start tracking Santa, we'll need to setup our map to actually plot _where_ he's visiting. To do this, we're going to make use of the `trepafi:mapbox` package to give us access to Mapbox. Wait...what the heck is Mapbox?

[Mapbox](http://mapbox.com) is a library and series of tools that allow you to design and implement custom maps. It relies on data from OpenStreetMap and other sources to create really slick, interactive maps. We're going to use Mapbox to do two things: create our world map and plot Santa _on that map_. The first thing we need to do, then, is initialize our map and get it on screen.

#### Creating a Template to House Our Map
Getting our template setup is ridiculously easy. First, we need to create a template that includes a `<div>` where we can tell Mapbox to load our map:

<p class="block-header">/client/views/_santa-map.html</p>
```.lang-markup
<template name="santaMap">
  <div class="santa-north-pole {{#if isNorthPole}}active{{/if}}">
    {{#if isSantaFinished}}
      <h3>Santa is back at the North Pole for the year! Merry Christmas :)</h3>
    {{else}}
      <h3>Santa hasn't left the North Pole yet! Hang in there :)</h3>
    {{/if}}
  </div>
  <div id="map"></div>
</template>
```

So we've got a few things going on here. First, we want to pay attention to the line at the bottom of our template `<div id="map"></div>`. This empty `<div>` is what we will tell Mapbox to target as the home for our map. What's unique about this is that we're using `id="map"`, meaning we will tell Mapbox to look for an element in our application where the `id` is equal to "map."

In addition to our map `<div>`, we've also included a div classed with `santa-north-pole` where we'll display two `<h3>` tags that contain a message about Santa's current status. Here, we're making use of Handlebar's `{{if}}` and `{{else}}` template conditionals to look at two template helpers we've setup: `{{isNorthPole}}` and `{{isSantaFinished}}`.

<p class="block-header">/client/controllers/public/santa-map.js</p>
```.lang-javascript
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
```

This helper allows us to check whether Santa has left his workshop to deliver presents, or, if he's all done and back at the North Pole. We do this because both the first _and_ last stop on Santa's list is the North Pole. Using a helper, `isNothPole` above, we can determine _which_ North Pole stop we're at.

First, we grab Santa's current location by looking at the `Stops` collection we setup earlier. Note: we're doing a lookup on the collection for one record that has its `current` key equal to true. We do this because when we setup our timing for Santa's location, we'll be changing the state of the `current` key to mark Santa's current position.

To toggle our `{{if isNorthPole}}` statement accordingly (that adds an `.active` class to our `santa-north-pole` div above), we test our `name` and `order` values. If `name` is equal to "The North Pole" and our current stop's order is `1`, we set a Session variable `isSantaFinished` to false (meaning, no, this is not the last stop) and return true (so our template renders the `.active` class on our `<div>` making it visible on screen).

Conversely, if our first test doesn't get a match, we do an `else if` to check that `name` is equal to "The North Pole" and `order` is equal to `333`, setting `isSantaFinished` to `true` and returning the same to our template (hiding our message from the screen).

Note that we're making an assumption here. In our case, we know the number of both the first and last stop. If this were an app using dynamic data, we'd likely need to do some counting on our collection to find the _total_ number of items. Here, though, we're certain that our first North Pole stop is at position `1` and our last is at position `333`.

Lastly, we create an additional helper `isSantaFinished` and set it equal to our `isSantaFinished` Session variable. Keep in mind these two names _do not_ need to be identical and we're only doing this for simplicity here. Now when we update `isSantaFinished`, we can return that value to our template, displaying the appropriate message based on Santa's location. Neat!

#### Configuring Mapbox

Now that we have a place for our map to go (our `<div id="map"></div>`), we need to configure Mapbox to get everything up and running. There are a few parts to this, so we'll step through each to make sure the process is clear.

We'll start by wrapping all of our Mapbox configuration work in the `rendered` callback of our `santaMap` template:

<p class="block-header">/client/controllers/public/santa-map.js</p>
```.lang-javascript
Template.santaMap.rendered = function(){
  L.mapbox.accessToken = "<Obtain your access token by signing up at http://mapbox.com.>";

  var map = L.mapbox.map('map', 'username.mapId', {
    zoom: 3,
    minZoom: 3,
    maxZoom: 6
  }).on('ready', loadDefaultData());

  var santaIcon = L.icon({
    iconUrl: '/santa-marker.svg',
    iconSize: [48,48]
  });

  var marker = L.marker([0, 0], {
    icon: santaIcon
  }).addTo(map);
}
```

There are a few distinct parts here. First, we're identifying our application with Mapbox by passing our `accessToken` to `L.mapbox.accessToken`. This is done because our map's style is hosted by Mapbox and they need a way to know whether we're "allowed" to access our map (i.e. a random person can't embed our map style and rack up page views on our bill).

Next, we actually define our map using `L.mapbox.map` and pass a few arguments. `map` is equal to the `id="map"` we set on our div earlier. The second value is equal to the ID of the Mapbox map style we'd like to use. The third value (the object containing `zoom`, `minZoom`, and `maxZoom`) is a set of default values to help us configure the viewport of our map when it loads.

Lastly, we make use of the `.on('ready')` method provided by mapbox so that we can call a callback function once our map is loaded. Let's take a look at the `loadDefaultData()` function we're calling here to see what it's doing for us.

<p class="block-header">/client/controllers/public/santa-map.js</p>
```.lang-javascript
var loadDefaultData = function(){
  Tracker.autorun(function(){
    var currentLocation = Stops.findOne({"current": true}, {fields: {"longitude": 1, "latitude": 1} });
    if ( currentLocation ) {
      Meteor.setTimeout(function(){
        setSantaLocation(currentLocation.latitude, currentLocation.longitude);
      },500);
    }
  });
}
```

Woah smokies! What the heck is this? Because we're relying on map data that's stored in our database (and is being updated in realtime), we need a way to keep our map updated. Here in our `loadDefaultData` function, we're wrapping two things in a `Tracker.autorun()` function: a lookup on the `Stops` collection to get Santa's _current_ location and wrapping _another_ function `setSantaLocation` in a `setTimeout` callback. [Pump the brakes, dude](http://i68.photobucket.com/albums/i14/marchtrpt4bhs/GIFs/tumblr_liqpes24YQ1qacp1m.gif)!

Deep breaths. This isn't as scary as it seems. First, why are we wrapping all of this in a `Tracker.autorun()` function? We're doing this because we want to ensure that whenever our `Stops.findOne()` cursor changes (meaning, our database has changed, or, Santa is at a new location), we want to call the `setSantaLocation()` function. Here, we're being a little tricky.

Our use of `Tracker.autorun()` is two fold. First, it ensures that when loading the map, Meteor is pulling in the appropriate data. Said another way, because our `Stops.findOne()` cursor is a reactive data source, we need to "know" when it has a value. By default on page load, our variable `currentLocation` is equal to `undefined` while Meteor loads up. After it loads, the data we need is passed. `autorun()` simply says "when any reactive data within this changes, run this code again."

So, our data changes in two ways: first, when the page loads and data is assigned to the variable, and then _again_ whenever our database is updated. Combining everything here allows us to define this code _once_ instead of repeating it again later. A bit tricky, but very handy for situations like this.

Okay. We're updating when our data changes, and that's great, but what are we actually _doing_ with that data? Pay attention to our call to `setSantaLocation()` above. We're passing two values: the returned `latitude` and `longitude` from Santa's `currentLocation`. Let's take a look at this function to see how this all ties together.

<p class="block-header">/client/controllers/public/santa-map.js</p>
```.lang-javascript
var setSantaLocation = function(latitude,longitude){
  var location = L.latLng(latitude,longitude);
  map.panTo(location);
  marker.setLatLng(location);
}
```

Pretty simple, but _very_ important. Taking our passed `latitude` and `longitude` arguments, we first create a Mapbox `L.latLng()` object, setting it to a variable `location`. Next, with that value, we call `map.panTo()`, telling our map's view to shift to the passed `location` and then `marker.setLatLng()` to actually move our marker. Great! Whenever our data updates, this function will actually _move_ Santa on the map to the correct location and shift the map _to_ that location (e.g. if we were looking at the United States and Santa was in Russia, it would focus the map on Russia). But wait, what is this "marker" you speak of?

Back in our Mapbox configuration, recall that we skipped over a few functions:

<p class="block-header">/client/controllers/public/santa-map.js</p>
```.lang-javascript
var santaIcon = L.icon({
  iconUrl: '/santa-marker.svg',
  iconSize: [48,48]
});

var marker = L.marker([0, 0], {
  icon: santaIcon
}).addTo(map);
```

Ah, ha! If you're an A+ student, you'll gather that we're defining our marker here. First, because we're using a custom image for Santa, we call Mapbox's `L.icon()` function (storing the result in a variable `santaIcon`), passing the location of our marker image to `iconUrl` and our desired size `48px by 48px` to `iconSize`. Note that we're calling to a local URL here, `/santa-marker.svg`. Where is this? In Meteor, any files you put in your `/public` directory are available at `http://<url-goes-here>/<file-name.type>`.

<div class="note">
<h3>A quick note</h3>
<p>Except for limited numbers of files or extremely small file sizes, it is <em>not</em> recommended to host images locally like this. Make sure that if your application relies on a large number of images to use a third-party service like Amazon S3 or Cloud Front to reduce the load on your application.</p>
</div>

Now, we create our marker passing two values: `[0,0]`, the starting point for our marker, and an options object with one setting `icon` set to the value of our `santaIcon` variable. Lastly, we call on the Mapbox `addTo()` method, passing our `map` variable (defined when we setup our map earlier). This is cooler than it may seem. We now have a functioning map with the ability to add Santa's position to it. Pretty. Damn. Cool.

### Timing Santa's Trip

Okay, so we've got our data loaded and our map setup, but how do we actually _track_ Santa? Recall that Santa is only letting us hook our _demo_ up to the sleigh's API, so we need to come up with a way to _simulate_ Santa's movement locally. We'll do this in two parts: first by defining a pair of server side methods for "moving" Santa, and creating some [cron jobs](http://en.wikipedia.org/wiki/Cron) to automate the firing of those methods.

<p class="block-header">/server/santa-timer.js</p>
```.lang-javascript
Meteor.methods({
  updateSantaLocation: function(){
    var currentStop = Stops.findOne({"current": true}),
        csIndex     = currentStop.order,
        nextStop    = Stops.findOne({"order": csIndex + 1});

    if ( nextStop ) {
      Stops.update(currentStop._id,{
        $set: {
          "current": false
        }
      }, function(error){
        if(error) {
          console.log(error);
        }
      });

      Stops.update(nextStop._id,{
        $set: {
          "current": true
        }
      }, function(error){
        if(error) {
          console.log(error);
        }
      });
    } else {
      SyncedCron.remove('Deliver Presents');
    }
  }
});
```

Lots of stuff, but nothing too wild. Here, we're creaing a method called `updateSantaLocation` that we can use to advanced the position of Santa on the map. The first thing we do here is to look up the current job, its order, and then do a little math to look up Santa's next stop.

Next, we make use of our `nextStop` variable (equal to a database lookup for a record with an order equal to the current stop's order plus one) to decide whether we need to update our database. This is essentially saying "if the current stop's number plus one is found in the database, go ahead and do all of this." The "all of this" part is split in two: first, update the current stop to no longer be the current stop, and second, update the determined "next stop" to be the current spot. An easy way to visualize this is a pair of runners in a race passing off a baton to one another.

Lastly, we call to a function `SyncedCron.remove()` passing `'Deliver Presents'` as our argument. What the heck is `SyncedCron`?

A little further up in our file we'll see _another_ method being defined `startPresentDelivery`.

<p class="block-header">/server/santa-timer.js</p>
```.lang-javascript
Meteor.methods({
  startPresentDelivery: function(){
    SyncedCron.add({
      name: 'Deliver Presents',
      schedule: function(parser) {
        return parser.text('every 5 min');
      },
      job: function() {
        Meteor.call('updateSantaLocation');
      }
    });
  }
});
```

This is where we make use of the `percolate:synced-cron` package we added earlier in the recipe. Synced Cron allows us to define scheduled, automated "jobs" that run at a specific time. Another way to think about this would be setting your thermostat. Every day at 5pm, for example, you might set your thermostat to start heating your home. When you get home at 6pm, your house is warm (the job your thermostat is doing).

Instead of heating a house, here we're creating a job called `Deliver Presents` that will run `every 5 minutes`. Every time this cron job is executed, we tell it to call our `updateSantaLocation` method. Putting two and two together, we can see that this essentially says "every five minutes, mark the next location on Santa's list to be the current stop." So cool. But, we're not _all the way there_.

Notice that we're wrapping this code in its own method. Why? Well, we're actually going to call this using [_another cron job_](http://youtu.be/tXVIYAY7Q7g?t=12s).

<p class="block-header">/server/startup.js</p>
```.lang-javascript
Meteor.startup(function(){
  SyncedCron.options = {
    log: true,
    collectionName: 'santaSchedule',
    utc: true
  }

  SyncedCron.add({
    name: 'start_santa_present_delivery',
    schedule: function(parser) {
      return parser.recur().on(12).month().on(24).dayOfMonth().on('10:55:00').time();
    },
    job: function() {
      Meteor.call('startPresentDelivery');
    }
  });

  SyncedCron.start();
});
```

Hokay. So we've got a few things going on here. Continuing on our original train of thought, notice that here we're adding _another_ cron job that is being setup to call our second method `startPresentDelivery` containing our first cron job. Yeah, [we're cool](http://i.imgur.com/Vfjlhhd.jpg).

What's up with the timing on this thing? Well, because we're trying to _think globally_ on this one, we want to include all children of the planet (yes, even if they may not technically celebrate Christmas—cool your jets, [festivus](http://en.wikipedia.org/wiki/Festivus)). In order to make this possible, we need to remain aware of the fact that places exist on the planet that are [already living in the future](http://youtu.be/flge_rw6RG0?t=9s).

To account for this, we're configuring _all_ of our cron jobs to use `UTC/GMT` time and setting our `start_santa_present_delivery` cron job to start 13 hours _before_ Christmas morning. This will ensure that Santa is on the move around midnight on December 25th in the farthest eastern country before the [International Date Line](http://en.wikipedia.org/wiki/International_Date_Line).

The one thing that you'll notice is that we're starting five minutes before `11:00:00 am UTC/GMT`. Why? Well, because our goal is to move Santa every five minutes, we want to account for the fact that when we schedule our first cron job `start_santa_present_delivery`, it will _wait_ five minutes before it actually calls our `startPresentDelivery` method. Setting this first job five minutes earlier ensures that Santa starts moving right at 11am UTC/GMT.

Good? Alright, continuing on, it's important to note that the `percolate:synced-cron` package picks up its time formatting (the `parse.recur().what().the().heck().is(this)` part) from a library called [later.js](http://bunkat.github.io/later/). All jokes aside, this library is really awesome and makes formatting cron job times super easy. If you're looking to do something a bit more custom, make sure to check out the [later.js documentation](http://bunkat.github.io/later/getting-started.html).

Before we call this thing a success, the last thing we need to do is tell our cron jobs to _actually start_. We can schedule jobs until we're blue in the face, but without firing the `SyncedCron.start()` function, our jobs will sit in our database twiddling their thumbs.

<div class="note">
<h3>A quick note</h3>
<p>Before we add some finishing touches to our SantaSpotter, let's get up from where we're sitting and get in <a href="https://www.youtube.com/watch?v=rwAwuhvhLPU">a quick workout</a>.</p>
</div>

### Displaying Santa's Current Location

Alright! So just a few more things and we're ready to rock. First up is adding a little touch to our interface and display Santa's current location (visible in the top right-hand side of our demo). In order to do this, we're going to setup a template and a controller.

<p class="block-header">/client/views/_santa-header.html</p>
```.lang-markup
<template name="santaHeader">
  <header class="santa-header">
    <p>SantaSpotter</p>
    <div class="current-location">
      <p>Santa's Current Location: <span>{{currentLocation}}</span></p>
    </div>
  </header>
</template>
```

Pretty simple. The part we want to pay attention to is the `<div class="current-location">` area. Here, we simply output a template helper `{{currentLocation}}` to display the City/Country value of where Santa is currently visiting. Let's hop over to our controller to see how we're getting the value.

<p class="block-header">/client/controllers/public/santa-header.js</p>
```.lang-javascript
Template.santaHeader.helpers({
  currentLocation: function(){
    var getLocation = Stops.findOne({"current": true}, {fields: {"name": 1, "current": 1}});
    if ( getLocation ) {
      return getLocation.name;
    } else {
      return "Locating...";
    }
  }
});
```

Easy breezy. We're doing a quick lookup on our `Stops` collection to find the `current` stop, specifiying _only_ the `name` and `current` fields. Again, little performance tweaks like this help the overall speed of your application. Next, if we get our location `getLocation`, we return the name field on it `getLocation.name`. If something is wrong or our app is still loading, we return `"Locating..."` as a nice UX touch for patient users.

One more thing before we call this rock and roll: sleigh connection status.

### Checking Our Connection to Santa's Sleigh

Last but not least, because our demo is relying on a connection to Santa's sleigh, it would be helpful to let our users know whether that connection exists. Displayed in the bottom right-hand corner of our application, we have a nice little beacon that reads `NICE` when we have a solid connection to Santa's sleigh, and `NAUGHTY` when we don't. [Oh my](http://media.giphy.com/media/iQAndLjnfqpS8/giphy.gif)!

<p class="block-header">/client/views/_santa-footer.html</p>
```.lang-markup
<template name="santaFooter">
  <header class="santa-footer">
    <div class="connection-status">
      <p>Sleigh Connection Status <span class="indicator {{sleighConnectionStatus}}">{{sleighConnectionStatus}}</span></p>
    </div>
  </header>
</template>
```

Almost identical to our pattern above for displaying Santa's location. The only difference here is that we're using our helper `{{sleighConnectionStatus}}` to not only display the status but also to add a class to our `<span class="indiciator">` tag so that we can style things up for the appropriate state. Nifty.

<p class="block-header">/client/controllers/public/santa-footer.js</p>
```.lang-javascript
Template.santaFooter.helpers({
  sleighConnectionStatus: function(){
    var sleighStatus = Meteor.status().connected;
    if ( sleighStatus == true ){
      return "nice";
    } else if ( sleighStatus == false ) {
      return "naughty";
    } else {
      return "unknown";
    }
  }
});
```

Don't you love Meteor? Look how easy this is. Here, we setup a template helper `sleighConnectionStatus` to test the value of `Meteor.status().connected`. If the value is `true` we return "nice," if it's `false` we return "naughty," and for when things go fully pear-shaped: "unknown."

Alright. Don't panic, but, Santa is on his way!

<iframe class="embed-responsive-item" src="//www.youtube.com/embed/9jyCfRHumHU?start=27" frameborder="0" allowfullscreen></iframe>

### Wrap Up & Summary

So there we have it! In this recipe we learned about making use of the Mapbox API to use custom maps and wired up some data to display on our map at a specific time. We also learned how to pull values out of our database to show on our template in real-time and even how to check the status of Meteor's connection to the server. Alright, put out your milk and cookies and get to bed. Fingers crossed for that Nintendo 64! Wait...
