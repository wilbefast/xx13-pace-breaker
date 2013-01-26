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
//! CLASS -- ATTRIBUTES 
//! ----------------------------------------------------------------------------
if(!is_server)
{
  var imgTron = load_image('images/sheet_tron.png');
  var imgGeorge = load_image('images/sheet_george.png');
  var imgMarie = load_image('images/sheet_marie_antoinette.png');

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

  anims = [animMarie, animGeorge, animTron];

}
  

//! ----------------------------------------------------------------------------
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

Robot = function(position_)
{
  this.init(position_);
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

Robot.prototype.init = function(position_)
{
  this.radius = 8;
  this.radius2 = this.radius * this.radius;
  this.male = Math.random()<0.5;
  if (!is_server)
    this.animset = anims[Math.floor(Math.random()*anims.length)];
  this.position = position_;
  this.movement = new V2();
  this.animdirection = new V2(0,1);
  this.view = (is_server) 
        ? false 
        :  new AnimationView(this.animset.walk_E, new V2(32, 32), 0.005, REVERSE_AT_END);
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

Robot.prototype.interface = function(otherRobot) {
	console.log('Ello, ' + otherRobot);
};

Robot.prototype.perceiveObstacle = function(side)
{
  // overriden by ai!
}

Robot.prototype.update = function(delta_t) {
  //if (is_server)
  {
    this.position.setXY(this.position.x+this.movement.x*dt, this.position.y+this.movement.y*dt);
  }

  if (!(this.movement.x == 0 && this.movement.y == 0))
  {
    if(this.view)
      this.view.update(delta_t);
  }
};

Robot.prototype.draw = function() {
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
	
  this.view.draw(this.position);
};

Robot.prototype.collision = function(other)
{
  // move out of contact
  var manifold = new V2().setFromTo(other.position, this.position);
  manifold.normalise();
  this.position.addV2(manifold);
  
  // react to collision if applicable
  this.perceiveObstacle(manifold.reverse().mapToXY(Math.round));
}
