var socket = io.connect(location.origin);
socket.on('load',function(data){
  if (data.callback)
    loadScript(data.url, data.callback);
  else
    loadScript(data.url);
});

var ctx = $('#canvas')[0].getContext("2d");
var canvas = document.getElementById('canvas');
var updateRate = 1000/60;

function loadScript(url, callback)
{
    // adding the script tag to the head as suggested before
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.src = url;
   script.id = 'tempid'

   // then bind the event to the callback function 
   // there are several events for cross browser compatibility
   script.onreadystatechange = callback;
   script.onload = callback;

   // fire the loading
   head.appendChild(script);
   var element = document.getElementById("tempid");
   //element.parentNode.removeChild(element);
}

loadScript('gamestate.js',function(){
	loadScript('main.js',function(){
		gs.switchstate(main);
		setInterval(function(){
	      gs.update();
	    },(updateRate));
	});
});