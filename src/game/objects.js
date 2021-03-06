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
  var manifold = new V2();
  
  // -- horizontal
  if(object.position.x - object.radius < rect.x)
  {
    manifold.x = -1;
    object.position.x = rect.x + object.radius;
  }
  else if(object.position.x + object.radius > rect.endx())
  {
    manifold.x = 1;
    object.position.x = rect.endx() - object.radius;
  }
  
  // -- vertical
  if(object.position.y - object.radius < rect.y)
  {
    manifold.x = -1;
    object.position.y = rect.y + object.radius;
  }
  else if(object.position.y + object.radius > rect.endy())
  {
    manifold.x = 1;
    object.position.y = rect.endy() - object.radius;
  }
  
  return manifold;
}

function insideBox(unit, box)
{
  return box.collides(new Rect(unit.pos.x - unit.hradius, unit.pos.y - unit.hradius, unit.radius, unit.radius));
}

collidesPoint = function(object, point)
{
  return (object.position.dist2(point) < object.radius2);
}

// check for a collision
areColliding = function(a, b)
{
  return (a.position.dist2(b.position) < a.radius2 + b.radius2);
}

// generate a collision between two objects if applicable
generateCollision = function(a, b)
{
  if(areColliding(a, b))
  {
    // generate collision
    a.collision(b);
    b.collision(a);
  }
}

// get nearest object
generateNearest = function(a, b, nearest, condition)
{
  // check condition
  if(condition && !condition(a, b))
    return;
  
  // check distance
  var dist2 = a.position.dist2(b.position);
  if(dist2 < nearest.dist2)
  {
    nearest.bot = b;
    nearest.dist2 = dist2;
  }
}

// get an object at a position
getObjectAt = function(pos, objects, condition) //! 'condition' is optional
{
  for(i in objects)
  {
    var object = objects[i];
    if(object && collidesPoint(object, pos) && (!condition || condition(object)))
      return object;   
  }
  return null;
}

// update objects, resorting by y as we go
mapThenSort = function(objects, map_function)
{
  // draw object
  for(var i = 0; i < objects.length; i++)
  {
    // skip null objects
    var current = objects[i];
    if(!current) 
      continue;
    
    // apply map function (if applicable)
    if(map_function)
      map_function(current, i);
    
    // re-sort the list based on y value
    if(i)
    {
      var previous = objects[i-1];
      if(!previous)
        continue;
      if(current.position.y < previous.position.y)
      {
        // perform on step of bubble sort
        objects[i-1] = current;
        objects[i] = previous;
      }
    }
  }
}