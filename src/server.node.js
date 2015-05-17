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
require("./serverGame.node.js");

//require("lobby.node.js");
require("./main.node.js");

var UPDATES_PER_SECOND = 20;
var MILLISECONDS_PER_UPDATE = 1000 / UPDATES_PER_SECOND;

//! ----------------------------------------------------------------------------
//! INITIAL GAMESTATE IS LOBBY
//! ----------------------------------------------------------------------------
gs.switchstate(main); //! FIXME
setInterval(function(){ gs.update(); }, MILLISECONDS_PER_UPDATE);


//! ----------------------------------------------------------------------------
//! SERVER DEBUG CONSOLE
//! ----------------------------------------------------------------------------
/**/
repl = require('repl');
rep = repl.start(
{
  prompt: "server> ",
  input: process.stdin,
  output: process.stdout,
  useGlobal: true,
  ignoreUndefined: true
});
rep.on('exit', function () 
{
  console.log('Got "exit" event from repl!');
  process.exit();
});
/**/

io.set('log level', 1);

//! ----------------------------------------------------------------------------
//! SEND HTML 5 PAGE TO CLIENTS
//! ----------------------------------------------------------------------------
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

//! ----------------------------------------------------------------------------
//! GENERATE UNIQUE IDENTIFIERS
//! ----------------------------------------------------------------------------
var id = 0;
nextid = function() 
{
  return (id++);
}
connected = [];


//! ----------------------------------------------------------------------------
//! 10 TIMES PER SECOND
//! ----------------------------------------------------------------------------
setInterval(function()
{

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

tell_others_about = function(bot)
{
  connected.forEach(function(otherSocket)
  {
    otherSocket.get('id', function(err, otherId)
    {
      var otherBot = G.robots[otherId];
      if(otherBot && otherBot.id != bot.id)
      {
        otherSocket.emit('newBot', { 
                                      pos: bot.position, 
                                      id: bot.id, 
                                      typ: otherBot.getPerceivedTypeOf(bot),
                                      skn: bot.skin_i
                                    });
      }
      else
        //! FIXME -- should never happen
        console.log("Can't find Robot number " + otherId); 
        
    });
  });
}

tell_about_others = function(bot)
{
  G.robots.forEach(function(otherBot, otherId)
  {
    var newBotData = { pos: otherBot.position, 
                        id: otherId, 
                        typ: bot.getPerceivedTypeOf(otherBot),
                        skn: otherBot.skin_i,
                        hp: otherBot.health
    }
    // only tell hackers (imposters) about infection
    if(bot.TYPE == Robot.prototype.TYPE_IMPOSTER && otherBot.infection)
      newBotData.sick = otherBot.infection;

    connected[bot.id].emit('newBot', newBotData);
  });
}

io.sockets.on('connection', function (socket) 
{
	socket.set = function(key, val) { socket[key] = val; }
	socket.get = function(key) { return socket[key]; }

  socket.set('challenge', false)
  
  // generate unique id or the player
  var sockId = nextid();
  
  // attach an id to the socket
  connected[sockId] = socket;
  socket.set('id', sockId);
  
  // tell NEW PLAYER to RESET
  socket.emit('reset');
  
  // create player character
  G.new_player(sockId);
  
  
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
    gs.current.treatInput(sockId, inputData);
  });
  
  // -- client telling server that he wants to lock on
  socket.on('lockon', function(lockonData)
  {    
    socket.get('id', function(err, lockonId)
    {
      var lockonBot = G.robots[lockonId];
      
      // try to lock on to desired target
      if(lockonBot && 
        lockonBot.tryTarget(G.robots[lockonData ? lockonData.dest : null]))
      {
        // if successful tell everyone!
        var packet = { src : lockonId };
        if(lockonData)
          packet.dest = lockonData.dest;
        
        connected.forEach(function(sock, receiver_id)
        {
          sock.emit('lockon', packet);
        });
      }
    });
  });
  
  // tell NEW PLAYER what their id is
  socket.emit('you', {id: sockId});
});

//! ----------------------------------------------------------------------------
//! KILL A ROBOT
//! ----------------------------------------------------------------------------

reportDeath = function(deadBot)
{  
  connected.forEach(function(sock, receiver_id)
  {
    sock.emit('death', { id : deadBot.id });
  });
}

reportFire = function(subject)
{  
  connected.forEach(function(sock, receiver_id)
  {
    sock.emit('fire', { src : subject.id, hit_hax : subject.target.isImposter });
  });
}

//! ----------------------------------------------------------------------------
//! INFORM CLIENTS OF NUMBER OF REMAINING BOTS EVERY SECOND
//! ----------------------------------------------------------------------------

reportCount = function(game)
{  
  var packet = { civ : game.n_civillians, hax : game.n_hackers, pol : game.n_police }
  
  // END OF GAME ?
  if(G.contains_imposter && G.contains_police && game.n_hackers == 0)
  {
    // send gameover message
    connected.forEach(function(sock, id)
    { 
      sock.emit('gameover', packet); 
    });
  
    // reset the game server-side
    G.reset();
    
    // create a new set of player characters and "reconnect" all the players
    connected.forEach(function(sock, id)
    { 
      G.new_player(id);
    });
  }
  
  // SEND CURRENT TALLY ?
  else connected.forEach(function(sock, receiver_id) { sock.emit('count', packet); });
}

setInterval(function()
{
  G.recountBotTypes();
  reportCount(G);
},1000);

//! ----------------------------------------------------------------------------
//! TELL CLIENTS TO RESET
//! ----------------------------------------------------------------------------

reportReset = function()
{  
  connected.forEach(function(sock, receiver_id)
  {
    sock.emit('reset');
  });
}

