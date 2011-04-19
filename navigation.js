$(document).ready(function(){
    var agents = [new Nav.Agent($V([600,600]), $V([50,50]), 10, true)];
    var obstacles = [new Nav.Obstacle("goldfish", $V([400, 300]), 10)];

    var nav = new Nav(agents, obstacles);
    
    var draw = function (proc){
        proc.setup = function() {
            proc.frameRate(10);
            proc.size(1000,1000);
        }
        proc.draw = function(){
            this.background(20);
            this.fill = 200;
            this.stroke = 0;
            nav.update();
            //this.ellipse(agentX, agentY, agent.size[0], agent.size[1]);
            //this.drawObstacles(worldGrid);
            nav.world.agents.map(this.drawAgent, this);
            //nav.world.obstacles.map(this.drawObstacle, this);
            if (nav.world.agents[0].strategy == "A*") {
                for(var x = 0; x < nav.aStar.grid.xMax/10; x++){
                    for(var y = 0; y < nav.aStar.grid.yMax/10; y++){
                        if(nav.aStar.grid.data[x][y]){
                            this.rect(x * (10),
                                      y * (10),
                                      10, 10);
                        }
                    }
                }
            }
            //Dynamical systems
            else {
                for (var i = 0; i < nav.world.obstacles.size; i += 1) {
                    drawObstacle(nav.world.obstacles[i]);
                }
            }
            proc.println(nav.world.agents[0].position.e(1) + ", " + nav.world.agents[0].position.e(2));
        };
        
        proc.mousePressed = function() {
            var target = $V([this.mouseX, this.mouseY]);
            switch(this.mouseButton){
                case 37:
                    nav.world.agents.map(function(elem){
                        elem.target = target; 
                    });
                    break;
                case 39:
                    nav.world.obstacles.push(new Nav.Obstacle("goldfish", target, 10));
                    break;
                default:
                    break;
            }
        };
        
        proc.keyPressed = function(){
            
        };

        proc.drawAgent = function(agent){
            if(agent.path !== null){
                this.drawPath(agent.path, nav.aStar.grid);
            }

            this.ellipse(agent.position.e(1), agent.position.e(2), 10, 10);
        };

        /**
         * Visualize a path in a grid.
         *
         * Input: A path (list of vectors), a grid (you know what this is...)
         */ 
        proc.drawPath = function(path, grid) {
           var node = 0,
               numNodes = path.length,
               width = 8,
               height = 8,
               x, y,
               nextX, nextY;
            for(node; node < numNodes; node++){
                x = path[node].e(1);
                y = path[node].e(2);    

                this.ellipse(x, y, width, height);
                
                if(node + 1 < numNodes) {
                    nextX = path[node+1].e(1);
                    nextY = path[node+1].e(2);
                    this.line(x, y, nextX, nextY);
                }
            }
        };

        proc.drawObstacle = function(obstacle) {
            this.fill = 125;
            this.rect(obstacle.position.e(1), obstacle.position.e(2), 10, 10);
        }
    };

	var proc = new Processing(document.getElementById('display'), draw);
	/*proc.size(800,600);*/
});
