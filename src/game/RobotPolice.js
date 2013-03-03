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

RobotPolice = function(id_, position_, skin_i_)
{
	this.init(id_, position_, skin_i_);
  return this;
}
//! ----------------------------------------------------------------------------
//! PROTOTYPE
//! ----------------------------------------------------------------------------

// inherits from Robot
RobotPolice.prototype = new Robot();
RobotPolice.prototype.TYPE = Robot.prototype.TYPE_POLICE;
RobotPolice.prototype.SPEED = 0.15; // 1.5 times faster than others
RobotPolice.prototype.radius = 24;
RobotPolice.prototype.radius2 = RobotPolice.prototype.radius * 
                                RobotPolice.prototype.radius;

//! ----------------------------------------------------------------------------
//! TYPE CHECKING
//! ----------------------------------------------------------------------------

// this is redundant, but makes code a lot easier to read
RobotPolice.prototype.isPolice = true;
RobotPolice.prototype.isHumanControlled = true;
  
//! ----------------------------------------------------------------------------
//! INITIALISATION
//! ----------------------------------------------------------------------------

RobotPolice.prototype.init = function(id_, position_, skin_i_)
{
  // default stuff
  Robot.prototype.init.call(this, id_, position_, skin_i_);
  
  // Police can fire their LAZOR
  this.lock_on = new Bank(0, 0, 2000);
  this.firing = new Timer(200, false); // no auto-reset
  this.firing.unset();
  this.target = null;
}

//! ----------------------------------------------------------------------------
//! TARGETTING
//! ----------------------------------------------------------------------------

RobotPolice.prototype.setTarget = function(newTarget)
{
  if(this.target == newTarget)
    return;
  
  this.lock_on.setEmpty();
  this.target = newTarget;
  
  // client-side
  if(!is_server)
  {
    // play sound
    if(this.lock_on.isEmpty())
      play_police_interact();
    // lock on
    this.target = selected;
    selected = null;
  }
}

RobotPolice.prototype.openFire = function()
{
  // fire!
  this.firing.reset();
  
  // client-side
  if(!is_server)
  {
    play_audio("zap_explosion.ogg");
    G.view.addSpecialEffect(SpecialEffect.explosion(this.target.position));
    this.firing.position = this.target.position;
  }
      
  // kill target
  this.target.setHealth(this.target.EXPLODED);
      
  // lock-off
  this.setTarget(null);
}