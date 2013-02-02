main = new gs.gamestate('main');

// This is where the user writes his app.
// Redefine the functions below for beautiful awesomness...

/**	Initialises the state
*
*	Called once, when the state is first used. Initialise all the objects the 
*	state will need in here
*/
main.init = function() 
{
  selected = null;
};

/**	Prepares the state for entry
*
*	Called each time the state is entered.
*	Useful to prepare the environment.
*/
main.enter = function(previous) 
{
  this.prev_tick = this.curr_tick = (new Date()).getTime();
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
  // deal with timing
  this.prev_tick = this.curr_tick;
  this.curr_tick = (new Date()).getTime();

  var local_bot = G.robots[local_id];
  if(local_bot)
  {
    // select a nearby bot
    if(local_bot.nearest.dist2 <= local_bot.MAX_INTERACT_DISTANCE2)
    {
      // 'nearest.dist2' is set to Infinity whenever 'nearest.bot' is null 
      // hence 'selected' should be non-null after this instruction
      selected = local_bot.nearest.bot;
    }
    else
      // select nobody is nobody is close enough
      selected = null;
  }

	// Dead-reckoning
  G.update(this.curr_tick - this.prev_tick);
	
	// Draw
	context.fillStyle = '#131313';
	context.fillRect(0,0,canvas.width,canvas.height);
	G.draw();
}

/**	Called when events happen
*
*	event - object containing the event that occurred
*/
main.eventreg = function(event) {

};
