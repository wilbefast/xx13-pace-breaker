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
//! CONSTANTS
//! ----------------------------------------------------------------------------



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


//! ----------------------------------------------------------------------------
//! OVERRIDE
//! ----------------------------------------------------------------------------

CivillianRobot.prototype.init = function(position_)
{
  Robot.prototype.init.call(this, position_);
  
  this.wander_timer = new Timer(1500);
  this.interact_timer = new Timer(3500);
  this.state = this.doWander;
}

CivillianRobot.prototype.perceiveObstacle = function(side)
{
  // flip a coin ...
  if(rand_bool())
  {
    side.reverse();
    // ... move away from collision ?
    this.move(side.x, side.y);
  }
  else
  {
    // ... stop ?
    this.move(0, 0);
  }
  
  // break off interactions
  this.startWander();
}

CivillianRobot.prototype.update = function(delta_t) 
{
  // call state method, whatever that may be
  this.state.call(this, delta_t);
  
  // update position
  Robot.prototype.update.call(this);
};

CivillianRobot.prototype.consentToInteract = function(otherRobot) 
{
  // civillians are always happy to interact if not already interacting
  return (this.interactPeer == null);
}

//! ----------------------------------------------------------------------------
//! FINITE STATE MACHINE -- ENTER
//! ----------------------------------------------------------------------------

CivillianRobot.prototype.startWander = function()
{
  //console.log(this.id + " is going back to wandering");
  
  // cancel interaction
  this.tryInteractPeer(null);
  
  // move out in a random direction or stop
  this.move(rand_bool() ? 0 : rand_sign(), 
            rand_bool() ? 0 : rand_sign());
  
  // randomise move time
  this.wander_timer.randomTime();
  
  // set state
  this.state = this.doWander;
}

CivillianRobot.prototype.tryInteract = function()
{
  //console.log("--------- ***START*** Civillian::TRY INTERACT : " + this.id);
  
  // check if close enough and peer accepts
  if(this.nearest
  && this.nearest.dist2 <= MAX_INTERACT_DISTANCE2 
  && this.tryInteractPeer(this.nearest.bot))
  {
    //console.log(this.id + ' successfully started interaction with ' + this.nearest.bot.id);
    this.startInteract();
    //console.log(this.id + " -> " + this.interactPeer.id + " && " 
    //+ this.interactPeer.id + " -> " + this.interactPeer.interactPeer.id);
  }
  
  // otherwise go back to wandering
  else
  {
    //console.log(this.id + ' failed interaction with ' + this.nearest.bot.id);
    this.startWander();
  }
  
  //console.log("--------- *END* TRY INTERACT : " + this.id);
  //console.log();
  //console.log();
}

CivillianRobot.prototype.startInteract = function()
{
  // default stuff
  Robot.prototype.startInteract.call(this);
  
  // also reset state
  this.interact_timer.reset();
  this.state = this.doInteract;
}

CivillianRobot.prototype.cancelInteract = function()
{
  // default stuff
  Robot.prototype.cancelInteract.call(this);
  
  // also reset state
  this.startWander();
}

//! ----------------------------------------------------------------------------
//! FINITE STATE MACHINE -- EXECUTE
//! ----------------------------------------------------------------------------

CivillianRobot.prototype.doWander = function(delta_t)
{
  // wander around
  
  // change state after a certain amount of time
  if(this.wander_timer.update(dt))
  { 
    rand_call([this.startWander, this.tryInteract], this);
  }
}

CivillianRobot.prototype.doInteract = function(delta_t)
{
  // stop interacting after a certain amount of time
  if(this.interact_timer.update(dt) && this.interactPeer.humanControlled)
  { 
    //console.log(this.id + ' stopped interacting becaused BORED!');
    this.startWander();
    //console.log(this.id + ' FINISHED BOREDOM DISCONNECT');
    //console.log();
    //console.log();
    
  }
}