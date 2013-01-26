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
  
  this.change_direction_timer = new Timer(1500);
}

CivillianRobot.prototype.perceiveObstacle = function(side)
{
  if(rand_bool())
  {
    side.reverse();
    // move away from collision
    this.move(side.x, side.y);
  }
  else
  {
    // stop
    this.move(0, 0);
  }
  
  // randomise move time
  this.change_direction_timer.randomTime();
}

CivillianRobot.prototype.stop = function()
{
  console.log("want to stop");
  // stop
  this.move(0, 0);
}

CivillianRobot.prototype.wander = function()
{
  console.log("want to wander");
  // move in random direction
  this.move(rand_bool() ? 0 : rand_sign(), 
            rand_bool() ? 0 : rand_sign());
  
  // randomise move time
  this.change_direction_timer.randomTime();
}

CivillianRobot.prototype.gotoInteraction = function()
{
  console.log("want to interact");
  this.move(0, 0);
}

CivillianRobot.prototype.update = function(delta_t) 
{
  // change direction periodically
  if(this.change_direction_timer.update(dt))
  {
    rand_choice([this.stop, this.wander, this.gotoInteraction], this);
  }
  
  // update position
  Robot.prototype.update.call(this);
};