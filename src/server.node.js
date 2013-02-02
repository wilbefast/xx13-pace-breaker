is_server = true;

mime = require('mime'), 
  app = require('http').createServer(handler)
  io = require('socket.io').listen(app)
  fs = require('fs');

require("./game/utility.js");
require("./game/objects.js");
require("./game/Game.js");
require("./game/V2.js");
require("./game/Rect.js");
require("./game/Bank.js")
require("./game/Timer.js")
require("./game/Robot.js");
require("./game/RobotCivillian.js");
require("./game/RobotPolice.js");
require("./game/RobotImposter.js");
require("./game/gamestate.js");

require("./serverRobot.node.js");
//require("lobby.node.js");
require("./main.node.js");

var UPDATES_PER_SECOND = 20;
var MILLISECONDS_PER_UPDATE = 1000 / UPDATES_PER_SECOND;

gs.switchstate(main);
setInterval(function(){ gs.update(); }, MILLISECONDS_PER_UPDATE);


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
  //! FOREACH player (socket) connected to the server
  connected.forEach(function(listenSock, listenSockId)
  {
    // the Robot whose owner will be sent the synchronisation/hint messages
    var listenBot = G.robots[listenSockId];
    
//! ----------------------------------------------------------------------------
//! SYNCHRONISE CLIENT AND SERVER (SEND THE STATE OF EACH ROBOT)
//! ----------------------------------------------------------------------------
    
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
    
//! ----------------------------------------------------------------------------
//! SEND EACH PLAYER A 'HINT' TELLING THEM HOW NEAR THE NEAREST ENEMY IS
//! ----------------------------------------------------------------------------
    
    if(listenBot && listenBot.nearestFoe && listenBot.nearestFoe.dist2 != Infinity)
    {
      listenSock.emit('hint', { 
          dist: Math.round(Math.sqrt(listenBot.nearestFoe.dist2)) 
      });
    }
  });
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
  
  var sockBot = (sockId % 2) 
                    ? new RobotPolice(sockId, pos) 
                    : new RobotImposter(sockId, pos);
  G.addRobot(sockBot);
  
  // tell OTHER PLAYERS about NEW PLAYER
  connected.forEach(function(otherSocket)
  {
    otherSocket.get('id', function(err, otherId)
    {
      var otherBot = G.robots[otherId];
      if(otherBot)
      {
        otherSocket.emit('newBot', { 
                                      pos: sockBot.position, 
                                      id: sockId, 
                                      typ: otherBot.getPerceivedTypeOf(sockBot),
                                      skn: sockBot.skin_i
                                    });
      }
      else
        //! FIXME -- should never happen
        console.log("Can't find Robot number " + otherId); 
        
    });
  });
  
  // attach an id to the socket
  connected[sockId] = socket;
  socket.set('id', sockId);
  
  // tell NEW PLAYER about OTHER PLAYERS
  G.robots.forEach(function(otherBot, otherId)
  {
    var newBotData = { pos: otherBot.position, 
                        id: otherId, 
                        typ: sockBot.getPerceivedTypeOf(otherBot),
                        skn: otherBot.skin_i }
    // only tell hackers (imposters) about infection
    if(sockBot.TYPE == Robot.prototype.TYPE_IMPOSTER && otherBot.infection)
      newBotData.sick = otherBot.infection;

    socket.emit('newBot', newBotData);
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
  socket.on('input', function(inputData)
  {
    socket.get('id', function(err, inputId)
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
        var interactTarget = G.robots[inputData.peer];
        if (interactTarget && interactTarget.TYPE != Robot.TYPE_POLICE)
        {
          if (inputBot.position.dist2(inputBot.position) 
              < inputBot.MAX_INTERACT_DISTANCE2)
          {
            inputBot.tryInteractPeer(interactTarget);
          }
        }
      }
      // CANCEL INTERACTION (if none is specified)
      else
        inputBot.forceInteractPeer(null);
    });
  });
  
  // -- client telling server that he want
  socket.on('lockon', function(lockonData)
  {    
    socket.get('id', function(err, lockonId)
    {
      
    //! FIXME
      var inputBot = G.robots[lockonId];
      if(!inputBot.isPolice)
      {
        console.log(inputBot + " sent lockon message: wtf?");
        return;
      }
      inputBot.tryTarget(G.robots[lockonData ? lockonData.dest : null]);
    });
  });
  
  // tell NEW PLAYER what their id is
  socket.emit('you', {id: sockId});
});

//! ----------------------------------------------------------------------------
//! KILL A ROBOT
//! ----------------------------------------------------------------------------

reportDeath = function(deadId)
{  
  connected.forEach(function(sock, challengeId)
  {
    sock.emit('death', { id : deadId });
  });
}

reportLockon = function(subject, object)
{  
  var packet = { src : subject.id };
  if(object)
    packet.dest = object.id;
  
  connected.forEach(function(sock, challengeId)
  {
    sock.emit('lockon', packet);
  });
}