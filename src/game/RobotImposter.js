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

RobotImposter = function(id_, position_, skin_i_)
{
  this.init(id_, position_, skin_i_);
  return this;
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE
//! ----------------------------------------------------------------------------

// inherits from Robot
RobotImposter.prototype = new Robot();
RobotImposter.prototype.TYPE = Robot.prototype.TYPE_IMPOSTER;

//! ----------------------------------------------------------------------------
//! TYPE CHECKING
//! ----------------------------------------------------------------------------

// this is redundant, but makes code a lot easier to read
RobotImposter.prototype.isImposter = true;
RobotImposter.prototype.isHumanControlled = true;

//! ----------------------------------------------------------------------------
//! INITIALISATION
//! ----------------------------------------------------------------------------

RobotImposter.prototype.init = function(id_, position_, skin_i_)
{
  Robot.prototype.init.call(this, id_, position_, skin_i_);
  
  this.hacker_corpse = true;
}


RobotImposter.prototype.startInteract = function()
{
  if(this.interactPeer.isPolice)
    this.setHealth(this.DEAD);
}