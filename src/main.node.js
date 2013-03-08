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
	G = new Game()
  
  // synchronise a different Robot every 100th of a second (10ms)
  this.synch_t = new Timer(100);
  this.synch_i = 0;
  
};

/**	Prepares the state for entry
*
*	Called each time the state is entered.
*	Useful to prepare the environment.
*/
main.enter = function(previous) 
{  
  // timing concerns
  this.prev_tick = this.curr_tick = (new Date()).getTime();
  
  // repopulate the Game world
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
   // Deal with timing
  this.prev_tick = this.curr_tick;
  this.curr_tick = (new Date()).getTime();
  var delta_t = this.curr_tick - this.prev_tick;
 
	// Perform server-side ('true') update
	G.update(delta_t);
  
  // Perform synchronisation with client
  if(this.synch_t.update(delta_t))
    this.synch();
};

/**	Called when events happen
*
*	event - object containing the event that occurred
*/
main.eventreg = function(event) 
{

};

//! ----------------------------------------------------------------------------
//! CUSTOM FUNCTION FOR THE MAIN (GAMEPLAY ARENA) GAME-STATE
//! ----------------------------------------------------------------------------


main.synch = function()
{
  //! WHICH robot are we going to synchronise with clients?
  //var synchBotId = this.synch_i, synchBot = G.robots[synchBotId];
  //this.synch_i = (this.synch_i + 1) % G.robots.length;
  
  //! FOREACH player (socket) connected to the server
  connected.forEach(function(listenSock, listenSockId)
  {
    // the Robot whose owner will be sent the synchronisation/hint messages
    var listenBot = G.robots[listenSockId];
    
    //! FOREACH robot in the game
    G.robots.forEach(function(synchBot, synchBotId)
    {
      // obligatory packet data
      var synchData = 
      { 
        id : synchBotId,
        x : Math.round(synchBot.position.x), 
        y : Math.round(synchBot.position.y)        
      };
      
      // optional packet data --
      // -- interaction
      if(synchBot.interactPeer != undefined)
        synchData.peer = synchBot.interactPeer.id;
      // -- infection: send only to the hacker/imposter team
      if(synchBot.infection)
      {
        if(listenBot && listenBot.isImposter)
          synchData.sick = synchBot.infection;
      }
      
      // send packet
      listenSock.volatile.emit('synch', synchData);
      
    });
    
    if(listenBot && listenBot.nearestFoe && listenBot.nearestFoe.dist2 != Infinity)
    {
      listenSock.emit('hint', 
      { 
        dist: Math.round(Math.sqrt(listenBot.nearestFoe.dist2)) 
      });
    }
  });
}

main.treatInput = function(inputId, inputData)
{
  //! MAKE SURE THE CLIENT CONTROLS A LIVING ROBOT
  var inputBot = G.robots[inputId];
  if(!inputBot || !inputBot.isHealthy())
    return;
  
  // SET MOVEMENT
  inputBot.trySetSpeed(inputData.x || 0, inputData.y || 0);
  
  // SET/MAINTAIN INTERACTION (if one is specified)
  if (inputData.peer != undefined)
  {
    //! FIXME -- pointless to spam this every synch
    var interactTarget = G.robots[inputData.peer];
    if (interactTarget && interactTarget.TYPE != Robot.TYPE_POLICE)
    {
      if (inputBot.position.dist2(inputBot.position) < inputBot.MAX_INTERACT_DISTANCE2)
        inputBot.tryInteractPeer(interactTarget);
    }
  }
  // CANCEL INTERACTION (if none is specified)
  else
    inputBot.forceInteractPeer(null);
}