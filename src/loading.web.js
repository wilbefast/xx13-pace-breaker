/** @author William J.D. **/

/*
HTML5 base code
Copyright (C) 2013 William James Dyce

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

"use strict";

/* RESOURCE MANAGEMENT */

// DATA_LOCATION variable must be defined before this script is included!

// global variables
var total_to_load = 0;
var left_to_load = 0;

// utility functions
var resourceLoaded = function()
{
  // one less to wait for
  if(left_to_load > 0)
    left_to_load--;
}

// simple image-loading API
function load_image(file_name)
{
  // inform the system that we want to load this image
  var image = new Image();
  image.src = DATA_LOCATION + file_name;
  
  // make sure we wait till its loaded
  image.onload = resourceLoaded;
  left_to_load++;
  total_to_load++;
  
  // return the handler so the object isn't deleted
  return image;  
}

// simple audio-loading API

function load_audio(file_name)
{
  // inform the system that we want to load this image
  var audio = new Audio();
  audio.preload = true;
  audio.src = DATA_LOCATION + file_name;
  
  // make sure we wait till its loaded
  audio.addEventListener('canplaythrough', resourceLoaded);
  left_to_load++;
  total_to_load++;
  
  // return the handler so the object isn't deleted
  return audio;
}

// simple audio-playing API
function play_audio(file_name)
{
  // create new Audio object: this allows for multiple sounds to overlap
  var audio = new Audio();
  audio.src = DATA_LOCATION + file_name;
  audio.play();
  // tell the interpretor to delete this object as soon as possible
  //delete audio;
}

// display a graphic while the game is loading
function loading_screen()
{
  // clear canvas
  context.fillStyle = "rgb(0, 0, 0)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // draw "loading" text
  context.fillStyle = "rgb(255, 255, 255)";
  context.font = "48pt monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  var percent_loaded = 100 - Math.round((left_to_load/total_to_load)*100);
  context.fillText("Loading " + percent_loaded + "%",
		    canvas.width/2, canvas.height/2);
}

/** TEST Jail-By 
--------------------------------------------------------------------------------


*/

window.onload = initialise;
var AudioContext;
var bufferLoader;

function initialise() {

  AudioContext = new webkitAudioContext();

  bufferLoader = new BufferLoader(
    AudioContext,
    [
    // ordre des fichier audio
      'audio/Battements_coeur.ogg'
    ],
    finishedLoading
    );

  bufferLoader.load();
}


function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}


BufferLoader.prototype.loadBuffer = function(url, index) {
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

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

//------------------------ 
function finishedLoading(bufferList) {

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
  }
  
}

var changeVolume = function(gn,value) 
{
  		gn.gain.value = value;
}

/**/

