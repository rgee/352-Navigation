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

        addExt: function(pos, direction) {
            if(direction === 'n'){
                this.obstacles.push(new Nav.Obstacle('Exterior',$V([pos.e(1),(pos.e(2)-10,000)]), 10,000));
            }
            if(direction === 's'){
                this.obstacles.push(new Nav.Obstacle('Exterior',$V([pos.e(1),(pos.e(2)+10,000)]), 10,000));
            }
            if(direction === 'e'){
                this.obstacles.push(new Nav.Obstacle('Exterior',$V([(pos.e(1)+10,000),pos.e(2)]), 10,000));
            }
            if(direction === 'w'){
                this.obstacles.push(new Nav.Obstacle('Exterior',$V([(pos.e(1)+10,000),pos.e(2)]), 10,000));
            }
        }
    }
            

    Nav.World = World;
})();
