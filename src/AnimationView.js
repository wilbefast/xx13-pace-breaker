/*
Copyright (C) 2013 William James Dyce

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

var NO_FLAGS = 0;         // 0b00000000
var REVERSE_AT_END = 1;   // 0b00000001
var FLIP_HORIZONTAL = 2;  // 0b00000010
var FLIP_HORIZONTAL = 4;  // 0b00000100

function AnimationView(_anim, _size, _speed, _flags)
{
  this.anim = _anim;
  this.size = _size;
  this.speed = (_speed || 0.0);
  this.flags = (_flags || NO_FLAGS);
  
  this.subimage = 0.0;
  this.stop_next = -1;
  this.offset = new V2(0, 0);
  this.dest = new Rect();
  
  return this;
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE
//! ----------------------------------------------------------------------------


AnimationView.prototype.setOffset = function(_offset) 
{ 
  this.offset.setV2(_offset); 
}

AnimationView.prototype.setSubimage = function(_subimage) 
{  
  this.subimage = _subimage; 
}

AnimationView.prototype.getSubimage = function() 
{ 
  return this.subimage; 
}

AnimationView.prototype.setAnimation = function(_anim)
{
  this.anim = _anim;
  this.subimage = 0.0;
  this.stop_next = -1;
}

AnimationView.prototype.stopNext = function(frame_to_stop_at)
{
  if(this.speed != 0)
    this.stop_next = frame_to_stop_at;
  else
    this.subimage = frame_to_stop_at;
}

AnimationView.prototype.setSpeed = function(_speed) 
{
  this.speed = _speed; 
}


AnimationView.prototype.getSpeed = function() 
{ 
  return this.speed; 
}

AnimationView.prototype.update = function(delta_t)
{
  var next = this.subimage + this.speed*delta_t;
  
  // check for frame to stop at
  if((this.stop_next != -1) && (~~next == this.stop_next))
  {
    this.subimage = this.stop_next;
    this.stop_next = -1;           
    this.speed = 0.0;
  }
  
  // otherwise loop
  if(next < this.anim.getNFrames() && next >= 0)
    // increment animation
    this.subimage = next;
  else
  {
    if(this.flags & REVERSE_AT_END)
    {
      // reverse animation direction
      this.subimage = (this.speed > 0) ? this.anim.getNFrames()-1 : 0.0;
      this.speed *= -1;
    }
    else
    {
      // loop animation from beginning or end
      this.subimage = (this.speed > 0) ? 0.0 : this.anim.getNFrames()-1;
    }
  }
    
}

AnimationView.prototype.draw = function(pos)
{ 
  this.dest.setXYWH(pos.x + this.offset.x - this.size.x/2, 
                    pos.y + this.offset.y - this.size.y/2, 
                    this.size.x, 
                    this.size.y);
  
  // center destination box on position given in parameter
  this.anim.draw(~~this.subimage, this.dest);
}

AnimationView.prototype.draw_notcentered = function(pos)
{
  this.dest.setXYWH(pos.x + this.offset.x, pos.y + this.offset.y, 
                    this.size.x, this.size.y);
  
  // don't center destination box
  anim.draw(~~this.subimage, this.dest);
}

AnimationView.prototype.randomSubimage = function()
{
  this.subimage = Math.random() * this.size;
}

