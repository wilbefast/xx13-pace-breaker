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

sign = function(x)
{
  return (x > 0) ? 1 : ((x < 0) ? -1 : 0);
}

rand_call = function(choices, context)
{
  return choices[Math.round((choices.length - 1) * Math.random())].call(context);
}

rand_in = function(choices)
{
  return choices[Math.round((choices.length - 1) * Math.random())]; 
}

rand_bool = function()
{
  return (Math.random() < 0.5);
}

rand_between = function(x, y)
{
  return Math.random() * (Math.abs(x-y)) + Math.min(x,y);
}

rand_sign = function()
{
  return (Math.random() < 0.5) ? -1 : 1;
}

format_time = function(t)
{
  var minutes = Math.floor(t/60);
    if(minutes < 10) minutes = '0' + minutes;
  var seconds = Math.floor(t)%60;
    if(seconds < 10) seconds = '0' + seconds;
  return "" + minutes + ':' +  seconds;
}

if (!Array.prototype.forEach) 
{
  Array.prototype.forEach = function(f, scope) 
  {
    for(var i = 0, len = this.length; i < len; ++i) 
      f.call(scope, this[i], i, this);
  }
}