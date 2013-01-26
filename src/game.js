game = function(){
	this.robots = [];
	this.level = {}; // Replace with "new level()" when THAT's done
}

game.prototype.addRobot = function(id,robot) {
	this.robots[id]=robot;
};

game.prototype.update = function() {
	this.robots.forEach(function(bot){
		bot.update();
	});
};

game.prototype.draw = function() {
	this.robots.forEach(function(bot){
		bot.draw();
	});
};