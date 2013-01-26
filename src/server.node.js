is_server = true;

mime = require('mime')
  , app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

require("./utility.js");
require("./game.js");
require("./V2.js");
require("./Rect.js");
require("./Bank.js")
require("./Timer.js")
require("./Robot.js");
require("./CivillianRobot.js");
require("./gamestate.js");
require("./main.node.js");


updateRate = 1000/10;
dt = updateRate;

gs.switchstate(main);
setInterval(function(){ gs.update(); },(updateRate));


/**
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

function handler (req, res) {
  var filename = req.url;
  if (filename === '/') {
    filename = '/index.html';
  }
  fs.readFile(__dirname + filename,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Mistakes were made...');
    }
    res.writeHead(200, {'Content-Type': mime.lookup(filename)});
    res.end(data);
  });
}

var x = 0;
function nextid() {
  return x++;
}

connected = [];

setInterval(function(){
  connected.forEach(function(sock, id){
    G.robots.forEach(function(bot, dd){
      sock.emit('move', {
        pos: {x:bot.position.x, y:bot.position.y},
        mov: {x:bot.movement.x, y:bot.movement.y},
        id: dd
      });
    });
  });
},100);



io.sockets.on('connection', function (socket) {
  // Add a player to the game
  var r = new Robot(new V2(100,100))
  var id = nextid();
  connected.forEach(function(sock){
    sock.emit('newBot',{bot: r, id: id});
  });
  connected[id]=socket;
  socket.set('id',id);
  G.addRobot(id, r);
  G.robots.forEach(function(bot, id){
    socket.emit('newBot',{bot: bot, id: id});
  })

  socket.on("move", function(data){
    socket.get('id', function(err, dd){
      G.robots[dd].move(data.x, data.y);
    });
  });
  socket.emit('you', {id: id});

	socket.emit("hello");
});
