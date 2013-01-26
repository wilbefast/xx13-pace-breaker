/** @author William J.D. **/

/*
HTML5 base code
Copyright (C) 2012 William James Dyce

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

boundObject = function(object, rect)
{
  var was_snapped = false;
  
  // -- horizontal
  if(object.position.x - object.radius < rect.x)
  {
    was_snapped = true;
    object.position.x = rect.x;
  }
  else if(object.position.x + object.radius > rect.endx())
  {
    was_snapped = true;
    object.position.x = rect.endx();
  }
  
  // -- vertical
  if(object.position.y - object.radius < rect.y)
  {
    was_snapped = true;
    object.position.y = rect.y;
  }
  else if(object.position.y + object.radius > rect.endy())
  {
    was_snapped = true;
    object.position.y = rect.endy();
  }
  
  return was_snapped;
}

// check for a collision
areColliding = function(a, b)
{
  return (a.position.dist2(b.position) < a.radius2 + b.radius2);
}

// generate a collision between two objects if applicable
generateCollision = function(a, b)
{
  if(a != null && b != null && a != b && areColliding(a, b))
  {
    // generate collision
    a.collision(b);
    b.collision(a);
  }
}