lobby = new gs.gamestate('lobby');

// This is where the user writes his app.
// Redefine the functions below for beautiful awesomness...

/**	Initialises the state
*
*	Called once, when the state is first used. Initialise all the objects the 
*	state will need in here
*/
lobby.init = function() {
	noneRoster = []
	alphaRoster = []
	deltaRoster = []
	
};

/**	Prepares the state for entry
*
*	Called each time the state is entered.
*	Useful to prepare the environment.
*/
lobby.enter = function(previous) {
	timeToGame = 10;
	alphaRoster = []
	deltaRoster = []
	round = 1;
};

/**	Prepare the state for departure
*
*	Called each time we switch away from the state.
*	Allows the state to clean up after itself.
*	Be a friendly state and leave things how they were when you found them!
*/
lobby.leave = function() {
};

/** Called each frame
*
*	The contents of your lobby loop goes here.
*/
lobby.update = function() 
{
	timeToGame-=dt;
	if (alphaRoster.length==0 || deltaRoster.length==0) {
		timeToGame = 10;
	} else if (timeToGame<=0) {
		gs.switchstate(main);
	};
	console.log(noneRoster);
}

/**	Called when events happen
*
*	event - object containing the event that occurred
*/
lobby.eventreg = function(event) {

};
