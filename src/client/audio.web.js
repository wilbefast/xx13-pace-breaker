/*
Copyright (C) 2013 William James Dyce, Kevin Bradshaw and Jean-Bapiste Subils

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


/** TEST Jail-By 
--------------------------------------------------------------------------------

*/  // add a / to uncomment


for (var i=1;i<=6;i++) {
  load_audio('Civilbot_chatter_'+i+'.ogg');
}
for (var i=1;i<=3;i++) {
  load_audio('Civilbot_death_'+i+'.ogg');
}
for (var i=1;i<=4;i++) {
  load_audio('Copbot_chatter_'+i+'.ogg');
}
load_audio('Copbot_death_1.ogg');
load_audio('Copbot_reward_1.ogg');


window.onload = initialise;
var AudioContext;
var bufferLoader;

function initialise() 
{

  AudioContext = new webkitAudioContext();
  var load_list = [];
  load_list.push(DATA_LOCATION + 'sounds/Battements_coeur.ogg');
  load_list.push(DATA_LOCATION + 'sounds/DarkBounty.ogg');
  bufferLoader = new BufferLoader
  (
    AudioContext,
    load_list,
    finishedLoading
  );
  bufferLoader.load();
}


function BufferLoader(context, urlList, callback) 
{
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}


BufferLoader.prototype.loadBuffer = function(url, index) 
{
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response

    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() 
  {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() 
{
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

//------------------------ 
function finishedLoading(bufferList) 
{
  window.VolumeSample = {};
  VolumeSample.gainNode = new Array();
  VolumeSample.source = new Array();
  
  for(var i = 0;i < bufferList.length;i++)
  {
    VolumeSample.gainNode[i] = AudioContext.createGainNode();
    VolumeSample.source[i] = AudioContext.createBufferSource();
    VolumeSample.source[i].buffer = bufferList[i];
    VolumeSample.source[i].connect(VolumeSample.gainNode[i]);
    VolumeSample.gainNode[i].connect(AudioContext.destination);
    changeVolume(VolumeSample.gainNode[i],0);  
  }
  
  //if(local_bot)
  {
    var sample_index = (local_bot.isPolice ? 0 : 1);
    VolumeSample.source[sample_index].noteOn(0);
    VolumeSample.source[sample_index].loop = true;
  }
}

var changeVolume = function(gn,value) 
{
  gn.gain.value = value;
}

/**/