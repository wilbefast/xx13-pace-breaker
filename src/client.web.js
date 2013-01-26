var is_server = false;

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

socket.on('move',function(data) {
  G.robots[data.id].position.setXY(data.pos.x, data.pos.y);
  G.robots[data.id].move(data.mov.x,data.mov.y);  
});

socket.on('newBot',function(data) {
  var b = new Robot(new V2(data.bot.position.x,data.bot.position.y));
  G.addRobot(data.id, b);
})

var updateRate = 1000/60;
var dt = updateRate;


gs.switchstate(main);
setInterval(function(){
    gs.update();
  },(updateRate));

setInterval(function(){
    var dx = keyboard.direction.x;
    var dy = keyboard.direction.y;
    if (id>=0) {
      socket.emit('move', {
        x: dx,
        y: dy
      });
    }
  },100);
