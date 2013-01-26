/*
Copyright (C) 2013 William James Dyce, Kevin Bradshaw Jean-Bapiste Subils

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


//! ----------------------------------------------------------------------------
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

CivillianRobot = function(position_)
{
	this.init(position_);

  return this;
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE -- FUNCTIONS 
//! ----------------------------------------------------------------------------

// inherits from Robot
CivillianRobot.prototype = new Robot();

CivillianRobot.prototype.init = function(position_)
{
  Robot.prototype.init.call(this, position_);
  
  this.change_direction_timer = new Timer(2000);
}

CivillianRobot.prototype.update = function(delta_t) 
{
  // change direction periodically
  if(this.change_direction_timer.update(dt))
  {
    this.move(rand_sign(), rand_sign());
  }
  
  // update position
  Robot.prototype.update.call(this);
};