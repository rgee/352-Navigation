(function(){
	/* An obstacle in the world. */
	function Obstacle(type, position, size) {
        this.type = type;
		this.position = position;
        this.size = size;
	}
	Obstacle.prototype = {
	};

	// Expose Agent constructor to main module
	Nav.Obstacle = Obstacle;
})();

