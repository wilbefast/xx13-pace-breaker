/** @author William J.D. **/

/*
HTML5 base code
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

// context

var context = canvas.getContext('2d');

//! ----------------------------------------------------------------------------
//! CIRCLE
//! ----------------------------------------------------------------------------

function drawCircle(x, y, radius, fill)
{
  context.beginPath();
  context.arc(x, y, radius, 0 , 2 * Math.PI, false);
  if(fill) 
    context.fill();
  else
    context.stroke();
  context.closePath(); 
}
context.strokeCircle = function(x, y, radius) { drawCircle(x, y, radius, false); }
context.fillCircle = function(x, y, radius) { drawCircle(x, y, radius, true); }

//! ----------------------------------------------------------------------------
//! TRIANGLE
//! ----------------------------------------------------------------------------

function drawTriangle(x, y, size, fill)
{
  context.beginPath();
  context.moveTo(x - size, y + size);
  context.lineTo(x, y - size);
  context.lineTo(x + size, y + size);
  context.closePath();
  if(fill)
    context.fill(); 
  else
    context.stroke();
}
context.strokeTriangle = function(x, y, size) { drawTriangle(x, y, size, false); }
context.fillTriangle = function(x, y, size) { drawTriangle(x, y, size, true); }


//! ----------------------------------------------------------------------------
//! LINE
//! ----------------------------------------------------------------------------
    
context.strokeLine = function(x1, y1, x2, y2)
{
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}
