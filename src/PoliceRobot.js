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

PoliceRobot = function(position_)
{
	this.init(position_);
  return this;
}
//! ----------------------------------------------------------------------------
//! PROTOTYPE
//! ----------------------------------------------------------------------------

// inherits from Robot
PoliceRobot.prototype = new Robot();

PoliceRobot.prototype.init = function(position_)
{
 	Robot.prototype.init.call(this, position_);
 	if (!is_server) {
		this.animset = animFlic;
	} else {
		this.visual = 4
	}
}

PoliceRobot.prototype.update = function(delta_t) {
  if (!this.dead) {
    if (this.dying>0) {
      this.dying -= dt;
      if (this.dying<200) {
        if (!this.dead) {
          this.dead = true;
        }
        //this.dieFunction();
      }
    }
    if (this.killed && this.dying==0 && !this.dead) {
      this.dying = this.timeToDie;
    }

    //if (is_server)
    {
      this.position.setXY(this.position.x+this.movement.x*dt*1.5, this.position.y+this.movement.y*dt*1.5);
    }

    if (!(this.movement.x == 0 && this.movement.y == 0))
    {
      if(this.view)
        this.view.update(delta_t);
    }
  }
};

PoliceRobot.prototype.startInteract = function() {
  // body...
};