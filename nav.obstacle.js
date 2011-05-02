(function(){
	/* An obstacle in the world. */
	function Obstacle(type, position, size) {
        this.type = type;
		this.position = position;
        this.size = size;
	}
	Obstacle.prototype ={   
        update: function(){
/*            if (Math.random()<10/this.size){
                this.size *= 1.01;
            }
*/
            this.size *= 1.001
            this.size += 2/this.size
        }
    };


	// Expose Agent constructor to main module
	Nav.Obstacle = Obstacle;
})();

