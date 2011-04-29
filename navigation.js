$(document).ready(function(){
    var agents = [new Nav.Agent($V([200,150]), $V([50,50]), 10)];
    var obstacles = [new Nav.Obstacle("goldfish", $V([100, 350]), 10)];

    var nav = new Nav(agents, obstacles);
    
    var draw = function (proc){
        proc.setup = function() {
            proc.frameRate(60);
            proc.size(400,300);
        };
        proc.draw = function(){
            this.background(20);
            nav.update();
            this.fill(255,255,255);
            nav.world.agents.map(this.drawAgent, this);
            nav.world.obstacles.map(this.drawObstacle, this);
            if(nav.debug){
                this.drawDebugInfo();
            }
        };
        
        proc.drawDebugInfo = function(){
            var cellSize = nav.aStar.grid.cellSize;
            if (nav.world.agents[0].strategy== "A*") {
                for(var x = 0; x < nav.aStar.grid.xMax/cellSize; x++){
                    for(var y = 0; y < nav.aStar.grid.yMax/cellSize; y++){
                        var coords =nav.aStar.grid.toWorldSpace($V([x,y]));
                        this.stroke(255,255,0);
                        this.point(coords.e(1), coords.e(2));
                        this.stroke(0,0,0);
                    }
                }
            }
            //Dynamical systems
            else {

            }
        };
        
        proc.mousePressed = function() {
            var target = $V([this.mouseX, this.mouseY]);
            switch(this.mouseButton){
                case 37:
                    nav.world.agents.map(function(elem){
                        elem.target = target; 
                        elem.heading = Math.atan2(target.e(2) - elem.position.e(2), target.e(1) - elem.position.e(1));
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
            //draw target
            if(agent.target !== null) {
                this.ellipse(agent.target.e(1), agent.target.e(2), 10, 10);
            }
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
            this.rect(obstacle.position.e(1), obstacle.position.e(2), 10, 10);
        };
    };

	var proc = new Processing(document.getElementById('display'), draw);
	/*proc.size(800,600);*/
});
