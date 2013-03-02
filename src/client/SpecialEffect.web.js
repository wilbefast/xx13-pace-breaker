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
var imgExplosion = load_image("explosion.png");
var imgWifi = load_image("wifi.png");
//var imgElectrocution = load_image("electrocution.png");

var animSmoke = new Animation(imgSmoke, new V2(32, 32), new V2(0, 0), 5);
var animExplosion = new Animation(imgExplosion, new V2(128, 128), new V2(0, 0), 8);
var animElectrocution = new Animation(imgExplosion, new V2(128, 128), new V2(0, 0), 8); //! FIXME
var animWifi = new Animation(imgWifi, new V2(16, 15), new V2(0, 0), 3);


//! ----------------------------------------------------------------------------
//! CLASS
//! ----------------------------------------------------------------------------

SpecialEffect = function(position_, anim_, vsize_, anim_speed_, offset_)
{
  this.position = position_;
  this.view = new AnimationView(anim_, vsize_, anim_speed_, NO_FLAGS, offset_);
  
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
  var sfx = new SpecialEffect(position_, animSmoke, new V2(32, 32), 0.007);
  sfx.destroy_at_end_of_animation = true;
  return sfx;
}

SpecialEffect.explosion = function(position_)
{
  var sfx = new SpecialEffect(position_, animExplosion, new V2(134, 128), 0.007, new V2(0, -48));
  sfx.destroy_at_end_of_animation = true;
  return sfx;
}

SpecialEffect.wifi = function(position_)
{
  var sfx = new SpecialEffect(position_, animWifi, new V2(16, 16), 0.006, new V2(0, -32));
  sfx.destroy_at_end_of_animation = true;
  return sfx;
}