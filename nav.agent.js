(function(){
	/* An agent in the world. */
	function Agent(position, velocity, size, dynamical) {
		this.position = position;
		this.velocity = velocity;
		this.target = null;
		this.interTarget = null;
		this.speed = 2;
		this.size = size;
        this.id = null;
        this.alive = true;
        
        // [between 0 and 1]
        this.health = 1.0;
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
                    if(this.interTarget){
                        this.heading = this.interTarget.subtract(this.position).toUnitVector();
                        
                        this.position = this.position.add(this.heading.multiply(this.speed));
                    }


					break;
				case "dynamical":
                    // Since the new position is based on the old heading, at 
                    // least temporarily this does nothing and the position 
                    // and heading are updated in the execute function. 
                    // Therefore TODO: have the position be updated here                    
					break;
				default:
					break;
			}
		},
        takeDamage: function(){
            if(this.health){
                this.health -=  0.1;    
                if(this.health < 0) this.health = 0;
            }
            this.alive = !!this.health;
        }
	};
    
    // An agent that has the ability to choose to help another agent.
    function SupportAgent(position, velocity, size, dynamical, world){
        this.world = world;
    	this.position = position;
		this.velocity = velocity;
		this.target = null;
		this.interTarget = null;
        this.alive = true;
		this.speed = 5;
		this.size = size;
		this.heading = 2*Math.PI;
		this.weights = [0.99, 0.99]; //for dynamical, setting here as hack
        // Default to A* navigation unless the dynamical flag is true
		dynamical = dynamical || false;
		this.strategy = (dynamical ? "dynamical" : "") || "A*";
		this.path = null;
        this.priorities = {
                            "assist" : 1.0,
                            "escape" : 0.5
                          };
        this.assistMode = this.escapeMode = false;
        this.assistRange = 1;
        this.healthDangerLevel = 0.3;
    }
    SupportAgent.prototype = new  Agent();
    SupportAgent.prototype.constructor = SupportAgent;
    
    // Augment the prototype with new functions, overriding as we 
    // go along. Unfortunately this doesn't give us a superclass
    // to access, but it'll work since we're doing little overriding.
    SupportAgent.prototype = $.extend({},SupportAgent.prototype, {
       seekTarget: function(){
           if(this.assistMode){
               var hurtAgents = this.world.agents.filter(function(e){
                  return e.health < 0.5; 
               });
               
               var that = this;
               var healthComparator = function(a,b){
                  
                  if(a.health < b.health) return -1;
                  if(a.health > b.health) return 1;
                  return 0;
               };
               
               // If there's only one agent in need of help, go for it.
               if(hurtAgents.length === 1){
                   this.assistTarget = hurtAgents[0];
               } else if(hurtAgents.length === 0){
                   this.assistTarget = null;
               } else {
                  // If there are many, sort them and attend to the most terminal.
                  hurtAgents = hurtAgents.sort(healthComparator);
                  this.assistTarget = hurtAgents[0];
               }
           }else if(this.escapeMode){
                  
           }
       },
       // Handle logic of this agent being hurt.
        takeDamage: function(){
            if(this.health){
                this.health -=  0.1;    
                if(this.health < 0) this.health = 0;
            }
            this.alive = !!this.health;
        },
       // Help another agent. Specifics TBD.
       assist : function(agent){
       },
       evaluatePriorities : function(){
           if(this.health <= this.healthDangerLevel){
               this.assistMode = false;
               this.escapeMode = true;
           } else {
               this.assistMode = true;
               this.escapeMode = false;
           }
       },
       act : function(){
            // Determine if we can help something or find something to go help.
            if(this.assistMode){
                if(true){
                    this.seekTarget(); 
                    // If we didn't find anyone to help, do nothing for now.
                    if(this.assistTarget){
                        if(this.position.distanceFrom(this.assistTarget.position) <= this.assistRange) {
                            this.assist(this.assistTarget);
                            this.assistTarget = null;
                            this.target = null;
                        } else {
                            this.target = this.assistTarget.position;   
                        }
                    }
                }

            } else if(this.escapeMode){
                
            }
            // Actually go help or escape.
            switch(this.strategy){
				case "A*":
					if(this.path !== null){
						if(this.path.length > 0){
                            var next = this.path.shift();
                            while(next.distanceFrom(this.position) <= 0.5 ||
                                  next.distanceFrom(this.target) > this.position.distanceFrom(this.target)&&
                                  this.path.length > 0){
                                next = this.path.shift();
                            }
                            this.interTarget = next;
						}
                        if(this.path.length === 0){
                                console.log('final agent pos: ' + this.position.inspect());
								this.path = this.interTarget = this.target = null;
                                return;
                        }
                        
                        // Heading = The unitized vector representing (position - intermediate target)
                        this.heading = this.interTarget.subtract(this.position).toUnitVector();
                        // Position = position + (speed * direction)
                        this.position = this.position.add(this.heading.multiply(this.speed));
                        this.interTarget = null;
					}


					break;
				case "dynamical":
                    // Since the new position is based on the old heading, at 
                    // least temporarily this does nothing and the position 
                    // and heading are updated in the execute function. 
                    // Therefore TODO: have the position be updated here
                    
					break;
				default:
					break;
			}
            
            // Decide if we should keep helping or run for our lives!
            this.evaluatePriorities();
       }
    });

	// Expose Agent constructor to main module
	Nav.Agent = Agent;
    Nav.SupportAgent = SupportAgent;
})();
