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

//!-----------------------------------------------------------------------------
//! CLIENT-SIDE GAME METHODS
//!-----------------------------------------------------------------------------

Game.prototype.reset = function()
{
  this.robots = [];
  this.n_civillians = this.n_hackers = this.n_police = 0;
}

Game.prototype.unpackRobot = function(packet)
{
  // parse new Robot from packet
  var newBot;
  switch(packet.typ)
  {
    case RobotCivillian.prototype.TYPE:
      newBot = new RobotCivillian(packet.id, packet.pos, packet.skn);
      break;
      
    case RobotPolice.prototype.TYPE:
      newBot = new RobotPolice(packet.id, packet.pos, packet.skn);
      break;
      
    case RobotImposter.prototype.TYPE:
      newBot = new RobotImposter(packet.id, packet.pos, packet.skn);
      break;
      
    default:
      console.log("invalid Robot type " + packet.typ);
      return null;
  }
  
  // packet may contain infection value (if local_bot is an Imposter)
  if(packet.sick)
    newBot.infection = packet.sick;
  
  return this.addRobot(newBot);
};

//!-----------------------------------------------------------------------------
//! GAMEVIEW -- CONSTRUCTOR 
//!-----------------------------------------------------------------------------

GameView = function()
{
  this.robot_list = [];
  this.special_effects = [];
  
  return this;
}

//!-----------------------------------------------------------------------------
//! GAMEVIEW -- CONSTANTS 
//!-----------------------------------------------------------------------------

GameView.prototype.GUI_ME = load_image("cercle.png");
GameView.prototype.GUI_TARGET = load_image("fleche.png");
GameView.prototype.BACKGROUND = load_image("map.png");
GameView.prototype.FOREGROUND = load_image("fore.png");

//!-----------------------------------------------------------------------------
//! GAMEVIEW -- SPECIAL EFFECTS
//!-----------------------------------------------------------------------------

GameView.prototype.addSpecialEffect = function(newEffect)
{
  this.special_effects.push(newEffect);
}

GameView.prototype.update = function(delta_t)
{
  // update special effects, remember those in need of deletion
  var cleanUp = [];
  for(var i = 0; i < this.special_effects.length; i++)
  {
    var object = this.special_effects[i];
    if(!object || object.update(delta_t))
    {
      cleanUp.push(i);
      this.special_effects[i] = null;
    }
  }
  // delete the indices in the cleanup list
  for(var i = 0; i < cleanUp.length; i++)
    this.special_effects.splice(cleanUp[i], 1);
  
}

//!-----------------------------------------------------------------------------
//! GAMEVIEW -- ROBOTS
//!-----------------------------------------------------------------------------

GameView.prototype.addRobot = function(newBot)
{
  this.robot_list.push(newBot);
}

GameView.prototype.draw = function()
{
  // draw the background
  context.drawImage(this.BACKGROUND, 0, 0);
  
  // draw each robot
  mapThenSort(this.robot_list, function(object, i) { object.draw(); } );
  
  // draw an arrow over potential targets, unless a target is already acquired
  if (selected && (!local_bot || !local_bot.target)) 
  {
    context.drawImage(this.GUI_TARGET,
                      selected.position.x - 25,
                      selected.position.y - 34);
  } 
  
  // draw each special effect
  mapThenSort(this.special_effects, function(object, i) { object.draw(); } );
  
  // draw the foreground
  context.drawImage(this.FOREGROUND, 0, 0);
  
  // draw the score, etc
  context.strokeStyle = 'white';
  context.lineWidth = 1;
  context.textAlign = 'center';
  context.strokeText("Civillians: " + G.n_civillians, canvas.width/3, 32);
  context.strokeText("Hackers: " + G.n_hackers, canvas.width/2, 32);
  context.strokeText("Police: " + G.n_police, canvas.width*2/3, 32);
};
