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

RobotCivillian = function(id_, position_, skin_i_)
{
	this.init(id_, position_, skin_i_);

  return this;
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE -- FUNCTIONS 
//! ----------------------------------------------------------------------------

// inherits from Robot
RobotCivillian.prototype = new Robot();
RobotCivillian.prototype.TYPE = Robot.prototype.TYPE_CIVILLIAN;

//! ----------------------------------------------------------------------------
//! INITIALISATION
//! ----------------------------------------------------------------------------

RobotCivillian.prototype.init = function(id_, position_, skin_i_)
{
  Robot.prototype.init.call(this, id_, position_, skin_i_);
  
  this.timeToDie = 5000; //! FIXME
  
  // timers
  this.wander_timer = new Timer(1500);
  this.interact_timer = new Timer(3500);
  this.state = this.doWander; //! FIXME -- masks Robot.state
  
  // health
  this.infection = 0;
}

//! ----------------------------------------------------------------------------
//! OVERRIDES
//! ----------------------------------------------------------------------------

RobotCivillian.prototype.perceiveObstacle = function(side)
{
  // flip a coin ...
  if(rand_bool())
  {
    side.reverse();
    // ... move away from collision ?
    this.trySetSpeed(side.x, side.y);
  }
  else
  {
    // ... stop ?
    this.forceSetSpeed(0, 0);
  }
  
  // break off interactions
  this.startWander();
}

RobotCivillian.prototype.update = function(delta_t) 
{
  // call state method, whatever that may be
  this.state.call(this, delta_t);
  
  // update position
  Robot.prototype.update.call(this);
};

RobotCivillian.prototype.consentToInteract = function(otherRobot) 
{
  // civillians are always happy to interact if not already interacting
  return (!this.dead && !this.killed && this.interactPeer == null);
}

RobotCivillian.prototype.whileInteracting = function(delta_t)
{
  if(this.interactPeer.TYPE == Robot.prototype.TYPE_IMPOSTER)
    this.infection += delta_t;
}

//! ----------------------------------------------------------------------------
//! FINITE STATE MACHINE -- ENTER
//! ----------------------------------------------------------------------------

RobotCivillian.prototype.startWander = function()
{
  // cancel interaction
  this.tryInteractPeer(null);
  
  // move out in a random direction or stop
  this.trySetSpeed(rand_bool() ? 0 : rand_sign(), 
                   rand_bool() ? 0 : rand_sign());
  
  // randomise move time
  this.wander_timer.randomTime();
  
  // set state
  this.state = this.doWander;
}

RobotCivillian.prototype.tryInteract = function()
{
  // check if close enough and peer accepts
  if(this.nearest && !this.dead && !this.killed
  && this.nearest.dist2 <= this.MAX_INTERACT_DISTANCE2 
  && this.tryInteractPeer(this.nearest.bot))
    this.startInteract();
  
  // otherwise go back to wandering
  else
    this.startWander();
}

RobotCivillian.prototype.startInteract = function()
{
  // default stuff
  Robot.prototype.startInteract.call(this);
  
  // also reset state
  this.interact_timer.reset();
  this.state = this.doInteract;
}

RobotCivillian.prototype.cancelInteract = function()
{
  // default stuff
  Robot.prototype.cancelInteract.call(this);
  
  // also reset state
  this.startWander();
}

//! ----------------------------------------------------------------------------
//! FINITE STATE MACHINE -- EXECUTE
//! ----------------------------------------------------------------------------

RobotCivillian.prototype.doWander = function(delta_t)
{
  // wander around
  
  // change state after a certain amount of time
  if(this.wander_timer.update(dt))
  {
    // more likely to wander than to interact
    var dice_roll = rand(12);
    if(dice_roll >= 10)
      this.tryInteract();
    else
      this.startWander();
  }
}

RobotCivillian.prototype.doInteract = function(delta_t)
{
  // stop interacting after a certain amount of time
  if(this.interact_timer.update(dt) && !this.interactPeer.humanControlled)
    this.startWander();
}