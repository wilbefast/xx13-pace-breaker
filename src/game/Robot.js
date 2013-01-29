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

Robot = function(position_, visual)
{
  this.init(position_, visual);
  return this;
}

//! ----------------------------------------------------------------------------
//! CLASS -- ATTRIBUTES 
//! ----------------------------------------------------------------------------

Robot.prototype.MAX_INTERACT_DISTANCE2 = 96*96;
Robot.prototype.TYP_CIVILLIAN = 0;
Robot.prototype.TYP_POLICE = 1;
Robot.prototype.TYP_IMPOSTER = 2;

//! ----------------------------------------------------------------------------
//! CREATION
//! ----------------------------------------------------------------------------

Robot.prototype.initSecret = function()
{
  // ONLY SERVER-SIDE HUMAN PLAYERS: nearest human
  if(this.humanControlled)
  {
    this.nearestHuman =
    {
      bot : null,
      dist2 : Infinity,
    };
    this.nearestCop =
    {
      bot : null,
      dist2 : Infinity,
    };
  }
  
}

Robot.prototype.init = function(position_, visual)
{
  this.killed = false;
  this.timeToDie = 0;
  this.dying = 0;
  this.dead = false;
  this.humanControlled = false;
  this.robotTeam = true;

  // collision
  this.radius = 16;
  this.radius2 = this.radius * this.radius;
  
  // skin
  this.skin = 
  if(!visual) 
    visual = (is_server) ? Math.round(2 * Math.random()) : 0;
  if(!is_server)
    this.animset = anims[visual];
     
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
  this.movement = new V2();
  this.facing = new V2(0, 1);
  
  // view
  if (!is_server)
  {
    this.view 
      = new AnimationView(this.animset.walk_E, new V2(32, 32), 0.005, REVERSE_AT_END);
  }
}


//! ----------------------------------------------------------------------------
//! MOVEMENT AND COLLISIONS
//! ----------------------------------------------------------------------------

Robot.prototype.move = function(x, y)
{
  x = bound(x, -1, 1);
  y = bound(y, -1, 1);
  this.movement.setXY(x * 0.1, y * 0.1);
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
    this.move(0, 0);
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
  if (!this.dead) {
    if (this.dying>0) {
      this.dying -= dt;
      if (this.dying<200) {
        if (!this.dead) {
          if (this.robotTeam) {
            score ++;
          }
          this.dead = true;
        }
        //this.dieFunction();
      }
    }
    if (this.killed && this.dying==0 && !this.dead)
      this.dying = this.timeToDie;

    // update position
    this.position.setXY(this.position.x + this.movement.x * dt, 
                        this.position.y + this.movement.y * dt);

    // update peer distance
    if(this.interactPeer != null)
    {
      this.interactPeer_dist2 = this.position.dist2(this.interactPeer.position);
      
      // cancel if too far away
      if(this.interactPeer_dist2 > MAX_INTERACT_DISTANCE2)
        this.tryInteractPeer(null);
    }
    
    // ... if moving or dead
    if (this.movement.x != 0 || this.movement.y != 0)
    {
      // update animation
      if(this.view)
        this.view.update(delta_t);
    }
  }
};

Robot.prototype.toString = function() 
{
  return ("robot(" + this.id + ")");
};
