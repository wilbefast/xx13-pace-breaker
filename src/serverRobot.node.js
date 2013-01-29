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

Robot.prototype.specialInit = function()
{
  // only human-controlled Robots need care about displaying a proximity 'hint'
  if(this.TYPE == this.TYPE_POLICE || this.TYPE == this.TYPE_IMPOSTER)
  {
    this.nearestHuman =
    {
      bot : null,
      dist2 : Infinity,
    };
    this.nearestCop =
    {
      bot : null,
      dist2 : Infinity,
    };
  }  
}