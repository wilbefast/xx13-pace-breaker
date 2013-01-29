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
//! GUI ELEMENTS
//!-----------------------------------------------------------------------------

Game.prototype.meSelector = load_image("cercle.png");
Game.prototype.arrowSelector = load_image("fleche.png");

//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- DRAW GUI
//!-----------------------------------------------------------------------------

Game.prototype.draw = function()
{
  // draw the background
  context.drawImage(this.map, 0, 0);
  
  // draw a circle around the controlled robot
   
  if (local_bot) 
  {
    context.drawImage(this.meSelector, 
                      local_bot.position.x - local_bot.SPRITE_SIZE.x * 0.2,
                      local_bot.position.y + local_bot.SPRITE_SIZE.y * 0.2);
  }
  
  // draw each robot
  this.robots.forEach(function(bot) { bot.draw(); });
  
  // draw the targeter
  if (selected) 
  {
    context.drawImage(this.arrowSelector,
                      selected.position.x - 6,
                      selected.position.y - 24);
  } 
};
