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
//! GAMEVIEW -- CONSTRUCTOR 
//!-----------------------------------------------------------------------------

GameView = function()
{
  this.draw_list = [];
  return this;
}

//!-----------------------------------------------------------------------------
//! GAMEVIEW -- CONSTANTS 
//!-----------------------------------------------------------------------------

GameView.prototype.GUI_ME = load_image("cercle.png");
GameView.prototype.GUI_TARGET = load_image("fleche.png");
GameView.prototype.BACKGROUND = load_image("map.png");
GameView.prototype.FOREGROUND = load_image("fore.png");

GameView.prototype.addRobot = function(newBot)
{
  this.draw_list.push(newBot);
}

GameView.prototype.draw = function()
{
  // draw the background
  context.drawImage(this.BACKGROUND, 0, 0);
  
  // draw a circle around the controlled robot
   
  /*if (local_bot) 
  {
    context.drawImage(this.GUI_ME, 
                      local_bot.position.x - local_bot.SPRITE_SIZE.x * 0.2,
                      local_bot.position.y + local_bot.SPRITE_SIZE.y * 0.2);
  }*/
  
  // draw each robot
  for(var i = 0; i < this.draw_list.length; i++)
  {
    // draw each object
    var current = this.draw_list[i];
    current.draw();
    
    // re-sort the list based on y value
    if(i)
    {
      var previous = this.draw_list[i-1];
      if(current.position.y < previous.position.y)
      {
        // perform on step of bubble sort
        this.draw_list[i-1] = current;
        this.draw_list[i] = previous;
      }
    }
  }
  
  // draw the targeter
  if (selected) 
  {
    context.drawImage(this.GUI_TARGET,
                      selected.position.x - 6,
                      selected.position.y - 24);
  } 
  
  // draw the foreground
  context.drawImage(this.FOREGROUND, 0, 0);
};
