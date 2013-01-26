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
  if (data.id!=id) {
    G.robots[data.id].position.setXY(data.pos.x, data.pos.y);
  }
})

socket.on('newBot',function(data) {
  console.log(data)
  var b = new Robot(new V2(data.bot.position.x,data.bot.position.y));
  G.addRobot(data.id, b);
})

var updateRate = 1000/60;
var dt = 1/updateRate;


gs.switchstate(main);
setInterval(function(){
    gs.update();
  },(updateRate));

setInterval(function(){
    if (id>=0) {
      socket.emit('move',G.robots[id])
    }
  },100);