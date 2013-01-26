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

function Animation(_img, _size, _offset, _n_frames)
{
  this.img = _img;
  this.size = _size;
  this.offset = (_offset || new V2(0, 0));
  this.n_frames = (_n_frames || 1);
  
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
  //context.drawImage(this.img, 0,0,100,100);

  context.drawImage(this.img, 
          // source
          (~~subimage) * this.size.x + this.offset.x, this.offset.y,  
          this.size.x, this.size.y,
          // destination
          dest.x, dest.y, dest.w, dest.h);
}