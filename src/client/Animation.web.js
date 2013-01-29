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
//! CONSTANTS
//! ----------------------------------------------------------------------------

var NO_FLAGS = 0;         // 0b00000000
var REVERSE_AT_END = 1;   // 0b00000001
var FLIP_X = 2;           // 0b00000010
var FLIP_Y = 4;           // 0b00000100


//! ----------------------------------------------------------------------------
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

function Animation(_img, _size, _offset, _n_frames, _flags)
{
  this.img = _img;
  this.size = _size;
  this.offset = (_offset || new V2(0, 0));
  this.n_frames = (_n_frames || 1);
  this.flags = (_flags || NO_FLAGS);
  
  this.flipx = (this.flags & FLIP_X) ? -1 : 1;
  this.flipy = (this.flags & FLIP_Y) ? -1 : 1;
  
  return this;
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE
//! ----------------------------------------------------------------------------
 
Animation.prototype.setMirrorLoop = function(_boolean)
{
  this.mirror_loop = _boolean;
}

Animation.prototype.doesMirrorLoop = function()
{
  return this.mirror_loop;
}

Animation.prototype.getNFrames = function()
{
  return this.n_frames;
}

Animation.prototype.draw = function(subimage, dest)
{ 
  // flip
  if(this.flags & FLIP_X)
    context.scale(-1, 1);
  if(this.flags & FLIP_Y)
    context.scale(1, -1);
  
  // draw
  context.drawImage(this.img, 
    // source
    (~~subimage) * this.size.x + this.offset.x, this.offset.y,  
    this.size.x, this.size.y,
    // destination
    this.flipx*dest.x, this.flipy*dest.y, this.flipx*dest.w, this.flipy*dest.h);
  
  // unflip
  if(this.flags & FLIP_X)
    context.scale(-1, 1);
  if(this.flags & FLIP_Y)
    context.scale(1, -1);
}