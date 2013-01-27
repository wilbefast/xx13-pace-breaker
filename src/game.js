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
  for (var i=0; i<2; i++)
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
		bot = this.robots[bid];
    
    // update the robots
		bot.update(delta_t);
    
    // snap the robots inside the map
    
    // -- horizontal
    if(bot.position.x < this.level.playable_area.x)
      bot.position.x = this.level.playable_area.x;
    else if(bot.position.x > this.level.playable_area.endx())
      bot.position.x = this.level.playable_area.endx();
    
    // -- vertical
    if(bot.position.y < this.level.playable_area.y)
      bot.position.y = this.level.playable_area.y;
    else if(bot.position.y > this.level.playable_area.endy())
      bot.position.y = this.level.playable_area.endy();
	}
};

game.prototype.draw = function() {

	context.drawImage(this.map,0,0);
	this.robots.forEach(function(bot){
		bot.draw();
	});
};
