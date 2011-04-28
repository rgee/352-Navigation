(function(){
	/* An agent in the world. */
	function Agent(position, velocity, size, dynamical) {
		this.position = position;
		this.velocity = velocity;
		this.target = null;
		this.interTarget = null;
		this.speed = 1;
		this.size = size;
		this.heading = 2*Math.PI;
		this.weights = [0.99, 0.99]; //for dynamical, setting here as hack
        // Default to A* navigation unless the dynamical flag is true
		dynamical = dynamical || false;
		this.strategy = (dynamical ? "dynamical" : "") || "A*";
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
                    /* Since the new position is based on the old heading, at 
                     * least temporarily this does nothing and the position 
                     * and heading are updated in the execute function. 
                     * Therefore TODO: have the position be updated here
                     */
                    
					break;
				default:
					break;
			}
		}
	};

	// Expose Agent constructor to main module
	Nav.Agent = Agent;
})();
