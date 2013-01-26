/*
Copyright (C) 2013 William James Dyce, Kevin Bradshaw Jean-Bapiste Subils

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
//! CLASS -- ATTRIBUTES 
//! ----------------------------------------------------------------------------
var CivillianRobot_img 
  = load_image('images/robot.png');
var CivillianRobot_dance 
  = new Animation(CivillianRobot_img, new V2(32, 32), new V2(0, 0), 4);


//! ----------------------------------------------------------------------------
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

CivillianRobot = function(position_)
{
  var o = new Robot(position_);
  
  o.animview = new AnimationView(CivillianRobot_dance, new V2(64, 64), 0.1);
  
  
  //! FIXME
  o.draw = function()
  {
    o.animview.draw(this.position);
  }
  
  //! FIXME
  o.update = function(delta_t)
  {
    this.animview.update(delta_t);
  }
  
  return o;
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE -- FUNCTIONS 
//! ----------------------------------------------------------------------------

// inherits from Robot
CivillianRobot.prototype = new Robot();

CivillianRobot.prototype.draw = function()
{
  this.animview.draw(this.position);
}

CivillianRobot.prototype.update = function(delta_t)
{
  this.animview.update(delta_t);
}
