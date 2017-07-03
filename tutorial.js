// Separation of UI Logic and Business Logic, a Simple Example

// While I pretend to be no expert on this stuff, I think I've got a handle on
// how it is they want us to be separating this stuff out... So I'm writing this
// to hopefully help out in some way...

// The problem to be solved is how to correctly use your user interface logic
// (UI Logic) when separated between two files. Here is a simple example in
// hopes it might clear it up.

// Say we have a simple application (for now all information is in the UI logic
// area, e.g. scripts-interface.js in our context), in this case the goal of the
// application is to take in a single piece of user input, query some fictional
// API via AJAX request, and then display it to the screen:

// Note: I am ignoring the use of an apiKey and the .env file in this


////////////////////////////////////////////////////////////////////////////////
///////////////////////////////  Part One  /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////
// Filename: scripts-interface.js //
////////////////////////////////////

$(document).ready(function() {
  // Submit event for the form
  $('#some-form').submit(function(event) {
    event.preventDefault();

    // Gather inputted information from the form and store it into userInput
    var userInput = $('#text-input').val();

    // Get the information from the fictional API
    // Let's assume for our examples sake that the results come back as an object
    // like so:
    // results = [
    //  {
    //    name: 'John'
    //  },
    //  {
    //    name: 'Jacob'
    //  },
    //  {
    //    name: 'Jingleheimerschmidt'
    //  }
    //];
    // Simple array with 3 objects in it, that each have a single property of
    // name to some random name
    $.get('https://www.fictionalapi.xyz/endpoint?' + userInput)
      .then(function(results) {
        // Here is where we would want to display the information to screen
        results.forEach(function(result) {
          $('#some-unordered-list').append('<li>' + result.name + '</li>');
        });
      })
      .fail(function() {
        console.log('something went wrong');
      });
  });
});

// Assuming this code was tied to an actual HTML page, and the API really existed,
// and the HTML page included the appropriate element IDs as I've referenced,
// this should display all of the results to the page in the form of:
// <ul>
//   <li>John</li>
//   <li>Jacob</li>
//   <li>Jingleheimerschmidt</li>
// </ul>




////////////////////////////////////////////////////////////////////////////////
///////////////////////////////  Part Two  /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Now, the $.get() method is a method that should be reserved for the business
// logic as it has to do with retrieving data from somewhere other than the
// user, so let's refactor our project into separate files using the exports and
// requires, creating an application module, and a method for retrieving said data

//////////////////////////
// Filename: scripts.js //
//////////////////////////

// Here is our constructor, there are no need for any arguments when creating it
// at this point in the scenario so we're not going to define any parameters
var ApplicationModule = function() {

}

// Now, we need a method for retrieving data
ApplicationModule.prototype.getData = function(userInput) {
  //let's take the $.get() method from the previous iteration of
  //scripts-interface.js and place it here
  $.get('https://www.fictionalapi.xyz/endpoint?' + userInput)
    .then(function(results) {
      // Here is where we would want to display the information to screen
      results.forEach(function(result) {
        $('#some-unordered-list').append('<li>' + result.name + '</li>');
      });
    })
    .fail(function() {
      console.log('something went wrong');
    });

  // Note: we don't necessarily need to return anything here because at this
  // point, incorrectly, our business logic is putting the information on the
  // page for us, we'll get to that in a minute.
}

// Export our application module so the UI logic can see it:
exports.applicationModule = ApplicationModule;

// Now, lets take a look at the new version of our scripts-interface.js

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////
// Filename: scripts-interface.js //
////////////////////////////////////

// We need our ApplicationModule, so let's require it at the top (we'll assume
// they are in the same directory ignoring the dev environement/building and all
// that jazz)
var ApplicationModule = require('./scripts.js').applicationModule;

$(document).ready(function() {
  // Now that we've imported our module to be available, we need to construct an
  // instance of it. AKA Instantiate it.
  var applicationModule = new ApplicationModule();

  // Submit event for the form
  $('#some-form').submit(function(event) {
    event.preventDefault();

    // Gather inputted information from the form and store it into userInput
    var userInput = $('#text-input').val();

    // We created a method on the applicationModule to be able to get our data,
    // so let's call it
    applicationModule.getData(userInput);
  });
});

// Cool, this code should work the same as it did in the first exmaple, but has
// the benefit of being split into two files.

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  Part Three  ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Now we can address the asynchronicity (async) issue, that leads to this funky
// kind of way that we separate UI and business logic in this type of application,
// but first let's talk about what the issue actually is.

// So, async is a way that JS can run certain blocks of code in the background
// which results in the code after it running first... In our example, if we
// were to simply just return the results array, then in the UI logic try and
// then append it to the screen, it would fail. Specifically because the loop
// trying to append the list items with the names in it, would run before
// the server got a chance to respond with the data, even though it's only
// a few milliseconds. So when the loop would try to run, the variable it was
// trying to loop over would be either undefined, or an array with 0 length.

// So, the approach we are going to take is write a function that takes in one
// argument, the results, then appends them to the screen. We did this a lot in
// Intro with things like the address book app, and really any time we had to
// separate business and UI logic on any project... the function is going to look
// like this:

var displayData = function(results) {
  results.forEach(function(result) {
    $('#some-unordered-list').append('<li>' + result.name + '</li>');
  });
}

// Which is just that loop that's inside the $.get() method. It doesn't need to
// return anything because it's not doing anything to any data, it's just
// shoving it onto the page.

// Now we can't just call this function from the business logic for the same reason
// that we had to export and require the scripts.js into scripts-interface.js.
// It just can't see it, but instead of requiring it, we have another option to
// be able to expose it to the getData method.

// Probably have noticed there's multiple ways to define functions, like:
// function myFunction() {}, or var myFunction = function() {}
// I wrote it the second way this time to help illustrate what's going on...
// Our displayData function is literally a function that is stored inside
// the variable displayData. Just like any other variable, we can pass this
// function into another function or method by way of argument/paramenter.
// That looks like this...

// Here is a fake method defined in the business logic:
FakeModule.prototype.fakeMethod = function(input, fakeDisplayData) {
  $.get('someaddress')
    .then(function(results) {
      fakeDisplayData(results); //This is the new piece, in that we're calling
      // a function that was passed into the method as an argument
    });
}
// Here is the function as it would be written in scripts-interface.js
var fakeDisplayData = function(results) {
  results.forEach(function(result) {
    $('#something').append(result.thing);
  });
}

// Here is where the method would be called in the actual piece of the UI logic
// that is doing something, in this case, a submit event
// We're assuming the exports and require and object instantiation have all been
// done already
$('#someform').submit(function(event) {
  event.preventDefault();

  var input = $('input').val();

  // Here we're going to pass two arguments, one the input gathered from the user
  // the second, the actual function fakeDisplayData, so the method
  // can see it.
  fakeModule.fakeMethod(input, fakeDisplayData);
}

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  Part Four //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Let's take a look at our previous example in it's entirety now, sans comments
// for readability, then I'm going to break it down one more time

//////////////////////////
// Filename: scripts.js //
//////////////////////////

var ApplicationModule = function() {

}

ApplicationModule.prototype.getData = function(userInput, displayData) {
  $.get('https://www.fictionalapi.xyz/endpoint?' + userInput)
    .then(function(results) {
      displayData(results);
    })
    .fail(function() {
      console.log('something went wrong');
    });
}

exports.applicationModule = ApplicationModule;

////////////////////////////////////
// Filename: scripts-interface.js //
////////////////////////////////////

var ApplicationModule = require('./scripts.js').applicationModule;

var displayData = function(results) {
  results.forEach(function(result) {
    $('#some-unordered-list').append('<li>' + result.name + '</li>');
  });
}

$(document).ready(function() {
  var applicationModule = new ApplicationModule();

  $('#some-form').submit(function(event) {
    event.preventDefault();

    var userInput = $('#text-input').val();
    applicationModule.getData(userInput, displayData);
  });
});

// And now for the final breakdown, we'll start with the business logic

// First we declare our constructor, in this exmaple it needs no parameters

// Then we declare our getData prototype method, it's going to have two parameters
// first, the userInput to be tacked onto the end of our query string for getting
// data from the API, second the displayData function thats written in the UI
// side of things that we'll use to display the data to the screen

// We write our $.get() method, using .then() to perform an action once the data
// has been retrieved from the server

// Inside of .then() we call our displayData function we passed in as our argument
// from the UI side of things, giving it the results data retrieved with $.get()

// We set a .fail() action in the event there was a problem

// And finally, we export the ApplicationModule object so we can expose it to the
// UI side of things.

// On to the scripts-interface.js UI logic:

// First we need to import our ApplicationModule with the require

// Second, we define our function for displaying the data, displayData, this
// function takes in the results from the $.get() request, then loops over
// them, appending them to a UL in our HTML

// Then we do our stuff when page loads inside $(document).ready()

// We instantiate a new version of the ApplicationModule object

// Followed by binding the submit event handler to the form that we're getting
// data from the user out of.

// When the form is submitted, first we get the data out of the text input

// Then we call our method we wrote to get the data with
// applicationModule.getData(userInput, displayData), passing in the input
// from the user, as well as our function to display it the screen, running
// all of the code that we just wrote in the business logic and UI logic...

// Lastly, we observe the results of winning at an oddly circular and complex
// concept.


// I'm not sure how much this will help, if at all, just felt like taking a stab
// at wording all of this a little different than what's in the curriculum.
// Happy to answer any questions anyone has.
