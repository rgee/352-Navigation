(function(){
	/* An agent in the world. */
	function Agent(position, velocity, width, height) {
		this.position = position;
		this.velocity = velocity;
		this.target = position;
		this.speed = 20;
		this.size = [width, height];
		this.heading = Math.PI /2;
	}
	Agent.prototype = {
		update: function() {
			var dist = this.target.distanceFrom(this.position);
			
			/* Fail out for tiny movement requests so as to avoid weird numerical
			   instability issues. */
			if(dist <= 0.001) return;
			this.position = this.position.add(this.velocity.multiply(dist* (1 / this.speed)));
			
		}
	};

	// Expose Agent constructor to main module
	Nav.Agent = Agent;
})();