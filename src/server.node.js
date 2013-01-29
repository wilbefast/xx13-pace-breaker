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
  
  //! FOREACH player identified by (Socket sock, int id)
  connected.forEach(function(sock, id)
  {
    nbPlayers++;
    //! FOREACH robot in the game identified by (Robot bot, int dd)
    G.robots.forEach(function(bot, dd)
    {
      sock.emit('synch', 
      {
        pos: {x: Math.round(bot.position.x), y:Math.round(bot.position.y)},
        mov: {x: Math.round(bot.speed.x*10), y:Math.round(bot.speed.y*10)},
        id: dd,
        interact: (bot.interactPeer == null) ? -1 : bot.interactPeer.id,
        dead: bot.dead
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
  connected.forEach(function(sock, id)
  {
    sock.get('challenge',function(err,data)
    {
      if (data && data)
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
  var id = nextid();
  
  // create robot -- generate random position
  var pos = new V2();
  G.level.playable_area.randomWithin(pos);
  
  // create robot -- place a new robot object at this position
  var newBot = new RobotImposter(pos);
  G.addRobot(id, newBot);
  
  // tell OTHER PLAYER about NEW PLAYER
  connected.forEach(function(sock)
  {
    sock.emit('newBot', { bot: newBot.position, id: id, skn: newBot.skin_i });
  });
  
  // 
  connected[id] = socket;
  socket.set('id', id);
  
  
  // tell NEW PLAYER about OTHER PLAYERS
  G.robots.forEach(function(bot, id)
  {
    socket.emit('newBot', {bot: bot.position, id: id, skn: bot.skin_i});
  })

  //! --------------------------------------------------------------------------
  //! MANAGE CONNECTION
  //! --------------------------------------------------------------------------

  // -- client replying to 'are you alive?' request
  socket.on('pong', function(data)
  {
    if (data.id == id)
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
    delete G.robots[id];
    socket.get('id', function(err, dd)
    {
      connected.forEach(function(sock)
      {
        sock.emit('leave',{id: dd});
      });
    });
  })

  // -- client sending user input to server
  socket.on('synch', function(data)
  {
    socket.get('id', function(err, synch_id)
    {
      if (synch_id) 
      {
        var synch_bot = G.robots[synch_id];
        
        // SET MOVEMENT
        synch_bot.trySetSpeed(data.x, data.y);
        
        // SET INTERACTION (if applicable)
        if (data.intid != -1)
        {
          var interactTarget = G.robots[data.intid];
          if (interactTarget && interactTarget.TYPE != Robot.TYPE_POLICE)
          {
            if (synch_bot.position.dist2(synch_bot.position) 
                < synch_bot.MAX_INTERACT_DISTANCE2)
            {
              synch_bot.tryInteractPeer(interactTarget);
            }
          }
        }
        else 
        {
          synch_bot.tryInteractPeer(null);
        }
      }
    });
  });
  
  // tell NEW PLAYER what its id is
  socket.emit('you', {id: id});
});
