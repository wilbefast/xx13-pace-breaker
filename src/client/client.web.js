//! ----------------------------------------------------------------------------
//! CONSTANTS
//! ----------------------------------------------------------------------------

// client-specific code
var is_server = false;

// player-controlled robot
var local_id = -1;
var local_bot = undefined;

// game object
G = new Game();
G.view = new GameView();
G.draw = function() { this.view.draw() };

// hints
var MAX_HINT_RANGE = 300;

//! ----------------------------------------------------------------------------
//! MANAGE CONNECTION
//! ----------------------------------------------------------------------------

//! OPEN CONNECTION
var socket = io.connect(location.origin);
socket.on('load',function(data)
{
  if (data.callback)
    loadScript(data.url, data.callback);
  else
    loadScript(data.url);
});

//! RECEIVE IDENTIFIER
socket.on('you', function(data) 
{
  local_id = data.id;
  // assume control of the corresponding Robot (if it exists)
  local_bot = G.robots[data.id];
});

//! RESPOND TO CHALLENGES (ie. 'YES, I AM STILL ALIVE')
socket.on('ping',function(data) { socket.emit('pong',{id: local_id}); });

//! BREAK OFF THE CONNECTION CLEANLY
socket.on('leave', function(data) { delete local_bot; });
$('body').bind('beforeunload',function() { socket.send("leaving"); });

//! ----------------------------------------------------------------------------
//! UPDATE THE GAME
//! ----------------------------------------------------------------------------
//! SYNCHRONISED WITH SERVER
var synchPos = new V2(), synchPosDelta = new V2();
function synchronise(synchData)
{
  // which Robot are we synchronising ? 
  var bot = G.robots[synchData.id];
  var peer = synchData.peer ? null : G.robots[synchData.peer];
  
  // read packet
  synchPos.setXY(synchData.x, synchData.y);
  synchPosDelta.setXY(synchData.dx, synchData.dy); // NB - dx & dy are optional
  
  // infection -- may not be present in packet (ie. if we are a cop)
  if(synchData.sick)
    bot.infection = synchData.sick;
  
  // move -- smoothe transition to avoid ugly snapping
  //bot.speed.setFromTo(bot.position, synchPos).scale(0.4).addV2(synchPosDelta);
  bot.position.setV2(synchPos);
  bot.speed.setXY(0,0);
    
    
  // interact -- continue/start/stop (if no peer is specified => interact null)
  bot.forceInteractPeer(G.robots[synchData.peer]);
}
socket.on('synch', synchronise);

//! DEAD RECKONING (CLIENT-SIDE SIMULATION)
var UPDATES_PER_SECOND = 60;
var MILLISECONDS_PER_UPDATE = 1000 / UPDATES_PER_SECOND;
gs.switchstate(main);
setInterval(function() { gs.update(); }, MILLISECONDS_PER_UPDATE);


//! ----------------------------------------------------------------------------
//! CREATE NEW ROBOTS ONLY WHEN SERVER SAYS SO
//! ----------------------------------------------------------------------------
socket.on('newBot', function(data)
{
  // parse new Robot object from data
  var newBot = G.unpackRobot(data);
  
  // assume control of the new Robot (if it's ours)
  if(newBot.id == local_id)
    local_bot = newBot;
})

//! ----------------------------------------------------------------------------
//! END THE GAME WHEN SERVER SAYS SO
//! ----------------------------------------------------------------------------
socket.on('gameover',function(data)
{
  if (data.elim) 
  {
    alert("The humans hacked " + data.score +
          " robots before being killed by the cops!");
  } 
  else 
  {
    alert("The humans hacked " + data.score + 
          " robots but the cops messed up! Human score is 100!");
  }
});

//! ----------------------------------------------------------------------------
//! PLAY HEARTBEAT SOUND AT THE SPECIFIED VOLUME
//! ----------------------------------------------------------------------------
socket.on('death', function(data)
{
  console.log("DEATH " + data.id);
  G.robots[data.id].setHealth(Robot.prototype.DEAD);
});

//! ----------------------------------------------------------------------------
//! PLAY HEARTBEAT SOUND AT THE SPECIFIED VOLUME
//! ----------------------------------------------------------------------------
socket.on('hint', function(data)
{
  if(window.VolumeSample)
  {
    var sample_index = (local_bot.isPolice ? 0 : 1),
        sample_volume = (data.dist > MAX_HINT_RANGE) 
                              ? 0 : 1 - (data.dist / MAX_HINT_RANGE);
    changeVolume(VolumeSample.gainNode[sample_index], sample_volume);   
  }
});

//! ----------------------------------------------------------------------------
//! SEND USER INPUT (KEY PRESSES) TO SERVER
//! ----------------------------------------------------------------------------
function treatUserInput()
{
  //! SKIP IF THERE IS NO LOCALLY-CONTROLLED ROBOT DEFINED
  if(!local_bot)
    return;
    
  //! INTERACTION REQUEST ?
  var request_interact = (keyboard.action && keyboard.direction.isNull()),
      current_interact = local_bot.interactPeer,
      inputData = { };
      
  // keep same interaction target ?
  if(request_interact && current_interact != null)
    inputData.peer = current_interact.id; 
  // acquire a new interaction target ?
  else if(request_interact && selected)
    inputData.peer = selected.id
  // break off from current interaction
  else
    local_bot.forceInteractPeer(null);
    
  //! MOVEMENT REQUEST ?
  if(keyboard.direction.x != 0)
    inputData.x = Math.round(keyboard.direction.x);
  if(keyboard.direction.y != 0)
    inputData.y = Math.round(keyboard.direction.y);
  
  //! SEND INPUT
  socket.emit('input', inputData);
}
setInterval(treatUserInput, 100);
