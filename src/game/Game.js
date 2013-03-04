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
//! UTILITY FUNCTIONS
//! ----------------------------------------------------------------------------
areFoes = function(a, b)
{
  return(a.isHealthy() && b.isHealthy() && !a.isCivillian 
          && !b.isCivillian && a.TYPE != b.TYPE);
}

canInteractWith = function(subject, object)
{
  // NOBODY can interact with the dying or dead
  if(!subject.isHealthy() || !object.isHealthy())
    return false;
 
  // NOBODY can interact with cops
  else if(object.isPolice)
    return false;
    
  // POLICE can interact with anyone who isn't Police
  else if(subject.isPolice)
    return true;
    
  // NOBODY but police can interact with people already interacting
  else if(object.interactPeer)
    return false;
  
  // EVERYONE can interact with CIVILLIANS
  else if(object.isCivillian)
    return true;
  
  // in all other situations interaction is impossible
  else
    return false;
}

//! ----------------------------------------------------------------------------
//! GAME CLASS
//! ----------------------------------------------------------------------------

Game = function()
{
  this.STARTING_CIVILLIANS = 20;
  
  // Replace with "new Level()" when THAT's done
	this.level = 
	{
    playable_area : new Rect(36, 68, 724, 364)
  }; 
  
  this.reset();
}

Game.prototype.toString = function()
{
  return "Game(" + this.robots.length + " Robots)";
}

Game.prototype.addRobot = function(newBot)
{
  // full house?
  if(newBot.isImposter)
    this.contains_imposter = true;
  else if(newBot.isPolice)
    this.contains_police = true;
  
  
  this.robots[newBot.id] = newBot;
  if(this.view)
    this.view.addRobot(newBot);
  return newBot;
}

Game.prototype.update = function(delta_t) 
{ 
  // special update for client/server
  if(this.view)
    this.view.update(delta_t);
  
  // for each Robot id
	for (bid in this.robots)
  {
		var bot = this.robots[bid];
    
    // reset nearest -- ONLY ON CLIENT OR FOR NON-PLAYER CHARACTERS
    if(!is_server || !bot.isHumanControlled)
    {
      bot.nearest.bot = null;
      bot.nearest.dist2 = Infinity;
    }
    
    // reset nearestFoe -- ONLY ON SERVER AND FOR PLAYER CHARACTERS 
    else if(is_server && bot.isHumanControlled)
    {
      bot.nearestFoe.bot = null;
      bot.nearestFoe.dist2 = Infinity;
    }

    // pair functions
    for (other_bid in this.robots)
    {
      // don't check self
      if(other_bid == bid)
        continue;
      var other_bot = this.robots[other_bid];
      
      // get bot collisions
      generateCollision(bot, other_bot);
      
      // get bot nearest peers -- FOR INTERACTIONS
      generateNearest(bot, other_bot, bot.nearest, canInteractWith);
      
      // get nearest human -- FOR HEARBEATS
      if(is_server)
        generateNearest(bot, other_bot, bot.nearestFoe, areFoes);
    }
    
    // update the robots
    bot.update(delta_t);
   
    // snap the robots inside the map
    var borderCollision = boundObject(bot, this.level.playable_area);
    if(!borderCollision.isNull() 
    && bot.health != bot.DYING && bot.health != bot.DEAD)
      // also inform the AI that it has been snapped (if it has been snapped)
      bot.perceiveObstacle(borderCollision);
	}
}