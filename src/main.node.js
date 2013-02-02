main = new gs.gamestate('main');

// This is where the user writes his app.
// Redefine the functions below for beautiful awesomness...

/**	Initialises the state
*
*	Called once, when the state is first used. Initialise all the objects the 
*	state will need in here
*/
main.init = function() {
	G = new Game()
	_botid = 0;
	botid = function(){
		return _botid++;
	}
};

/**	Prepares the state for entry
*
*	Called each time the state is entered.
*	Useful to prepare the environment.
*/
main.enter = function(previous) {
  G.reset();
};

/**	Prepare the state for departure
*
*	Called each time we switch away from the state.
*	Allows the state to clean up after itself.
*	Be a friendly state and leave things how they were when you found them!
*/
main.leave = function() 
{
};

/** Called each frame
*
*	The contents of your main loop goes here.
*/
main.update = function() 
{
	// Simulate
	G.update();

	if (gameOn) 
  {
		var humansLeft = 0;
		var robotsLeft = 0;
		for (bot in G.robots) 
    {
			r = G.robots[bot];
			if (r.humanControlled && !r.dead) 
      {
				if (r.robotTeam) 
        {
					robotsLeft++;
				} 
				else 
        {
					humansLeft++;
				}
			}
		}
		
		//! FIXME Game end conditions
		/**
		if (humansLeft == 0 || robotsLeft == 0) 
    {
			var elim = humansLeft==0;
			connected.forEach(function(sock, id)
  			{
  				sock.emit('gameover',{elim: elim, score: score});
  				sock.disconnect();
  			});
  			G.reset();
		}
		/**/
	}


	// Draw
};

/**	Called when events happen
*
*	event - object containing the event that occurred
*/
main.eventreg = function(event) 
{

};