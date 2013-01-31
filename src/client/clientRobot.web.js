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

function addSkin(skin_array, image_file, size)
{
  var image = load_image(image_file);
	skin_array.push
  ({
    WALK_N : new Animation(image, new V2(size, size), new V2(0, 0), 3),
    WALK_E : new Animation(image, new V2(size, size), new V2(0, size), 3),
    WALK_W : new Animation(image, new V2(size, size), new V2(0, size), 3, FLIP_X),
    WALK_S : new Animation(image, new V2(size, size), new V2(0, 2*size), 3),
    DIE : new Animation(image, new V2(size, size), new V2(0, 3*size), 3)
  });
}


//!-----------------------------------------------------------------------------
//! CIVILLIAN SKINS 
//!-----------------------------------------------------------------------------
RobotCivillian.prototype.SKINS = [];
addSkin(RobotCivillian.prototype.SKINS, 'sheet_george.png', 32);
addSkin(RobotCivillian.prototype.SKINS, 'sheet_mary.png', 32);
addSkin(RobotCivillian.prototype.SKINS, 'sheet_tron.png', 32);


//!-----------------------------------------------------------------------------
//! POLICE SKINS 
//!-----------------------------------------------------------------------------
RobotPolice.prototype.SKINS  = [];
addSkin(RobotPolice.prototype.SKINS , 'sheet_arnold.png', 64);


//!-----------------------------------------------------------------------------
//! IMPOSTER SKINS 
//!-----------------------------------------------------------------------------
RobotImposter.prototype.SKINS  = [];
addSkin(RobotImposter.prototype.SKINS , 'sheet_imposter.png', 32);



//!-----------------------------------------------------------------------------

// interface images

/*
var meSelector = load_image("cercle.png");
var arrowSelector = load_image("fleche.png");
*/

//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- INITIALISE ROBOTS' ANIMATIONS
//!-----------------------------------------------------------------------------

Robot.prototype.SPRITE_SIZE = new V2(32, 32);
RobotPolice.prototype.SPRITE_SIZE = new V2(64, 64);

Robot.prototype.specialInit = function()
{
  this.skin_i = (this.skin_i % this.SKINS.length);
  this.skin = this.SKINS[this.skin_i];
  
  this.facing = new V2(0, 1);
  this.view = 
    new AnimationView(this.skin.WALK_E, this.SPRITE_SIZE, 0.4, REVERSE_AT_END);
  this.view.setOffset(new V2(0, -this.SPRITE_SIZE.y * 0.3));
}

//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- DRAW ROBOTS
//!-----------------------------------------------------------------------------

var bit_pos = new V2();

RobotCivillian.prototype.DRAW_PRIORITY = 0; // lowest
RobotCivillian.prototype.drawInteraction = function()
{
  //! TODO -- factorise
  bit_pos.setBetween(this.position, this.interactPeer.position, 
                                  0.2 + Math.random() * 0.6 );
  context.strokeStyle = 'rgb(82,176,36)';
  context.lineWidth = 1.0;
  context.strokeText(rand_bool() ? '0' : '1', bit_pos.x, bit_pos.y);
}

RobotImposter.prototype.DRAW_PRIORITY = 1; // middle
RobotImposter.prototype.drawInteraction = function()
{
  //! TODO -- factorise
  bit_pos.setBetween(this.position, this.interactPeer.position, 
                                  0.2 + Math.random() * 0.6 );
  context.strokeStyle = 'violet';
  context.lineWidth = 1.0;
  context.strokeText('2', bit_pos.x, bit_pos.y);
}

RobotPolice.prototype.DRAW_PRIORITY = 2; // highest
RobotPolice.prototype.drawInteraction = function()
{
  //! TODO -- factorise
  bit_pos.setBetween(this.position, this.interactPeer.position, 
                                  0.2 + Math.random() * 0.6 );
  context.strokeStyle = 'blue';
  context.lineWidth = 1.0;
  context.strokeText(rand_bool() ? '0' : '1', bit_pos.x, bit_pos.y);
}

Robot.prototype.draw = function() 
{
  // only one of the two need draw the connection
  if(this.interactPeer
    && (this.DRAW_PRIORITY > this.interactPeer.DRAW_PRIORITY 
        || (this.DRAW_PRIORITY == this.interactPeer.DRAW_PRIORITY 
            && this.id > this.interactPeer.id)))
              this.drawInteraction();
        
  // draw a shadow
  context.fillStyle = 'rgba(0, 0, 0, 128)';
  context.fillCircle(this.position.x, this.position.y, this.radius * 0.5);
          
  // draw a circle around the character's feet
  //! TODO -- factorise
  // -- self (green)
  if(this.id == local_id)
  {
    context.lineWidth = 3.0;
    context.strokeStyle = 'rgb(82,176,36)';
    context.strokeCircle(this.position.x, this.position.y, this.radius);
  }
  //! TODO -- factorise
  // -- friends (blue)
  else if(local_bot && this.TYPE == local_bot.TYPE)
  {
    context.lineWidth = 2.0;
    context.strokeStyle = 'blue';
    context.strokeCircle(this.position.x, this.position.y, this.radius);
  }
  //! TODO -- factorise
  // -- foes (red)
  else if(this.TYPE == this.TYPE_POLICE && local_bot.TYPE == this.TYPE_IMPOSTER)
  {
    context.lineWidth = 2.0;
    context.strokeStyle = 'red';
    context.strokeCircle(this.position.x, this.position.y, this.radius);
  }
  
  // draw the sprite
  this.view.draw(this.position);
  
  
  // draw infection (if present)
  if(this.infection)
  {
    context.strokeStyle = 'violet';
    context.lineWidth = 3.0;
    
    context.beginPath();
    context.arc(this.position.x,this.position.y, this.radius, 
                0, Math.PI * 2 * (this.infection / 10000), false);
    context.stroke();
  }
  
  
  //! FIXME -- DEBUG STUFF
  /*context.lineWidth = 1;
  context.strokeText(this.id+"->"
              +(this.interactPeer ? this.interactPeer.id : "null"), 
              this.position.x + 32, this.position.y);*/
};

//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- UPDATE ROBOTS' ANIMATIONS
//!-----------------------------------------------------------------------------

Robot.prototype.resetSprite = function()
{
  // set sprite to face in the robot's direction
  
  // horizontal
  if(Math.abs(this.facing.x) >= Math.abs(this.facing.y))
  {
    // west
    if(this.facing.x < 0)
      this.view.setAnimation(this.skin.WALK_W);
    // east
    else if(this.facing.x > 0)
      this.view.setAnimation(this.skin.WALK_E);
  }
  // vertical
  else
  {
    // north
    if (this.facing.y < 0)
      this.view.setAnimation(this.skin.WALK_N);
    // south
    else if (this.facing.y > 0)
      this.view.setAnimation(this.skin.WALK_S);
  }
}

Robot.prototype.updateSpecial = function(delta_t)
{
  // moving ?
  if (this.speed.x != 0 || this.speed.y != 0)
  {
    // update direction from movement
    this.facing.setV2(this.speed).mapToXY(Math.round);
    this.resetSprite();
  }
  
  // interacting ?
  if(this.interactPeer)
  {
    // update direction from interact
    this.facing.setFromTo(this.position, this.interactPeer.position);
    this.resetSprite();
    this.view.setSubimage(1);
  }
  
  // update animation where applicable
  else if(this.facing.isNull())
    this.view.setSubimage(1);
  else
    this.view.update(delta_t);
}


//! FIXME -- unused
/*animWifi = new Animation(imgWifi, new V2(32, 32), new V2(0, 0), 3);
animSmoke = new Animation(imgSmoke, new V2(32, 32), new V2(0, 0), 5);
animExplosion = new Animation(imgExplosion, new V2(32, 32), new V2(0, 0), 8);
imgElectrocution = new Animation(imgElectrocution, new V2(32, 32), new V2(0, 0), 8);*/
