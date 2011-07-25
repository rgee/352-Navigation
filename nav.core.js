(function(global) {
	function Nav(world){
        this.world = world;
        this.aStar = new Nav.Strategy.AStar(this.world);
        this.dynamical = new Nav.Strategy.Dynamical(this.world);
        this.debug = false;
	}

    Nav.prototype = {
        update: function(){
            var agents = this.world.agents;
            for(var i = 0; i < agents.length; i++){
                if(agents[i].strategy === "A*"){
                    this.aStar.execute(agents[i]);
                    agents[i].act();
                    this.world.obstacles.filter(function(e){
                        return e.type === 'fire';    
                    }).forEach(function(e){
                        if(e.position.distanceFrom(agents[i].position) <= e.size - agents[i].size){
                            agents[i].takeDamage();
                        }
                    });
                } else {
                    // Do DS
                    this.dynamical.execute(agents[i]);
                    agents[i].act();
                }
            }
            this.world.agents = this.world.agents.filter(function(e){
                return !e.escaped;
            });
            this.world.obstacles.map(function(e){
                if (e.type === "fire"){e.update();}
            });
        }
           
    };

	// Expose our module to the global scope
	if(global.Nav){
		throw new Error("Nav object already defined");
	} else {
		global.Nav = Nav;
	}

})(window);
