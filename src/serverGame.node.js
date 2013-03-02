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
//! SERVER-SIDE GAME METHODS
//!-----------------------------------------------------------------------------

Game.prototype.reset = function()
{
  this.robots = [];
  connected = [];
  
  // create Civillians
  var spawn_pos = new V2();
  for (var i=0; i < this.STARTING_CIVILLIANS; i++)
  {
    this.level.playable_area.randomWithin(spawn_pos);
    this.addRobot(new RobotCivillian(nextid(), spawn_pos));
  }
}

Game.prototype.recountBotTypes = function()
{
  this.n_civillians = this.n_hackers = this.n_police = 0;
  
  for(var i = 0; i < this.robots.length; i++)
  {
    var b = this.robots[i];
    if(!b || !b.isHealthy()) 
      continue;
    
    if(b.isCivillian)
      this.n_civillians++;
    else if(b.isImposter)
      this.n_hackers++;
    else if(b.isPolice)
      this.n_police++;
  }
}
  