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
  
  // synchronise every 10th of a second
  this.synch_t = new Timer(100);
  this.N_SYNCH_BATCHES = 5;
  this.synch_batch = 0;
  
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
  //! FOREACH player (socket) connected to the server
  connected.forEach(function(listenSock, listenSockId)
  {
    // the Robot whose owner will be sent the synchronisation/hint messages
    var listenBot = G.robots[listenSockId];
    if(!listenBot)
      return;
    
    //! FOREACH robot in the game
    G.robots.forEach(function(synchBot, synchBotId)
    {
      // skip null
      if(!synchBot)
        return;
      
      // synch-packet: obligatory  data
      var synchData = 
      { 
        id : synchBot.id,
        x : Math.round(synchBot.position.x), 
        y : Math.round(synchBot.position.y)        
      };
      
      // optional -- interaction 
      //! FIXME -- shouldn't be send each frame
      if(synchBot.interactPeer != undefined)
        synchData.peer = synchBot.interactPeer.id;
      
      // optional -- infection: send only to the hacker/imposter team
      if(synchBot.infection && listenBot.isImposter)
        synchData.sick = synchBot.infection;
      
      // optional -- hint: distance to nearest foe
      if(listenBot.nearestFoe && listenBot.nearestFoe.dist2 != Infinity)
        synchData.hint = Math.round(Math.sqrt(listenBot.nearestFoe.dist2));
        
      // send packet
      listenSock.volatile.emit('synch', synchData);
    });
  });
  
  // move to next synch batch
  this.synch_batch = (this.synch_batch + 1) % this.N_SYNCH_BATCHES;
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