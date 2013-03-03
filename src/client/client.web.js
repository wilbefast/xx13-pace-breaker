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

// client GUI + shiny stuff
context.font = "12pt monospace";


function play_music()
{
  var music = new Audio();
  music.src = DATA_LOCATION + "/sounds/DarkBounty.ogg";
  music.volume = 0.2;
  music.addEventListener('ended', function() { play_music(); } );
  music.play();
}
play_music();


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
var SYNCH_SNAP_SPEED = 5 / 1000; // snap 5 pixels per second per second
var synchPos = new V2(), synchPosDelta = new V2();
function synchronise(synchData)
{
  // which Robot are we synchronising ? 
  var bot = G.robots[synchData.id];
  var peer = synchData.peer ? null : G.robots[synchData.peer];
  
  // read position from packet
  synchPos.setXY(synchData.x, synchData.y);
  
  // infection -- may not be present in packet (ie. if we are a cop)
  if(synchData.sick)
    bot.infection = synchData.sick;
  
  // move -- smoothe transition to avoid ugly snapping
  bot.speed.setFromTo(bot.position, synchPos).scale(SYNCH_SNAP_SPEED);
    
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
socket.on('newBot', function(newBotData)
{
  // parse new Robot object from data
  var newBot = G.unpackRobot(newBotData);
  
  // assume control of the new Robot (if it's ours)
  if(newBot.id == local_id)
    local_bot = newBot;
});

//! ----------------------------------------------------------------------------
//! HAVE POLICE LOCK-ON AND -OFF WHEN THE SERVER SAYS SO
//! ----------------------------------------------------------------------------
socket.on('lockon', function(lockonData)
{
  if(lockonData.dest)
    console.log("lockon " + lockonData);
  G.robots[lockonData.src].setTarget(lockonData.dest ? 
                                    G.robots[lockonData.dest] : null);
});

//! ----------------------------------------------------------------------------
//! HAVE POLICE FIRE WHEN THE SERVER SAYS SO
//! ----------------------------------------------------------------------------

socket.on('fire', function(fireData)
{
  G.robots[fireData.src].openFire();
});

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
//! KILL ROBOTS WHEN TOLD TO
//! ----------------------------------------------------------------------------
socket.on('death', function(data)
{
  G.robots[data.id].setHealth(Robot.prototype.DEAD);
});

//! ----------------------------------------------------------------------------
//! RESET WHEN TOLD
//! ----------------------------------------------------------------------------
socket.on('reset', function(data)
{
  G.reset();
});

//! ----------------------------------------------------------------------------
//! RECEIVE THE COUNT OF SURVIVING ROBOTS
//! ----------------------------------------------------------------------------
socket.on('count', function(data)
{
  G.n_civillians = data.civ;
  G.n_hackers = data.hax;
  G.n_police = data.pol;
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
  if(!local_bot || !local_bot.isHealthy())
    return;
  
  //! BUILD THE PACKET TO SEND PROCEDURALLY
  inputData = { };

  //! INTERACTION REQUEST ?
  if(!local_bot.isPolice)
  {
    var request_interact = (keyboard.action && keyboard.direction.isNull()),
        current_interact = local_bot.interactPeer;      
    // keep same interaction target ?
    if(request_interact && current_interact != null)
      inputData.peer = current_interact.id; 
    // acquire a new interaction target ?
    else if(request_interact && selected)
      inputData.peer = selected.id
    // break off from current interaction
    else
      local_bot.forceInteractPeer(null);
  }
  
  //! MOVEMENT REQUEST ?
  if(keyboard.direction.x != 0)
    inputData.x = Math.round(keyboard.direction.x);
  if(keyboard.direction.y != 0)
    inputData.y = Math.round(keyboard.direction.y);
  
  //! SEND INPUT
  socket.emit('input', inputData);
}
setInterval(treatUserInput, 100);

//! ----------------------------------------------------------------------------
//! TELL SERVER WHEN THE LOCALLY-CONTROLLED POLICE-BOT LOCKS-ON OR -OFF
//! ----------------------------------------------------------------------------

function tellServerLockon(object)
{
  if(object == null)
    socket.emit('lockon');
  else
    socket.emit('lockon', { dest : object.id }); 
}