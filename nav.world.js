(function(){
    function World(){
        this.maxId = -1;
    }

    World.prototype = {
        addAgent: function(agent) {
            agent.id = ++this.maxId;
            this.agents.push(agent);
        },
        addObstacle: function(obs) {
            this.obstacles.push(obs);
        },

        // Add an interior wall to the world.
        // Interior walls are defined by their midpoint, size (length) and their orientation (either horiz. or vert.)
        addWall: function(pos, length, orientation){
            var i;
            if(orientation === 'h'){
                for(i = (pos.e(1) - length / 2) + 5; i < pos.e(1) + length / 2; i+=10){
                    this.obstacles.push(new Nav.Obstacle('block',$V([i, pos.e(2)]),10));
                }
            } else if(orientation === 'v'){
                for(i = (pos.e(2) - length / 2)+5; i < pos.e(2) + length / 2; i+=10){
                    this.obstacles.push(new Nav.Obstacle('block', $V([pos.e(1), i]), 10));
                }
            }
        },

        // Add an exterior wall to bound the world.
        // Exterior walls are defined by their midpoint, size (length) and cardinal direction
        addExt: function(pos, length, direction) {
            obj = (new Nav.Obstacle('exterior', pos, length));
            obj.direction = direction;
            this.obstacles.push(obj);
        },

        // Add a fire to the world that grows over time.
        // Fires are defined by their center position and starting radius
        addFire: function(pos) {
            this.obstacles.push(new Nav.Obstacle('fire', pos, 5));
        }
    };
            

    Nav.World = World;
})();
