//! ----------------------------------------------------------------------------
//! UTILITY FUNCTIONS
//! ----------------------------------------------------------------------------
canHearHeartbeat = function(subject, object)
{
  return (subject.humanControlled && !object.killed
          && !object.robotTeam);
}

canHearMusic = function(subject, object)
{
  return (subject.humanControlled 
          && object.robotTeam && object.humanControlled);
}

canInteractWith = function(subject, object)
{
  // NOBODY can interact with the dead
  if(subject.dead || object.dead)
    return false;
  
  // NOBODY can interact with people already interacting
  if(object.interactPeer)
    return false;
  
  // NOBODY can interact with cops
  if(object.humanControlled && object.robotTeam)
    return false;
  
  // EVERYONE can interact with CIVILLIANS
  if(!object.humanControlled)
    return true;
  
  // PLAYERS can interact ...
  if(subject.humanControlled)
  {
    // ... COPS can interact with HUMANS
    if(subject.robotTeam && !object.robotTeam)
      return true;
    
    // ... HUMANS can interact with CIVILLIANS
      // (already covered)
  }
  
  // all other situations -- impossible
  return false;
}

//! ----------------------------------------------------------------------------
//! GAME CLASS
//! ----------------------------------------------------------------------------

game = function()
{
	this.robots = [];
  this.STARTING_CIVILLIANS = 20;
  
  // Replace with "new level()" when THAT's done
	this.level = 
	{
    playable_area : new Rect(36, 68, 724, 364)
  }; 
  
  
	if (!is_server)
		this.map = load_image("map.png");
}

game.prototype.toString = function()
{
  return "game(" + this.robots.length + " Robots)";
}

game.prototype.reset = function()
{
  G.robots = [];
  connected = [];
  
  // create Civillians
  var spawn_pos = new V2();
  for (var i=0; i < this.STARTING_CIVILLIANS; i++)
  {
    this.level.playable_area.randomWithin(spawn_pos);
    G.addRobot(new RobotCivillian(nextid(), spawn_pos));
  }
}
  
game.prototype.addRobot = function(newBot)
{
  this.robots[newBot.id] = newBot;
}

game.prototype.unpackRobot = function(packet)
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
	this.robots[packet.id] = newBot;
  return newBot;
};

game.prototype.update = function(delta_t) 
{
	for (bid in this.robots)
  {
		var bot = this.robots[bid];
    
   
    // reset nearest -- ONLY ON CLIENT OR FOR NON-PLAYER CHARACTERS
    if(!is_server || !bot.humanControlled)
    {
      bot.nearest.bot = null;
      bot.nearest.dist2 = Infinity;
    }
    
    // reset nearestHuman -- ONLY ON SERVER AND FOR PLAYER CHARACTERS 
    else if(is_server && bot.humanControlled)
    {
      bot.nearestHuman.bot = null;
      bot.nearestHuman.dist2 = Infinity;
      bot.nearestCop.bot = null;
      bot.nearestCop.dist2 = Infinity;
    }

    // pair functions
    for (other_bid in this.robots)
    {
      // don't check self
      var other_bot = this.robots[other_bid];
      if(other_bot == bot)
        continue;
      
      // get bot collisions
      generateCollision(bot, other_bot);
      
      // get bot nearest peers -- FOR INTERACTIONS
      generateNearest(bot, other_bot, bot.nearest, canInteractWith);
      
      // get nearest human -- FOR HEARBEATS
      if(is_server)
      {
        generateNearest(bot, other_bot, bot.nearestHuman, canHearHeartbeat);
        generateNearest(bot, other_bot, bot.nearestCop, canHearMusic);
      }
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

game.prototype.draw = function()
{
  // draw the background
	context.drawImage(this.map, 0, 0);
  
  // draw a circle around the controlled robot
  if (G.robots[local_id]) 
  {
    context.drawImage(meSelector, G.robots[local_id].position.x - 16,
                                  G.robots[local_id].position.y + 4);
  }
  
  // draw each robot
	this.robots.forEach(function(bot) { bot.draw(); });
  
  // draw the targeter
  if (selected) 
  {
    context.drawImage(arrowSelector,
                      selected.position.x - 6,
                      selected.position.y - 24);
  } 
};
