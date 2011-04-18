(function(){
	/* An agent in the world. */
	function Agent(position, velocity, width, height, dynamical) {
		this.position = position;
		this.velocity = velocity;
		this.target = null;
		this.interTarget = null;
		this.speed = 20;
		this.size = [width, height];
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
						if(this.position.distanceFrom(this.interTarget) <= 1){
							this.interTarget = this.path.shift();
						} else {

							// Heading = The unitized vector representing (position - intermediate target)
							this.heading = this.interTarget.subtract(this.position).toUnitVector();

							// Position = position + (speed * direction)
							this.position = this.position.add(this.heading.multiply(this.speed));
							if(this.path.length === 0){
								this.path = this.interTarget = this.target = null;
							}
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
