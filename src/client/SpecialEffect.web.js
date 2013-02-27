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
//! RESOURCES
//! ----------------------------------------------------------------------------

var imgSmoke = load_image("smoke.png");
var animSmoke = new Animation(imgSmoke, new V2(32, 32), new V2(0, 0), 5);

/*animWifi = new Animation(imgWifi, new V2(32, 32), new V2(0, 0), 3);
animSmoke = new Animation(imgSmoke, new V2(32, 32), new V2(0, 0), 5);
animExplosion = new Animation(imgExplosion, new V2(32, 32), new V2(0, 0), 8);
imgElectrocution = new Animation(imgElectrocution, new V2(32, 32), new V2(0, 0), 8);*/

//! ----------------------------------------------------------------------------
//! CLASS
//! ----------------------------------------------------------------------------

SpecialEffect = function(position_, anim_, vsize_, anim_speed_, loop_reverse_)
{
  this.position = new V2(position_);
  this.destroy_at_end_of_animation = true;
  
  this.view = new AnimationView(anim_, vsize_, anim_speed_, loop_reverse_);
  
  return this;
}

SpecialEffect.prototype.update = function(delta_t)
{
  // animation end
  if(this.view.update(delta_t) && this.destroy_at_end_of_animation)
    return true;
  else
    return false;
}

SpecialEffect.prototype.draw = function()
{
  this.view.draw(this.position);
}

//! ----------------------------------------------------------------------------
//! SHORTCUT CONSTRUCTORS
//! ----------------------------------------------------------------------------

SpecialEffect.smoke = function(position_)
{
  return new SpecialEffect(position_, animSmoke, new V2(32, 32), 0.007, false);
}