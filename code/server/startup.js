/*
* Startup
* Collection of methods and functions to run on server startup.
*/

/*
* Generate Test Accounts
* Creates a collection of test accounts automatically on startup.
*/

// Create an array of user accounts.
var users = [
  { name: "Admin", email: "admin@admin.com", password: "password" }
]

// Loop through array of user accounts.
for(i=0; i < users.length; i++){
  // Check if the user already exists in the DB.
  var userEmail = users[i].email,
      checkUser = Meteor.users.findOne({"emails.address": userEmail});

  // If an existing user is not found, create the account.
  if( !checkUser ){
    Accounts.createUser({
      email: userEmail,
      password: users[i].password,
      profile: {
        name: users[i].name
      }
    });
  }
}

/*
* Load Santa's Stops
* Pulls in the list of Santa's stops automatically on startup.
*/

// Pull in Santa's stops.
var stops = SANTA_STOPS;

// Loop through array of user accounts.
for(i=0; i < stops.length; i++){
  // Check if the user already exists in the DB.
  var stop      = stops[i],
      checkStop = Stops.findOne({"name": stop.name});

  // If the stop isn't found, add it to the collection.
  if( !checkStop ){
    Stops.insert(stop);
  }
}
