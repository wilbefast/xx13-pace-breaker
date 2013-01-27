//! ----------------------------------------------------------------------------
//! UTILITY FUNCTION 
//! ----------------------------------------------------------------------------
canHearHeartbeat = function(subject, object)
{
  return (subject.humanControlled 
          && !object.robotTeam);
}

canHearMusic = function(subject, object)
{
  return (subject.humanControlled 
          && object.robotTeam && object.humanControlled);
}

canInteractWith = function(subject, object)
{
  // CIVILLIANS can interact with CIVILLIANS
  // HUMANS can interact with CIVILLIANS
  // POLICE can interact with CIVILLIANS and HUMANS
  
  return (!object.humanControlled 
    || (subject.humanControlled && subject.robotTeam));
}

//! ----------------------------------------------------------------------------
//! GAME CLASS
//! ----------------------------------------------------------------------------

game = function(){
	this.robots = [];
  this.STARTING_CIVILLIANS = 5;
  
  // Replace with "new level()" when THAT's done
	this.level = 
	{
    playable_area : new Rect(36, 68, 724, 364)
  }; 
  
  
	if (!is_server)
		this.map = load_image("images/map.png");
}

game.prototype.reset = function()
{
  console.log("-----GAME HAS BEEN RESET-----");
  for (var i=0; i < this.STARTING_CIVILLIANS; i++)
  {
    var spawn_pos = new V2();
    this.level.playable_area.randomWithin(spawn_pos);
    var r = G.addRobot(nextid(), new CivillianRobot(spawn_pos));

  }
}

game.prototype.addRobot = function(id, robot) {
	this.robots[id]=robot;
  robot.id = id;
  console.log(robot.id + " robotTeam? " + robot.robotTeam + 
                " humanControlled? " + robot.humanControlled);
  return robot;
};

game.prototype.update = function(delta_t) {
  
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
      //! FIXME if(!is_server)
        generateNearest(bot, other_bot, bot.nearest, canInteractWith);
      
      // get nearest human -- FOR HEARBEATS
      //! FIXME else
      if(is_server) {
        generateNearest(bot, other_bot, bot.nearestHuman, canHearHeartbeat);
        generateNearest(bot, other_bot, bot.nearestCop, canHearMusic);
      }
    }
    
    // update the robots
    bot.update(delta_t);
    
    // snap the robots inside the map
    var borderCollision = boundObject(bot, this.level.playable_area);
    if(!borderCollision.isNull())
      bot.perceiveObstacle(borderCollision);
	}
}

game.prototype.draw = function() {

	context.drawImage(this.map,0,0);
  if (G.robots[id]) {
    context.drawImage(meSelector,G.robots[id].position.x-16,G.robots[id].position.y+4);
  } else {
  }
	this.robots.forEach(function(bot){
		bot.draw();
	});
  if (selected) {
    context.drawImage(arrowSelector,selected.position.x-6,selected.position.y-24);
  } else {
    console.log('Trippin, yo')
  }
};
