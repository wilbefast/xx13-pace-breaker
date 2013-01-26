var is_server = false;


var meSelector = load_image("images/cercle.png")
var arrowSelector = load_image("images/fleche.png")

G = new game();


var socket = io.connect(location.origin);
socket.on('load',function(data){
  if (data.callback)
    loadScript(data.url, data.callback);
  else
    loadScript(data.url);
});

socket.on('hello',function(data) {
  console.log('Helloed');
});
id = -1;
socket.on('you',function(data) {
  id = data.id;
});

socket.on('leave',function(data){
  delete G.robots[data.id];
});

socket.on('hearbeat',function(data){
  console.log(data.vol);
});

socket.on('move',function(data) {
  var bot = G.robots[data.id];
  if (bot) {
    var dx = ( ((data.pos.x - bot.position.x)/5) + data.mov.x)*2;
    var dy = ( ((data.pos.y - bot.position.y)/5) + data.mov.y)*2;
    bot.movement.setXY(dx, dy);
    bot.animdirection.setXY(data.mov.x,data.mov.y);
  }
});

socket.on('newBot',function(data) {
  var b = new Robot(new V2(data.bot.position.x,data.bot.position.y));
  G.addRobot(data.id, b);
})

var updateRate = 1000/60;
var dt = updateRate/60;


gs.switchstate(main);
setInterval(function(){
    gs.update();
  },(updateRate));

setInterval(function(){
    var dx = keyboard.direction.x;
    var dy = keyboard.direction.y;
    if (id>=0) {
      socket.emit('move', {
        x: Math.round(dx),
        y: Math.round(dy)
      });
    }
  },100);
