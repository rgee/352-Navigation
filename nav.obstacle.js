(function(){
	/* An obstacle in the world. */
	function Obstacle(type, position, height, width) {
        this.type = type;
        //for walls, this is the upper left hand corner. for everything else 
        //this is the center of the object
		this.position = position;
        this.height = height;
        this.width = width;
        if(type !== "wall") {
        	this.size = height;
        }
	}
	Obstacle.prototype = {
	};

	// Expose Agent constructor to main module
	Nav.Obstacle = Obstacle;
})();

