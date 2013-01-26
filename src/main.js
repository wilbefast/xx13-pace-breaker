main = new gs.gamestate('main');

// This is where the user writes his app.
// Redefine the functions below for beautiful awesomness...

/**	Initialises the state
*
*	Called once, when the state is first used. Initialise all the objects the 
*	state will need in here
*/
main.init = function() {
  this.robot = new CivillianRobot(new V2(100, 100));
};

/**	Prepares the state for entry
*
*	Called each time the state is entered.
*	Useful to prepare the environment.
*/
main.enter = function(previous) {
};

/**	Prepare the state for departure
*
*	Called each time we switch away from the state.
*	Allows the state to clean up after itself.
*	Be a friendly state and leave things how they were when you found them!
*/
main.leave = function() {
};

/** Called each frame
*
*	The contents of your main loop goes here.
*/
main.update = function() {
  
	// Simulate
  this.robot.position.addV2(keyboard.direction);
  this.robot.update(1);
	
  if(context)
  {
    // Draw
    context.fillStyle = '#131313';
    context.fillRect(0,0,canvas.width,canvas.height);
  
    this.robot.draw();
  }
};

/**	Called when events happen
*
*	event - object containing the event that occurred
*/
main.eventreg = function(event) {

};