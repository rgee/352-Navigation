(function(){
	/* An agent in the world. */
	function Agent(position, velocity, radius, dynamical) {
		this.position = position;
		this.velocity = velocity;
		this.target = null;
		this.interTarget = null;
		this.speed = 20;
		this.size = radius;
        std=c99
		this.heading = Math.PI /2;
		this.speed = 1;
		// Default to A* navigation unless the dynamical flag is true
		dynamical = dynamical || false;
		this.strategy = (dynamical ? "dynamical" : "") || "A*"
		this.path = null;
	}
	Agent.prototype = {
		act: function() {
			switch(this.strategy){
				case "A*":
					if(this.path !== null){
						if(this.interTarget === null){
							this.interTarget = this.path.shift();
						}
						if(this.position.distanceFrom(this.interTarget) <= 0.5){
							if(this.path.length === 0){
								this.path = this.interTarget = this.target = null;
							} else {
								this.interTarget = this.path.shift();
							}
						} else {

							// Heading = The unitized vector representing (position - intermediate target)
							this.heading = this.interTarget.subtract(this.position).toUnitVector();

							// Position = position + (speed * direction)
							this.position = this.position.add(this.heading.multiply(this.speed));

						}
					}


					break;
				case "dynamical":
					break;
				default:
					break;
			}
		}
	};

	// Expose Agent constructor to main module
	Nav.Agent = Agent;
})();
