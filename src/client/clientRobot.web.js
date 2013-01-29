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

function addSkin(skin_array, image_file, is_cop) //! is_cop is a kludge
{
  var image = load_image(image_file);
  if (!is_cop) {
	skin_array.push
		({
			WALK_N : new Animation(image, new V2(32, 32), new V2(0, 0), 3),
			WALK_E : new Animation(image, new V2(32, 32), new V2(0, 32), 3),
			WALK_W : new Animation(image, new V2(32, 32), new V2(0, 32), 3, FLIP_X),
			WALK_S : new Animation(image, new V2(32, 32), new V2(0, 64), 3),
			DIE : new Animation(image, new V2(32, 32), new V2(0, 96), 3)
		});
	} else {
	skin_array.push
		({
			WALK_N : new Animation(image, new V2(64, 64), new V2(0, 0), 3),
			WALK_E : new Animation(image, new V2(64, 64), new V2(0, 64), 3),
			WALK_W : new Animation(image, new V2(64, 64), new V2(0, 64), 3, FLIP_X),
			WALK_S : new Animation(image, new V2(64, 64), new V2(0, 128), 3),
			DIE : new Animation(image, new V2(64, 64), new V2(0, 192), 3)
		});
	}
}


//!-----------------------------------------------------------------------------
//! CIVILLIAN SKINS 
//!-----------------------------------------------------------------------------
RobotCivillian.prototype.SKINS = [];
addSkin(RobotCivillian.prototype.SKINS, 'sheet_george.png');
addSkin(RobotCivillian.prototype.SKINS, 'sheet_mary.png');
addSkin(RobotCivillian.prototype.SKINS, 'sheet_tron.png');


//!-----------------------------------------------------------------------------
//! POLICE SKINS 
//!-----------------------------------------------------------------------------
RobotPolice.prototype.SKINS  = [];
addSkin(RobotPolice.prototype.SKINS , 'sheet_arnold.png');


//!-----------------------------------------------------------------------------
//! IMPOSTER SKINS 
//!-----------------------------------------------------------------------------
RobotImposter.prototype.SKINS  = [];
addSkin(RobotImposter.prototype.SKINS , 'sheet_imposter.png');



//!-----------------------------------------------------------------------------



//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- INITIALISE ROBOTS' ANIMATIONS
//!-----------------------------------------------------------------------------

Robot.prototype.specialInit = function()
{
  // initialise visual stuff on the client only
  this.skin = this.SKINS[this.skin_i];
  
  this.facing = new V2(0, 1);
  this.view = new AnimationView(this.skin.WALK_E, 
                                new V2(32, 32), 0.4, REVERSE_AT_END);
}

//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- DRAW ROBOTS
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
  
  // draw the sprite
  this.view.draw(this.position);
  
  //! FIXME -- DEBUG STUFF
  //context.lineWidth = 1;
  //context.strokeText(this.id+"->"+(this.interactPeer?this.interactPeer.id:"null"), this.position.x + 32, this.position.y);
};

//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- UPDATE ROBOTS' ANIMATIONS
//!-----------------------------------------------------------------------------

Robot.prototype.updateSpecial = function(delta_t)
{
  // update the sprite if moving
  if (this.speed.x != 0 || this.speed.y != 0)
  {
    // update direction
    this.facing.setV2(this.speed).mapToXY(Math.round);
    
    // set sprite to face in the robot's direction
    if(this.facing.x < 0)
      this.view.setAnimation(this.skin.WALK_W);
    else if(this.facing.x > 0)
      this.view.setAnimation(this.skin.WALK_E);
    else if (this.facing.y < 0)
      this.view.setAnimation(this.skin.WALK_N);
    else if (this.facing.y > 0)
      this.view.setAnimation(this.skin.WALK_S);
  }
  
  // update animation where applicable
  if(this.facing.isNull())
    this.view.setSubimage(1);
  else
    this.view.update(delta_t);
  

}


//! FIXME -- unused
/*animWifi = new Animation(imgWifi, new V2(32, 32), new V2(0, 0), 3);
animSmoke = new Animation(imgSmoke, new V2(32, 32), new V2(0, 0), 5);
animExplosion = new Animation(imgExplosion, new V2(32, 32), new V2(0, 0), 8);
imgElectrocution = new Animation(imgElectrocution, new V2(32, 32), new V2(0, 0), 8);*/
