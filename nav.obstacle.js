(function(){
	/* An obstacle in the world. */
	function Obstacle(type, position) {
        this.type = type;
		this.position = position;
	}
	Obstacle.prototype = {
	};

	// Expose Agent constructor to main module
	Nav.Obstacle = Obstacle;
})();

