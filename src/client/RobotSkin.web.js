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

//!-----------------------------------------------------------------------------
//! SKIN BUILDER FUNCTION
//!-----------------------------------------------------------------------------

function buildSkin(image, i)
{
  this.prototype.SKINS[i] = 
  {
    WALK_N : new Animation(image, new V2(32, 32), new V2(0, 0), 3),
    WALK_E : new Animation(image, new V2(32, 32), new V2(0, 32), 3),
    WALK_W : new Animation(image, new V2(32, 32), new V2(0, 32), 3, FLIP_X),
    WALK_S : new Animation(image, new V2(32, 32), new V2(0, 64), 3),
    DIE : new Animation(image, new V2(32, 32), new V2(0, 96), 3)
  }
}

//!-----------------------------------------------------------------------------
//! CIVILLIAN SKINS 
//!-----------------------------------------------------------------------------
RobotCivillian.prototype.IMAGES =
[
  load_image('sheet_tron.png'),
  load_image('sheet_george.png'),
  load_image('sheet_mary.png')
];
RobotCivillian.prototype.SKINS = 
[
];
RobotCivillian.prototype.IMAGES.forEach(createRobotAnimation, RobotCivillian);


//!-----------------------------------------------------------------------------
//! POLICE SKINS 
//!-----------------------------------------------------------------------------

RobotPolice.prototype.IMAGES = 
[
  load_image('sheet_arnold.png');
];
RobotPolice.prototype.SKINS =
[
];
RobotPolice.prototype.IMAGES.forEach(createRobotAnimation, RobotPolice);

//!-----------------------------------------------------------------------------
//! IMPOSTER SKINS 
//!-----------------------------------------------------------------------------

RobotImposter.prototype.IMAGES = 
[
  load_image('sheet_imposter.png');
];
RobotImposter.prototype.SKINS =
[
];
RobotImposter.prototype.IMAGES.forEach(createRobotAnimation, RobotPolice);

    
/*animWifi = new Animation(imgWifi, new V2(32, 32), new V2(0, 0), 3);
animSmoke = new Animation(imgSmoke, new V2(32, 32), new V2(0, 0), 5);
animExplosion = new Animation(imgExplosion, new V2(32, 32), new V2(0, 0), 8);
imgElectrocution = new Animation(imgElectrocution, new V2(32, 32), new V2(0, 0), 8);*/


//!-----------------------------------------------------------------------------
//! DRAW ROBOTS
//!-----------------------------------------------------------------------------

Robot.prototype.draw = function() 
{
  // only one of the two need draw the connection
  if(this.interactPeer && this.id > this.interactPeer.id)
  {
    var where = new V2().setBetween(this.position, this.interactPeer.position, 
                                    0.2 + Math.random()*0.6 );
    context.strokeStyle = 'rgb(82,176,36)';
    context.lineWidth = 1.0;
    context.strokeText(rand_bool() ? '0' : '1', where.x, where.y);
  }
  
  // set sprite to face in the robot's direction
  this.facing.setV2(this.movement).mapToXY(Math.round);
  if(this.facing.x < 0)
    this.view.setAnimation(this.skin.WALK_W);
  else if(this.facing.x > 0)
    this.view.setAnimation(this.skin.WALK_E);
  else if (this.facing.y < 0)
    this.view.setAnimation(this.skin.WALK_N);
  else if (this.facing.y > 0)
    this.view.setAnimation(this.skin.WALK_S);
  
  // don't animate if not moving
  if(this.facing.isNull())
    this.view.setSubimage(1);
  
  // don't animate if dead
  if(dead)
  {
    this.view.setAnimation(this.animset.DIE);
    this.view.setSubimage(2);
  }
  
  // draw the sprite
  this.view.draw(this.position);
  
  //! FIXME -- DEBUG STUFF
  //context.lineWidth = 1;
  //context.strokeText(this.id+"->"+(this.interactPeer?this.interactPeer.id:"null"), this.position.x + 32, this.position.y);
};