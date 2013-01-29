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

function addSkin(skin_array, image_file)
{
  var image = load_image(image_file);
  skin_array.push
  ({
    WALK_N : new Animation(image, new V2(32, 32), new V2(0, 0), 3),
    WALK_E : new Animation(image, new V2(32, 32), new V2(0, 32), 3),
    WALK_W : new Animation(image, new V2(32, 32), new V2(0, 32), 3, FLIP_X),
    WALK_S : new Animation(image, new V2(32, 32), new V2(0, 64), 3),
    DIE : new Animation(image, new V2(32, 32), new V2(0, 96), 3)
  });
}


//!-----------------------------------------------------------------------------
//! CIVILLIAN SKINS 
//!-----------------------------------------------------------------------------
RobotCivillian.prototype.SKINS = [];
addSkin(RobotCivillian.prototype.SKINS, 'sheet_george');
addSkin(RobotCivillian.prototype.SKINS, 'sheet_mary');
addSkin(RobotCivillian.prototype.SKINS, 'sheet_tron');


//!-----------------------------------------------------------------------------
//! POLICE SKINS 
//!-----------------------------------------------------------------------------
RobotPolice.prototype.SKINS  = [];
addSkin(RobotPolice.prototype.SKINS , 'sheet_arnold');


//!-----------------------------------------------------------------------------
//! IMPOSTER SKINS 
//!-----------------------------------------------------------------------------
RobotImposter.prototype.SKINS  = [];
addSkin(RobotImposter.prototype.SKINS , 'sheet_imposter');



//!-----------------------------------------------------------------------------



//!-----------------------------------------------------------------------------
//! INITIALISE ROBOTS
//!-----------------------------------------------------------------------------

Robot.prototype.initSpecial = function()
{
  // initialise visual stuff on the client only
  this.skin = this.SKINS[this.skin_i];
  this.facing = new V2(0, 1);
  this.view = new AnimationView(this.skin.walk_E, 
                                new V2(32, 32), 0.005, REVERSE_AT_END);
}

//!-----------------------------------------------------------------------------
//! DRAW ROBOTS
//!-----------------------------------------------------------------------------
Robot.prototype.draw = function() 
{
  // only one of the two need draw the connection
  if(this.interactPeer && this.id > this.interactPeer.id)
  {
    var where = new V2().setBetween(this.position, this.interactPeer.position, 
                                    0.2 + Math.random() * 0.6 );
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

//! FIXME -- unused
/*animWifi = new Animation(imgWifi, new V2(32, 32), new V2(0, 0), 3);
animSmoke = new Animation(imgSmoke, new V2(32, 32), new V2(0, 0), 5);
animExplosion = new Animation(imgExplosion, new V2(32, 32), new V2(0, 0), 8);
imgElectrocution = new Animation(imgElectrocution, new V2(32, 32), new V2(0, 0), 8);*/
