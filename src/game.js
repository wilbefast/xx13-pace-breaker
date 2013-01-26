game = function(){
	this.robots = [];
	this.level = {}; // Replace with "new level()" when THAT's done
	this.map = new Image();
	this.map.src = "images/map.png"
}

game.prototype.addRobot = function(id,robot) {
	this.robots[id]=robot;
};

game.prototype.update = function(delta_t) {
	for (bid in this.robots){
		bot = this.robots[bid];
		bot.update(delta_t);
	}
};

game.prototype.draw = function() {

	context.drawImage(this.map,0,0);
	this.robots.forEach(function(bot){
		bot.draw();
	});
};
