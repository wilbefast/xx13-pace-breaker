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

/*** BANK CLASS a numeric value with a maximum capacity to deposit/withdraw ***/

bound = function(v, min, max)
{
  return ((v > max) ? max : ((v < min) ? min : v));
}

/// INSTANCE ATTRIBUTES/METHODS
Bank = function(starting_balance, max_balance, min_balance)
{
  var starting_balance = (starting_balance == undefined ? 0.0 : starting_balance),
      max_balance = (max_balance == undefined ? 1.0 : max_balance),
      min_balance = (min_balance == undefined ? 0.0 : min_balance);
  
  if(min_balance > max_balance)
  {
    this.min = max_balance;
    this.max = min_balance;
  }
  else
  {
    this.min = min_balance;
    this.max = max_balance;
  }
  this.balance = bound(starting_balance, this.min, this.max);
  
  return this;
}
  
// query
Bank.prototype.getBalance = function() 
{ 
  return this.balance; 
}

Bank.prototype.getFullness = function()
{ 
  return (this.balance - this.min) / (this.max - this.min);
}

Bank.prototype.isEmpty = function() 
{ 
  return (this.balance == this.min); 
}
Bank.prototype.isFull = function() 
{ 
  return (this.balance == this.max); 
}

Bank.prototype.getMin = function() 
{
  return this.min;
}

Bank.prototype.getMax = function()
{ 
  return this.max;
}

// modification
Bank.prototype.withdraw = function(amount)
{
  if(this.balance - amount >= this.min)
    this.balance -= amount;
  else
  {
    amount = this.balance;
    this.balance = this.min;
  }
  // return the amount that was withdrawn
  return amount;
}

Bank.prototype.deposit = function(amount)
{
  if(this.balance + amount <= this.max)
    this.balance += amount;
  else
  {
    amount = this.max - this.balance;
    this.balance = this.max;
  }
  // return the amount that was deposited
  return amount;
}

Bank.prototype.setRandomBalance = function()
{
  this.balance = this.min + Math.random()*(this.max - this.min);
}

Bank.prototype.setBalance = function(amount)
{
  this.balance = this.amount;
}

Bank.prototype.setFull = function()
{
  return this.deposit(this.max);
}

Bank.prototype.setEmpty = function()
{
  return this.withdraw(this.max);
}