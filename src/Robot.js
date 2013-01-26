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
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

Robot = function(position_)
{
  this.position = position_;
  
  return this;
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE
//! ----------------------------------------------------------------------------

Robot.prototype.toString = function() {
	return "dull-looking robot";
}

Robot.prototype.interface = function(otherRobot) {
	console.log('Ello, '+otherRobot);
};

Robot.prototype.update = function() {
	//console.log("I'm WORKING!");
};

Robot.prototype.draw = function() {
	context.fillStyle = 'white';
	context.fillCircle(this.position.x, this.position.y, 10);
};