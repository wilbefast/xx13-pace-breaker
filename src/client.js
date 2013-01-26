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

socket.on('newBot',function(data) {
  var b = data.bot;
  b.__proto__ = Robot.prototype;
  G.addRobot(data.id, b);
})

var updateRate = 1000/60;
var dt = 1/updateRate;


gs.switchstate(main);
setInterval(function(){
    gs.update();
  },(updateRate));