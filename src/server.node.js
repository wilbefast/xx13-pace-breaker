is_server = true;

mime = require('mime')
  , app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

require("./game/utility.js");
require("./game/objects.js");
require("./game/game.js");
require("./game/V2.js");
require("./game/Rect.js");
require("./game/Bank.js")
require("./game/Timer.js")
require("./game/Robot.js");
require("./game/RobotCivillian.js");
require("./game/RobotCivillian.js");
require("./game/RobotImposter.js");
require("./game/gamestate.js");

require("./serverRobot.node.js");
//require("lobby.node.js");
require("./main.node.js");


updateRate = 1000/10;
dt = updateRate;
round = 1;

gs.switchstate(main);
setInterval(function(){ gs.update(); },(updateRate));


/**/
repl = require('repl');
rep = repl.start({
  prompt: "server> ",
  input: process.stdin,
  output: process.stdout,
  useGlobal: true,
  ignoreUndefined: true
});

rep.on('exit', function () {
  console.log('Got "exit" event from repl!');
  process.exit();
});
/**/

io.set('log level',1)

app.listen(1986);

gameOn = false;

function handler (req, res) 
{
  var filename = req.url;
  if (filename === '/') 
  {
    filename = '/index.html';
  }
  fs.readFile(__dirname + filename,
  function (err, data) 
  {
    if (err) 
    {
      res.writeHead(500);
      return res.end('Mistakes were made...');
    }
    res.writeHead(200, {'Content-Type': mime.lookup(filename)});
    res.end(data);
  });
}

var x = 0;
nextid = function() 
{
  return x++;
}

connected = [];

setInterval(function()
{
  nbPlayers = 0;
  
  //! FOREACH player (socket) connected to the server
  connected.forEach(function(synchSock, synchSockId)
  {
    nbPlayers++;
    //! FOREACH robot in the game
    G.robots.forEach(function(synchBot, synchBotId)
    {
      synchSock.emit('synch', 
      {
        pos: { x: Math.round(synchBot.position.x), 
               y:Math.round(synchBot.position.y) },
        mov: { x: Math.round(synchBot.speed.x * 10), 
               y:Math.round(synchBot.speed.y * 10) },
        id: synchBotId,
        interact: ((synchBot.interactPeer != null) 
                            ? synchBot.interactPeer.id 
                            : -1),
        dead: synchBot.dead
      });
      
    });
    
    //! FIXME
    /*
    var distance = Infinity;
    if (G.robots[id] != null && G.robots[id].robotTeam)
    {
      distance = (G.robots[id])
                      ? Math.sqrt(G.robots[id].nearestHuman.dist2)
    } 
    else 
    {
      distance = (G.robots[id]?Math.sqrt(G.robots[id].nearestCop.dist2):Infinity);
    }
    var vol = 1 - Math.min(   1,      Math.max( 0, ((distance - 20)/300)   )       );
    sock.emit('heartbeat',{vol: Math.floor(vol*100)});
    */
  });

  gameOn = nbPlayers > 1;
},100);

//! ----------------------------------------------------------------------------
//! 'CHALLENGE' EVERY 2 SECONDS (BOOT IF NON-RESPONSIVE)
//! ----------------------------------------------------------------------------
setInterval(function()
{
  connected.forEach(function(sock, challengeId)
  {
    sock.get('challenge', function(err, data)
    {
      if (data && data) //! FIXME -- wtf is this?
      {
        sock.disconnect()
      } 
      else 
      {
        sock.emit('ping');
        sock.set('challenge',true)
      }
    })

  });
},2000);

score = 0

//! ----------------------------------------------------------------------------
//! ADD NEW PLAYER TO THE GAME ON CONNECTION
//! ----------------------------------------------------------------------------

io.sockets.on('connection', function (socket) 
{
  socket.set('challenge', false)
  
  // generate unique id or the player
  var sockId = nextid();
  
  // create robot -- generate random position
  var pos = new V2();
  G.level.playable_area.randomWithin(pos);
  
  // create robot -- place a new robot object at this position
  var sockBot = new RobotImposter(sockId, pos); //! FIXME
  G.addRobot(sockBot);
  
  // tell OTHER PLAYERS about NEW PLAYER
  connected.forEach(function(otherSocket)
  {
    otherSocket.get('id', function(err, otherId)
    {
      var otherBot = G.robots[otherId];
      otherSocket.emit('newBot', 
                          { pos: sockBot.position, 
                            id: sockId, 
                            typ: otherBot.getPerceivedTypeOf(sockBot),
                            skn: sockBot.skin_i
                          });
    });
  });
  
  // attach an id to the socket
  connected[sockId] = socket;
  socket.set('id', sockId);
  
  // tell NEW PLAYER about OTHER PLAYERS
  G.robots.forEach(function(otherBot, otherId)
  {
    socket.emit('newBot', { pos: otherBot.position, 
                            id: otherId, 
                            typ: sockBot.getPerceivedTypeOf(otherBot),
                            skn: otherBot.skin_i});
  })

  //! --------------------------------------------------------------------------
  //! MANAGE CONNECTION
  //! --------------------------------------------------------------------------

  // -- client replying to 'are you alive?' request
  socket.on('pong', function(data)
  {
    if (data.id == sockId)
    {
      socket.set('challenge', false);
    } 
    else 
    {
      socket.disconnect();
    }
  })

  // -- client informing server that it wishes to disconnect
  socket.on('disconnect', function()
  {
    delete G.robots[sockId];
    socket.get('id', function(err, disconnectId)
    {
      connected.forEach(function(sock)
      {
        sock.emit('leave', {id: disconnectId});
      });
    });
  })

  // -- client sending user input to server
  socket.on('input', function(data)
  {
    socket.get('id', function(err, inputId)
    {
      var inputBot = G.robots[inputId];
      
      // SET MOVEMENT
      inputBot.trySetSpeed(data.x, data.y);
      
      // SET INTERACTION (if applicable)
      if (data.who != -1)
      {
        var interactTarget = G.robots[data.who];
        if (interactTarget && interactTarget.TYPE != Robot.TYPE_POLICE)
        {
          if (inputBot.position.dist2(inputBot.position) 
              < inputBot.MAX_INTERACT_DISTANCE2)
          {
            inputBot.tryInteractPeer(interactTarget);
          }
        }
      }
    });
  });
  
  // tell NEW PLAYER what their id is
  socket.emit('you', {id: sockId});
});
