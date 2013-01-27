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
//! CONSTANTS
//! ----------------------------------------------------------------------------

MAX_INTERACT_DISTANCE2 = 96*96;

//! ----------------------------------------------------------------------------
//! CLASS -- ATTRIBUTES 
//! ----------------------------------------------------------------------------
if(!is_server)
{
  var imgTron = load_image('images/sheet_tron.png');
  var imgGeorge = load_image('images/sheet_george.png');
  var imgMarie = load_image('images/sheet_marie_antoinette.png');
  var imgFlic = load_image('images/sheet_flic.png');

  var animTron =
  {
    walk_N : new Animation(imgTron, new V2(32, 32), new V2(0, 0), 3),
    walk_E : new Animation(imgTron, new V2(32, 32), new V2(0, 32), 3),
    walk_W : new Animation(imgTron, new V2(32, 32), new V2(0, 32), 3, 
                           FLIP_HORIZONTAL),
    walk_S : new Animation(imgTron, new V2(32, 32), new V2(0, 64), 3)
  }
  
  var animGeorge =
  {
    walk_N : new Animation(imgGeorge, new V2(32, 32), new V2(0, 0), 3),
    walk_E : new Animation(imgGeorge, new V2(32, 32), new V2(0, 32), 3),
    walk_W : new Animation(imgGeorge, new V2(32, 32), new V2(0, 32), 3, 
                           FLIP_HORIZONTAL),
    walk_S : new Animation(imgGeorge, new V2(32, 32), new V2(0, 64), 3)
  }

  var animMarie =
  {
    walk_N : new Animation(imgMarie, new V2(32, 32), new V2(0, 0), 3),
    walk_E : new Animation(imgMarie, new V2(32, 32), new V2(0, 32), 3),
    walk_W : new Animation(imgMarie, new V2(32, 32), new V2(0, 32), 3, 
                           FLIP_HORIZONTAL),
    walk_S : new Animation(imgMarie, new V2(32, 32), new V2(0, 64), 3)
  }

  var animFlic =
  {
    walk_N : new Animation(imgFlic, new V2(32, 32), new V2(0, 0), 3),
    walk_E : new Animation(imgFlic, new V2(32, 32), new V2(0, 32), 3),
    walk_W : new Animation(imgFlic, new V2(32, 32), new V2(0, 32), 3, 
                           FLIP_HORIZONTAL),
    walk_S : new Animation(imgFlic, new V2(32, 32), new V2(0, 64), 3)
  }

  anims = [animMarie, animGeorge, animTron, animFlic];

}

visuals = {
  MARIE: 0,
  GEORGE: 1,
  TRON: 2,
  FLIC: 3
};
  

//! ----------------------------------------------------------------------------
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

Robot = function(position_,visual)
{
  this.init(position_, visual);
  return this;
}


/*
copyBot = function(bot) {
	bot.__proto__ = Robot.prototype;
	bot.position.__proto__ = V2.prototype;
    bot.movement.__proto__ = V2.prototype;
	var b = new Robot(new V2(bot.position.x, bot.position.y));
    b.movement = bot.movement;
	return b;
}
*/

//! ----------------------------------------------------------------------------
//! PROTOTYPE
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
      dir : new V2()
    };
    this.nearestCop =
    {
      bot : null,
      dist2 : Infinity,
      dir : new V2()
    };
  }
  
}

Robot.prototype.init = function(position_, visual)
{
  this.humanControlled = false;
  this.robotTeam = true;

  // collision
  this.radius = 8;
  this.radius2 = this.radius * this.radius;

  if (!is_server) {
    if (visual) {
      this.animset = anims[visual];
    } else {
      this.animset = anims[0];
    }
  } else {
    if (visual) {
      this.visual = visual;
    } else {
      this.visual = Math.round((3 - 1) * Math.random())
    }
  }
  
  // interactions
  this.interactPeer = null;
  
  // nearest peer
  this.nearest = 
  { 
    bot : null, 
    dist2 : Infinity, 
    dir : new V2()
  };
  
  // position and speed
  this.position = position_;
  this.movement = new V2();
  
  // view
  if (!is_server)
  {

    this.animdirection = new V2(0,1);
    this.view 
      = new AnimationView(this.animset.walk_E, new V2(32, 32), 0.005, REVERSE_AT_END);
  }
}

Robot.prototype.move = function(hori, vert) {
  var dx = 0;
  if (hori>0) {
    dx = 1;
  } else if (hori<0) {
    dx = -1
  }
  var dy = 0;
  if (vert>0) {
    dy = 1;
  } else if (vert<0) {
    dy = -1
  }
  this.movement.setXY(dx/10,dy/10);
};

Robot.prototype.toString = function() {
	return "dull-looking robot";
};

//! ----------------------------------------------------------------------------
//! ROBOT CONVERSATIONS
//! ----------------------------------------------------------------------------

Robot.prototype.interface = function(otherRobot) 
{
	console.log('Ello, ' + otherRobot);
};

Robot.prototype.consentToInteract = function(otherRobot) 
{
  // override to accept interactions
  return false;
}

Robot.prototype.cancelInteract = function()
{
  this.interactPeer = null;
  this.interactPeer_dist2 = Infinity;
}

Robot.prototype.startInteract = function()
{
  // override if needed
}

Robot.prototype.forceInteractPeer = function(newPeer)
{
  //! NB -- not safe, can lead to incoherence
  
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
  //console.log("--------- ***START*** Robot::TRYINTERACTPEER : " + this.id 
  //              + " -> " + ((newPeer != null) ? newPeer.id : newPeer) );
  
  // skip if already interacting with this peer
  if(this.interactPeer == newPeer)
  {
    //console.log(this.id + ' is already interacting with ' + ((newPeer != null) ? newPeer.id : newPeer));
    return false;
  }
  
  // cancel if passed a null
  if(newPeer == null)
  {
    //console.log(this.id + ' broke connection with ' + this.interactPeer.id);
    this.cancelInteract();
    return false;
  } 
  
  // request interaction
  else if(!newPeer.consentToInteract(this))
  {
    //console.log(this.id + ' was refused by ' + this.interactPeer);
    this.cancelInteract();
    return false;
  }

  //console.log(this.id + ' is now connected to ' + ((newPeer != null) ? newPeer.id : newPeer));
  
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
  
  // ... if moving
  if (this.movement.x != 0 || this.movement.y != 0)
  {
    // update animation
    if(this.view)
      this.view.update(delta_t);
  }
};

Robot.prototype.draw = function() 
{
    
  //! FIXME MAKE PRETTIER
  context.lineWidth = 3.0;
  context.strokeStyle = 'lime';
  if(this.interactPeer)
  {
    context.strokeLine(this.position.x, 
                         this.position.y, 
                         this.interactPeer.position.x, 
                         this.interactPeer.position.y);
  }
  
  
  
  
  
  var anix = this.animdirection.x;
  var aniy = this.animdirection.y;

  //this.view.setSpeed(0.005);
  if (anix < 0)
  {
    this.view.setAnimation(this.animset.walk_W);
  }
  else if (anix > 0)
  {
    this.view.setAnimation(this.animset.walk_E);
  }
	
	else if (aniy < 0)
	{
    this.view.setAnimation(this.animset.walk_N);
	}
	else if (aniy > 0 )
	{
		this.view.setAnimation(this.animset.walk_S);
	}
  else
  {
    //this.view.setSpeed(0);
    this.view.setSubimage(1);
  }
  
	// draw the sprite 
  this.view.draw(this.position);
  
  
  
  //! FIXME -- DEBUG STUFF
  //context.strokeText(this.id+"", this.position.x + 32, this.position.y);
};

Robot.prototype.collision = function(other)
{
  // move out of contact
  var manifold = new V2().setFromTo(other.position, this.position);
  manifold.normalise();
  this.position.addV2(manifold);
  
  // react to collision if applicable
  //this.perceiveObstacle(manifold.reverse().mapToXY(Math.round));
}
