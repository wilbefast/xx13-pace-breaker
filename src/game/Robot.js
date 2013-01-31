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

//! ----------------------------------------------------------------------------
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

Robot = function(id_, position_, skin_i_)
{
  this.init(id_, position_, skin_i_);
  return this;
}

//! ----------------------------------------------------------------------------
//! CLASS ATTRIBUTES 
//! ----------------------------------------------------------------------------

// collisions and interactions
Robot.prototype.SPEED = 0.1;
Robot.prototype.radius = 12;
Robot.prototype.radius2 = Robot.prototype.radius * Robot.prototype.radius;
Robot.prototype.MAX_INTERACT_DISTANCE2 = 96 * 96;
// types enumeration
Robot.prototype.TYPE_CIVILLIAN = 0;
Robot.prototype.TYPE_POLICE = 1;
Robot.prototype.TYPE_IMPOSTER = 2;
Robot.prototype.TYPE_NAMES = [ "Civillian", "Police", "Imposter" ];
// states enumeration
Robot.prototype.STATE_IDLE = 0;
Robot.prototype.STATE_INTERACT = 1;
Robot.prototype.STATE_DYING = 2;
Robot.prototype.STATE_DEAD = 3;
// health and infection
Robot.prototype.MAX_INFECTION = 10000;

//! ----------------------------------------------------------------------------
//! INITIALISATION
//! ----------------------------------------------------------------------------

Robot.prototype.init = function(id_, position_, skin_i_)
{
  // identifier
  this.id = id_;
  
  //! FIXME -- replace with state
  this.killed = false;
  this.timeToDie = 0;
  this.dying = 0;
  this.dead = false;
  
  //! FIXME -- replace with type
  this.humanControlled = false;
  this.robotTeam = true;
  
  // state
  this.state_i = this.STATE_IDLE;
  
  //! FIXME
  // skin
  this.skin_i = (skin_i_ || rand(3)); // arbitrarily 3 skins maximum
     
  // interactions
  this.interactPeer = null;
  
  // nearest peer
  this.nearest = 
  { 
    bot : null, 
    dist2 : Infinity, 
  };
  
  // position and speed
  this.position = new V2(position_);
  this.speed = new V2();
  
  // client- and server-specific initialisations
  if(this.specialInit)
    this.specialInit();
}

//! ----------------------------------------------------------------------------
//! MOVEMENT AND COLLISIONS
//! ----------------------------------------------------------------------------

Robot.prototype.forceSetSpeed = function(x, y)
{
  this.speed.setXY(x, y);
}

Robot.prototype.trySetSpeed = function(x, y)
{
  this.forceSetSpeed(this.SPEED * bound(x, -1, 1), this.SPEED * bound(y, -1, 1));
};

Robot.prototype.collision = function(other)
{
  // move out of contact
  var manifold = new V2().setFromTo(other.position, this.position);
  manifold.normalise();
  this.position.addV2(manifold);
}

//! ----------------------------------------------------------------------------
//! INTERACTIONS
//! ----------------------------------------------------------------------------

Robot.prototype.consentToInteract = function(otherRobot) 
{
  // override to accept interactions
  this.dead = true;
  if ((otherRobot.humanControlled && otherRobot.robotTeam))
    this.killed = true;

  return (otherRobot.humanControlled && otherRobot.robotTeam);
}

Robot.prototype.cancelInteract = function()
{
  this.interactPeer = null;
  this.interactPeer_dist2 = Infinity;
}

Robot.prototype.startInteract = function()
{
  // override if needed
  if (this.interactPeer.humanControlled) 
  {
    if (this.interactPeer.robotTeam && this.robotTeam)
    { 
      // Cop kills robot
      this.interactPeer.dead = true;
    } 
    else
    {
      this.killed = true;
    }
  }
}

Robot.prototype.forceInteractPeer = function(newPeer)
{
  //! NB -- not safe, can lead to incoherence
  
  // ignore if same peer
  if(this.interactPeer == newPeer)
    return;
  
  // unlink from previous
  if(this.interactPeer != null)
    this.interactPeer.cancelInteract();
  
  // cancel if passed a null
  if(newPeer == null)
    this.cancelInteract();
  else
  {
    // link to new
    this.interactPeer = newPeer;
    this.interactPeer_dist2 = this.position.dist2(newPeer.position);
    
    // inform ai of connection
    this.startInteract();
    
    // stop from moving
    this.forceSetSpeed(0, 0);
  }
}

Robot.prototype.tryInteractPeer = function(newPeer)
{
  // skip if already interacting with this peer
  if(this.interactPeer == newPeer)
    return false;
  
  // cancel if passed a null
  if(newPeer == null)
  {
    this.forceInteractPeer(null);
    return false;
  } 
  
  // request interaction
  else if(!newPeer.consentToInteract(this))
  {
    this.forceInteractPeer(null);
    return false;
  }
  
  // link successful
  this.forceInteractPeer(newPeer);
  newPeer.forceInteractPeer(this);
  return true;
}

//! ----------------------------------------------------------------------------

Robot.prototype.perceiveObstacle = function(side)
{
  // overriden by ai!
}

Robot.prototype.update = function(delta_t) 
{
  // update position
  this.position.setXY(this.position.x + this.speed.x * dt,  //! FIXME -- why not delta_t?
                      this.position.y + this.speed.y * dt); //! FIXME -- why not delta_t?

  // if interacting
  if(this.interactPeer != null)
  {
    // update peer distance
    this.interactPeer_dist2 = this.position.dist2(this.interactPeer.position);
    // cancel if too far away
    if(this.interactPeer_dist2 > this.MAX_INTERACT_DISTANCE2)
      this.tryInteractPeer(null);
  }
  
  // client- or server-specific update code
  if(this.updateSpecial)
    this.updateSpecial(dt); //! FIXME -- why not delta_t?
}

Robot.prototype.getPerceivedTypeOf = function(otherBot)
{
  return (otherBot.TYPE == this.TYPE_IMPOSTER && this.TYPE != this.TYPE_IMPOSTER)
          ? this.TYPE_CIVILLIAN : otherBot.TYPE;
}

Robot.prototype.toString = function() 
{
  return (this.TYPE_NAMES[this.TYPE] + "(" + this.id + ")");
}
