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
  var imgGeorge = load_image('images/sheet_george.png');
  
  var animGeorge =
  {
    walk_N : new Animation(imgGeorge, new V2(32, 32), new V2(0, 0), 3),
    walk_E : new Animation(imgGeorge, new V2(32, 32), new V2(0, 32), 3),
    walk_W : new Animation(imgGeorge, new V2(32, 32), new V2(0, 32), 3),
    walk_S : new Animation(imgGeorge, new V2(32, 32), new V2(0, 64), 3)
  }
}
  

//! ----------------------------------------------------------------------------
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

Robot = function(position_)
{
  this.position = position_;
  this.movement = new V2();
  

	if (!is_server)
	{
    this.view = new AnimationView(animGeorge.walk_E, new V2(32, 32), 0.005, true);
	}

  return this;
}

copyBot = function(bot) {
	bot.__proto__ = Robot.prototype;
	bot.position.__proto__ = V2.prototype;
    bot.movement.__proto__ = V2.prototype;
	var b = new Robot(new V2(bot.position.x, bot.position.y));
    b.movement = bot.movement;
	return b;
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE
//! ----------------------------------------------------------------------------

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
/**/
	
	if (this.movement.y < 0 && this.view.anim != animGeorge.walk_S)
	{
		this.view.setAnimation(animGeorge.walk_S);
	}
	if (this.movement.y > 0 && this.view.anim != animGeorge.walk_N)
	{
		this.view.setAnimation(animGeorge.walk_N);
	}
	if (this.movement.x < 0 && this.view.anim != animGeorge.walk_E)
	{
		this.view.setAnimation(animGeorge.walk_E);
	}
	if (this.movement.x > 0 && this.view.anim != animGeorge.walk_W)
	{
		this.view.setAnimation(animGeorge.walk_W);
	}

/**/	
	if(this.view)
		this.view.draw(this.position);
};

