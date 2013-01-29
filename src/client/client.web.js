//! ----------------------------------------------------------------------------
//! CONSTANTS
//! ----------------------------------------------------------------------------

var is_server = false;
var local_id = -1;
var local_bot = undefined;
var meSelector = load_image("cercle.png")
var arrowSelector = load_image("fleche.png")

G = new game();

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
function synchronise(data)
{
  // which Robot are we synchronising ? 
  var bot = G.robots[data.id];
  var peer = (data.interact == -1) ? null : G.robots[data.interact];
  
  // move -- smoothe transition to avoid ugly snapping
  bot.speed.setFromTo(bot.position, data.pos)
                    .scale(0.4)
                    .addV2(data.mov);
  
  // die
  bot.dead = data.dead;
  
  // interact
  bot.forceInteractPeer(peer);
}
socket.on('synch', synchronise);

//! DEAD RECKONING (CLIENT-SIDE SIMULATION)
var updateRate = 1000/60;
var dt = updateRate/60;
gs.switchstate(main);
setInterval(function() { gs.update(); }, updateRate);


//! ----------------------------------------------------------------------------
//! CREATE NEW ROBOTS ONLY WHEN SERVER SAYS SO
//! ----------------------------------------------------------------------------
socket.on('newBot',function(data)
{
  var newBot = ((data.vis == 4) 
            ? new PoliceRobot(new V2(data.bot.x, data.bot.y))
            : new Robot(new V2(data.bot.x, data.bot.y), data.vis));
  G.addRobot(data.id, newBot);
  
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
socket.on('heartbeat', function(data)
{
  if(window.VolumeSample)
  {
    var sample_index = (local_bot.TYPE == RobotPolice.TYPE ? 0 : 1);
    changeVolume(VolumeSample.gainNode[sample_index], data.vol * 0.01);   
  }
});

//! ----------------------------------------------------------------------------
//! SEND USER INPUT (KEY PRESSES) TO SERVER
//! ----------------------------------------------------------------------------
function treatUserInput()
{
  //! SKIP IF THERE IS NO LOCALLY-CONTROLLED ROBOT DEFINED
  if(!local_bot)
  {
    console.log("no local bot");
    return;
  }
    
  //! SEND INTERACTION REQUEST
  var request_interact = (keyboard.action && keyboard.direction.isNull());
      request_interact_id = -1, 
      current_interact = local_bot.interactPeer;
  
  // keep same interaction target ?
  if(request_interact && current_interact != null)
    request_interact_id = current_interact.id;
  
  // acquire a new interaction target ?
  else if(request_interact && selected)
    request_interact_id = selected.id
 
  //! SEND MOVEMENT REQUEST
  socket.emit('synch', 
  {
    x: Math.round(keyboard.direction.x),
    y: Math.round(keyboard.direction.y),
    intid: request_interact_id
  });
}
setInterval(treatUserInput, 100);
