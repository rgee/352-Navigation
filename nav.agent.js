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
        this.escaped = false;
        this.alive = true;
        
        // [between 0 and 1]
        this.health = 1.0;
		this.heading = 2*Math.PI;
		this.weights = [0.99, 0.99]; //for dynamical, setting here as hack
        // Default to A* navigation unless the dynamical flag is true
		dynamical = dynamical || false;
		this.strategy = (dynamical ? "dynamical" : "") || "A*";
		this.path = null;
        this.replanTimeout = 1000;
        this.failedLastPlan = false;
        this.shouldReplan = true;
	}
	Agent.prototype = {
		act: function() {
			switch(this.strategy){
				case "A*":
                    if(this.failedLastPlan){
                        this.replanTimeout *= 2;
                        this.shouldReplan = false;
                        this.failedLastPlan = false;
                        var that = this,
                            callback = function(){ that.shouldReplan = true; };
                            
                        setTimeout(callback, this.replanTimeout);
                    }
                    
                    if(this.interTarget){
                        this.heading = this.interTarget.subtract(this.position).toUnitVector();
                        
                        this.position = this.position.add(this.heading.multiply(this.speed  * this.health));
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
                if(this.health <= 0) this.health = 0;
            }
            this.alive = (this.health ? true : false);
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
        this.escaped = false;
        this.exit = $V([720,500]);
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
        this.assistRange = 20;
        this.healthDangerLevel = 0.3;
        this.replanTimeout = 1000;
        this.failedLastPlan = false;
        this.shouldReplan = true;
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
                  return e.health < 0.5 && e !== this;
               },this);
               
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
                if(this.health <= 0) this.health = 0;
            }
            this.alive = (this.health ? true : false);
        },
       // Help another agent. Specifics TBD.
       assist : function(agent){
            agent.health = 1;
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
            this.seekTarget(); 
            // If we didn't find anyone to help, do nothing for now.
            if(this.assistTarget){
                if(this.position.distanceFrom(this.assistTarget.position) <= this.assistRange) {
                    this.assist(this.assistTarget);
                    this.assistTarget = null;
                    this.target = this.exit;
                    this.escapeMode = true;
                    this.assistMode = false;
                } else {
                    this.assitMode = true;
                    this.escapeMode = false;
                    this.target = this.assistTarget.position;   
                }
            }
            // Actually go help or escape.
            switch(this.strategy){
				case "A*":
                    if(this.failedLastPlan){
                        this.replanTimeout *= 2;
                        this.shouldReplan = false;
                        this.failedLastPlan = false;
                        var that = this,
                            callback = function(){ that.shouldReplan = true; };
                            
                        setTimeout(callback, this.replanTimeout);
                    }
                     if(this.interTarget){
                        this.heading = this.interTarget.subtract(this.position).toUnitVector();
                        
                        this.position = this.position.add(this.heading.multiply(this.speed  * this.health));
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
