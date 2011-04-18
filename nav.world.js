(function(){
    function World(agents, obstacles){
        this.agents = agents;
        this.obstacles = obstacles;
    }

    World.prototype = {
        addAgent: function(agent) {
            this.agents.push(agent);
        },
        addObstacle: function(obs) {
            this.obstacles.push(obs);
        }
    };

    Nav.World = World;
})()
