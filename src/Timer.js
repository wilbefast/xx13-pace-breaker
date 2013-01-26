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

/*** TIMER CLASS, for things which count down to zero ***/

/// INSTANCE ATTRIBUTES/METHODS
Timer = function(max_time, auto_reset_)
{
  this.time = new Bank(Math.random()*max_time, max_time, -1.0),
  this.auto_reset = auto_reset_ ? auto_reset_ : false;
  
  return this;
}

// query
Timer.prototype.getTime = function() 
{ 
  return this.time.getBalance();
} 

Timer.prototype.isSet = function() 
{ 
  return (this.time.getBalance() >= 0.0); 
}

// modification
Timer.prototype.reset = function(amount) 
{ 
  this.time.setFull(); 
}

Timer.prototype.unset = function() 
{ 
  this.time.setEmpty(); 
}
  
// update
Timer.prototype.update = function(delta_t)
{ 
  // unset timers don't tend to ring
  if(!this.isSet())
    return false;
  
  // count down the timer
  this.time.withdraw(delta_t);
  
  // otherwise, if time has run out
  if(!this.isSet())
  {
    if(this.auto_reset)
      this.reset();
    else
      this.unset();
    
    // sound the alarm!
    return true;
  }
  else
    // timer continues to count down
    return false;
}