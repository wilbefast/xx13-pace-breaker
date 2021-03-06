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
//! TYPE CHECKING
//! ----------------------------------------------------------------------------

// this is redundant, but makes code a lot easier to read
RobotCivillian.prototype.isCivillian = true;

//! ----------------------------------------------------------------------------
//! INITIALISATION
//! ----------------------------------------------------------------------------

RobotCivillian.prototype.init = function(id_, position_, skin_i_)
{
  Robot.prototype.init.call(this, id_, position_, skin_i_);
  
  // timers
  this.wander_timer = new Timer(3000);
  this.interact_timer = new Timer(3000);
  this.infection_incubation = new Timer(6000, false);
  this.infection_incubation.reset();
  
  this.state = this.doWander;
  
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
  // perform standard update
  Robot.prototype.update.call(this, delta_t);
   
  // stop if dead
  if(!this.isHealthy())
    return;
  
  // call state method, whatever that may be
  this.state.call(this, delta_t);
  
  // virus wears off
  if(this.health == this.HEALTHY 
    && (!this.interactPeer || !this.interactPeer.isImposter))
  {
    this.infection -= delta_t;
    if(this.infection < 0) //! FIXME -- should use 'Bank' for bounded values
      this.infection = 0;
  }
  
  // virus kills civillians
  else if (this.health == this.INFECTED 
  && this.infection_incubation.update(delta_t))
  {
    this.setHealth(this.DEAD); 
  }
  else if(!is_server && this.infection_incubation.time.balance < 2000 
    && !this.goodbye_cruel_world)
  {
    this.goodbye_cruel_world = true;
    play_dead();
  }
};

RobotCivillian.prototype.consentToInteract = function(otherRobot) 
{
  // civillians are always happy to interact if not already interacting
  return (this.health != this.DEAD && this.health != this.DYING 
          && this.interactPeer == null);
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
  if(this.nearest && this.health != this.DYING && this.health != this.DEAD
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
  // -- WANDER AROUND --
  
  // change state after a certain amount of time
  if(this.wander_timer.update(delta_t))
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
  // become infected by virus
  if(this.health == this.HEALTHY && this.interactPeer.isImposter)
  {
    this.infection += delta_t;
    if(this.infection > this.MAX_INFECTION)
    {
      this.health = this.INFECTED;
      this.infection = this.MAX_INFECTION;
    }
  }
  
  // stop interacting after a certain amount of time
  if(this.interact_timer.update(delta_t) && !this.interactPeer.isHumanControlled)
    this.startWander();
}