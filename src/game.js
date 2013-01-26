game = function(){
	this.robots = [];
  
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
  for (var i=0; i<20; i++)
  {
    var spawn_pos = new V2();
    this.level.playable_area.randomWithin(spawn_pos);
    G.addRobot(botid(),new CivillianRobot(spawn_pos));
  }
}

game.prototype.addRobot = function(id,robot) {
	this.robots[id]=robot;
};

game.prototype.update = function(delta_t) {
  
	for (bid in this.robots)
  {
		var bot = this.robots[bid];
    
    // update the robots
		bot.update(delta_t);
    
    // collide the robots
    for (other_bid in this.robots)
    {
      var other_bot = this.robots[other_bid];
      generateCollision(bot, other_bot);
    }
    
    // snap the robots inside the map
    if(boundObject(bot, this.level.playable_area))
      bot.stop();
	}
};

game.prototype.draw = function() {
	context.drawImage(this.map,0,0);
  if (id && G.robots[id]) {
    context.drawImage(meSelector,G.robots[id].position.x,G.robots[id].position.y);
  } else {
    console.log('Trippin, yo')
  }
	this.robots.forEach(function(bot){
		bot.draw();
	});
};
