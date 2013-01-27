
game = function(){
	this.robots = [];
  this.STARTING_CIVILLIANS = 2;
  
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
  for (var i=0; i < this.STARTING_CIVILLIANS; i++)
  {
    var spawn_pos = new V2();
    this.level.playable_area.randomWithin(spawn_pos);
    G.addRobot(nextid(),new CivillianRobot(spawn_pos));
  }
}

game.prototype.addRobot = function(id,robot) {
	this.robots[id]=robot;
  robot.id = id;
};

game.prototype.update = function(delta_t) {
  
	for (bid in this.robots)
  {
		var bot = this.robots[bid];
    
    // update the robots
		bot.update(delta_t);
    
    // reset nearest
    bot.nearest = null;
    bot.nearest_dist2 = Infinity;
    
    // pair functions
    for (other_bid in this.robots)
    {
      // don't check self
      var other_bot = this.robots[other_bid];
      if(other_bot == bot)
        continue;
      
      // get bot collisions
      generateCollision(bot, other_bot);
      
      // get bot nearest peers
      generateNearest(bot, other_bot);
    }
    
    // snap the robots inside the map
    var borderCollision = boundObject(bot, this.level.playable_area);
    if(!borderCollision.isNull())
      bot.perceiveObstacle(borderCollision);
	}
};

game.prototype.draw = function() {

	context.drawImage(this.map,0,0);
  if (G.robots[id]) {
    context.drawImage(meSelector,G.robots[id].position.x-16,G.robots[id].position.y+4);
  } else {
  }
	this.robots.forEach(function(bot){
		bot.draw();
	});
};
