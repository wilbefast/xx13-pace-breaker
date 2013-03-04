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

// server-only Robot code

//! ----------------------------------------------------------------------------
//! INITIALISATION
//! ----------------------------------------------------------------------------

Robot.prototype.specialInit = function()
{
  // only human-controlled Robots need care about displaying a proximity 'hint'
  if(this.isHumanControlled)
  {
    this.nearestFoe =
    {
      bot : null,
      dist2 : Infinity,
    };
  }  
}

//! ----------------------------------------------------------------------------
//! TARGETTING
//! ----------------------------------------------------------------------------

RobotPolice.prototype.update = function(delta_t) 
{
  // perform standard update
  Robot.prototype.update.call(this, delta_t);
   
  // finish firing
  this.firing.update(delta_t);
  
  // stop if dead
  if(!this.isHealthy())
    return;
  
  // lock on progressively if already locked on 
  if(this.target)
  {
    this.lock_on.deposit(delta_t);
    if(this.lock_on.isFull())
    {
      reportFire(this);
      this.openFire();
    }
  }
  else
    this.lock_on.setEmpty();
}

RobotPolice.prototype.tryTarget = function(object)
{
  if(this.isHealthy() && (!object || !object.isPolice) && !this.firing.isSet())
  {
    this.setTarget(object);
    return true;
  }
  else
    return false;
}