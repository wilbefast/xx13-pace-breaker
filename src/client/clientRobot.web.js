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
//! CONSTANTS
//!-----------------------------------------------------------------------------
var ANIM_SPEED = 6 / 1000; // 6 images per second 


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
    new AnimationView(this.skin.WALK_E, this.SPRITE_SIZE, ANIM_SPEED, REVERSE_AT_END);
  this.view.setOffset(new V2(0, -this.SPRITE_SIZE.y * 0.3));
}

//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- DRAW ROBOTS
//!-----------------------------------------------------------------------------

var bit_pos = new V2(), lazor_start = new V2(), lazor_end = new V2();
var ANGLE_START = -Math.PI * 0.25;
var ANGLE_END = Math.PI * 1.5;

RobotCivillian.prototype.DRAW_PRIORITY = 0; // lowest
RobotImposter.prototype.DRAW_PRIORITY = 1; // middle
RobotPolice.prototype.DRAW_PRIORITY = 2; // highest
Robot.prototype.draw = function() 
{
  // DON'T DRAW EXPLODED ROBOTS
  if(this.health == this.EXPLODED)
    return;
    
  // 1. draw a circle around the character's feet (if alive)
  else if(this.isHealthy())
  {
    context.lineWidth = 2.0;
    context.strokeStyle = 
        (this.id == local_id)           
          ? 'lime' : 
        ((local_bot && this.TYPE == local_bot.TYPE)     
          ? 'yellow' : 
        ((this.isPolice && local_bot.isImposter)
          ? 'red' : 
          'violet'));
    // -- for Civillians : draw infection ...
    if(this.isCivillian)
    {
      // ... only if infection is present
      if(this.infection)
      {
        // if fully infected
        if(this.health == this.INFECTED)
        {
          // death timer
          context.lineWidth = 1; 
          context.textBaseline = 'middle';
          context.textAlign = 'center';
          context.strokeText(
            Math.round(this.infection_incubation.time.balance / 1000), 
                        this.position.x, this.position.y - 32);   
          // thicker arc 
          context.lineWidth = 3; 
        }
          
        // draw arc
        context.beginPath();
        context.arc(this.position.x,this.position.y, this.radius, 
          ANGLE_START, 
          ANGLE_START + ANGLE_END * (this.infection / this.MAX_INFECTION), false);
        context.stroke();
      }
    }
    // -- for other : draw team colour
    else
      context.strokeCircle(this.position.x, this.position.y, this.radius);
  }
  
  // 2. draw the sprite
  this.view.draw(this.position);
  
  // 3a. direction interaction (if applicable)
  if(this.interactPeer
    && (this.DRAW_PRIORITY > this.interactPeer.DRAW_PRIORITY 
        || (this.DRAW_PRIORITY == this.interactPeer.DRAW_PRIORITY 
            && this.id > this.interactPeer.id)))
  {
    context.lineWidth = 1.0;
    context.strokeStyle = this.isCivillian ? 'lime' : 'violet';
    bit_pos.setBetween(this.position, this.interactPeer.position, 
                        0.2 + 0.6*Math.random());
    
    context.strokeText(rand_bool() ? '0' : '1', bit_pos.x, bit_pos.y);
  } 
  
  // 3b. draw target lock-on (if applicable)
  else if (this.target)
  {
    // draw targeting reticule!
    var lock = this.lock_on.getFullness();
    context.lineWidth = 2*lock + 1;
    context.strokeStyle = 'red';
    context.strokeTriangle(this.target.position.x, 
                           this.target.position.y - this.target.SPRITE_SIZE.y/2, 
                           (1 - lock) * 48);
  }
  // 3c. draw "LAZOR!!!" (tm) (if applicable)
  else if (this.firing && this.firing.isSet())
  {
    lazor_start.setBetween(this.position, this.firing.position, 0.2);
    lazor_end.setBetween(this.position, this.firing.position, 0.9);
    context.lineWidth = 3;
    context.strokeStyle = 'red';
    context.strokeLine(lazor_start.x, lazor_start.y - 16, lazor_end.x, lazor_end.y)
  }
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
  //! DEAD ?
  if(this.health == this.DEAD)
  {
    if(this.view.setAnimation(this.skin.DIE))
    {
      this.view.speed = 0.003;
      this.view.stopNext(2);
    }
    this.view.update(delta_t);
    return;
  }
  
  //! EXPLODED
  else if(this.health == this.EXPLODED)
    return;
  
  // moving ?
  if (this.speed.x != 0 || this.speed.y != 0)
  {
    // update direction from movement
    this.facing.setV2(this.speed).scale(10).mapToXY(Math.round);
    this.resetSprite();
  }
  
  // interacting ?
  if(this.interactPeer || this.target)
  {
    // update direction from interact
    var who = (this.interactPeer || this.target);
    this.facing.setFromTo(this.position, who.position);
    this.resetSprite();
    this.view.setSubimage(1);
  }
  
  // update animation where applicable
  else if(this.facing.isNull())
    this.view.setSubimage(1);
  else
    this.view.update(delta_t);
}


//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- TREAT INPUT
//!-----------------------------------------------------------------------------

RobotPolice.prototype.update = function(delta_t) 
{
  // perform standard update
  Robot.prototype.update.call(this, delta_t);
  
  // finish firing
  this.firing.update(delta_t);
   
  // stop if dead
  if(!this.isHealthy())
    return;
  
  // lock on progressively if already locked on 
  if(this.target)
  {
    if(!this.target.isHealthy())
      this.setTarget(null);
    else
      this.lock_on.deposit(delta_t);
  }
  
  // only treat input for local bot
  if(this.id != local_id)
    return;
  if(keyboard.action && keyboard.direction.isNull())
  {
    // lock on to new target
    if(!this.target && !this.firing.isSet() && selected)
    {
      // play sound
      if(this.lock_on.isEmpty())
        play_police_interact();
      // lock on
      this.target = selected;
      selected = null;
      tellServerLockon(this.target);
    }
  }
  // lose target if key is released
  else
  {
    // lock off
    this.target = null;
    this.lock_on.setEmpty();
    tellServerLockon(null);
  }
}

//!-----------------------------------------------------------------------------
//! CLIENT-ONLY -- PLAY SOUND EFFECTS
//!-----------------------------------------------------------------------------

var civilian_chatter_sample = 0;
var civilian_death_sample = 0;
var cop_chatter_sample = 0;
var playing_a_sound = false;

function play_dead()
{
  if (!playing_a_sound) 
  {
    play_audio('Civilbot_death_'+(civilian_death_sample%3+1)+'.ogg')
    civilian_death_sample++;
    playing_a_sound = true;
    setTimeout(function() { playing_a_sound = false; }, 300); //! FIXME -- use callback
  }
}

RobotImposter.prototype.startInteract = function()
{
  if (!playing_a_sound) 
  {
    
    if (this.id == local_id) 
    {
      play_audio('Civilbot_chatter_'+(civilian_chatter_sample%6+1)+'.ogg')
      civilian_chatter_sample++;
      playing_a_sound = true;
      setTimeout(function() { playing_a_sound = false; }, 300); //! FIXME -- use callback
    }
  }
}

function play_police_interact()
{
  if (!playing_a_sound) 
  {
    play_audio('Copbot_chatter_'+(cop_chatter_sample%4+1)+'.ogg')
    cop_chatter_sample++;
    playing_a_sound = true;
    setTimeout(function() { playing_a_sound = false; }, 300); //! FIXME -- use callback
  }
}