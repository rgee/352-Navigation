(function(){
	/* An obstacle in the world. */
	function Obstacle(type, position, height, width) {
        this.type = type;
		this.position = position;
        this.size = size;
	}
	Obstacle.prototype ={   
        update: function(){

            
        }
    };


	// Expose Agent constructor to main module
	Nav.Obstacle = Obstacle;
})();

