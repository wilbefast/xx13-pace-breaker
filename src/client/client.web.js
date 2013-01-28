var is_server = false;

var meSelector = load_image("cercle.png")
var arrowSelector = load_image("fleche.png")

G = new game();

var socket = io.connect(location.origin);
socket.on('load',function(data)
{
  if (data.callback)
    loadScript(data.url, data.callback);
  else
    loadScript(data.url);
});

local_id = -1;
socket.on('you', function(data) 
{
  local_id = data.id;
});


$('body').bind('beforeunload',function()
{
  alert("Cool");
  socket.send("leaving");
});

socket.on('leave',function(data)
{
  delete G.robots[data.id];
});

socket.on('heartbeat',function(data)
{
  var samp = (G.robots[local_id].animset == animFlic ? 0 : 1); // If I'm a cop
  
  if(window.VolumeSample)
  {
    changeVolume(VolumeSample.gainNode[samp],data.vol/100); 	
  }

});

socket.on('ping',function(data)
{
  socket.emit('pong',{id: local_id});
});

socket.on('gameover',function(data)
{
  if (data.elim) 
  {
    alert("The humans hacked "+data.score+" robots before being killed by the cops!");
  } 
  else 
  {
    alert("The humans hacked "+data.score+" robots but the cops messed up! Human score is 100!");
  }
});

socket.on('update',function(data) 
{
  var bot = G.robots[data.id];

  if (bot) 
  {
    // move
    var dx = ( ((data.pos.x - bot.position.x)/5) + data.mov.x)*2;
    var dy = ( ((data.pos.y - bot.position.y)/5) + data.mov.y)*2;
    bot.movement.setXY(dx, dy);
    bot.animdirection.setXY(data.mov.x,data.mov.y);
    bot.dead = data.dead;
    
    // interaction
    bot.forceInteractPeer((data.interact == -1) ? null : G.robots[data.interact]);
  }
});

socket.on('newBot',function(data)
{
  var b = ((data.vis == 4) 
            ? new PoliceRobot(new V2(data.bot.x, data.bot.y))
            : new Robot(new V2(data.bot.x, data.bot.y), data.vis));
  G.addRobot(data.id, b);
})

var updateRate = 1000/60;
var dt = updateRate/60;

gs.switchstate(main);
setInterval(function() { gs.update(); }, (updateRate));

setInterval(function()
{
  //! SEND INTERACTION REQUEST
  var request_interact = (keyboard.action && keyboard.direction.isNull());
      request_interact_id = -1, 
      current_interact = G.robots[local_id].interactPeer;
  
  // keep same interaction target ?
  if(request_interact && current_interact != null)
    request_interact_id = current_interact.id;
  
  // acquire a new interaction target ?
  else if(request_interact && selected)
    request_interact_id = selected.id
 
  //! SEND MOVEMENT REQUEST
  if (local_id >= 0) 
  {
    socket.emit('update', 
    {
      x: Math.round(keyboard.direction.x),
      y: Math.round(keyboard.direction.y),
      intid: request_interact_id
    });
  }
},100);
