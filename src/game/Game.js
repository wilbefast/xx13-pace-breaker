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
  return(!a.isCivillian && !b.isCivillian && a.TYPE != b.TYPE);
}

canInteractWith = function(subject, object)
{
  // NOBODY can interact with the dying or dead
  if(subject.health == subject.DEAD || object.health == object.DEAD
  || subject.health == subject.DYING || object.health == object.DYING)
    return false;
  
  // NOBODY can interact with people already interacting
  if(object.interactPeer)
    return false;
 
  // NOBODY can interact with cops
  if(object.isPolice)
    return false;

  // POLICE can't interact with eachother
  if(subject.isPolice)
    return (!object.isPolice);

  // EVERYONE can interact with CIVILLIANS
  if(object.isCivillian)
    return true;
  
  // all other situations -- impossible
  return false;
}

//! ----------------------------------------------------------------------------
//! GAME CLASS
//! ----------------------------------------------------------------------------

Game = function()
{
	this.robots = [];
  this.STARTING_CIVILLIANS = 1;
  
  // Replace with "new level()" when THAT's done
	this.level = 
	{
    playable_area : new Rect(36, 68, 724, 364)
  }; 
}

Game.prototype.toString = function()
{
  return "Game(" + this.robots.length + " Robots)";
}

Game.prototype.reset = function()
{
  this.robots = [];
  connected = [];
  
  // create Civillians
  var spawn_pos = new V2();
  for (var i=0; i < this.STARTING_CIVILLIANS; i++)
  {
    this.level.playable_area.randomWithin(spawn_pos);
    this.addRobot(new RobotCivillian(nextid(), spawn_pos));
  }
}
  
Game.prototype.addRobot = function(newBot)
{
  this.robots[newBot.id] = newBot;
  if(this.view)
    this.view.addRobot(newBot);
  return newBot;
}

Game.prototype.unpackRobot = function(packet)
{
  var newBot;
  switch(packet.typ)
  {
    case RobotCivillian.prototype.TYPE:
      newBot = new RobotCivillian(packet.id, packet.pos, packet.skn);
      break;
      
    case RobotPolice.prototype.TYPE:
      newBot = new RobotPolice(packet.id, packet.pos, packet.skn);
      break;
      
    case RobotImposter.prototype.TYPE:
      newBot = new RobotImposter(packet.id, packet.pos, packet.skn);
      break;
      
    default:
      console.log("invalid Robot type " + packet.typ);
      return null;
  }
  
  // packet may contain infection value (if local_bot is an Imposter)
  if(packet.sick)
    newBot.infection = packet.sick;
  
  return this.addRobot(newBot);
};

Game.prototype.update = function(delta_t) 
{
	for (bid in this.robots)
  {
		var bot = this.robots[bid];
    
   
    // reset nearest -- ONLY ON CLIENT OR FOR NON-PLAYER CHARACTERS
    if(!is_server || !bot.isHumanControlled)
    {
      bot.nearest.bot = null;
      bot.nearest.dist2 = Infinity;
    }
    
    // reset nearestHuman -- ONLY ON SERVER AND FOR PLAYER CHARACTERS 
    else if(is_server && bot.isHumanControlled)
    {
      bot.nearestFoe.bot = null;
      bot.nearestFoe.dist2 = Infinity;
    }

    // pair functions
    for (other_bid in this.robots)
    {
      if(other_bid == bid)
        continue;
      
      // don't check self
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
    if(!borderCollision.isNull())
    {
      bot.perceiveObstacle(borderCollision);
    }
	}
}