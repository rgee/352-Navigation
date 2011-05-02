$(document).ready(function(){
    var world = new Nav.World();
        world.agents = [];
        world.obstacles = [];
    world.addAgent(new Nav.Agent($V([400,600]), $V([50,50]), 10, true));

    world.agents[0].target = ($V([400, 200]));
    world.agents[0].heading = 3/2 * Math.PI;
    world.obstacles.push(new Nav.Obstacle("block", $V([100, 350]), 10));
    world.addWall($V([105,295]), 380, 'v');
    world.addWall($V([400,100]), 600, 'h');
    world.addWall($V([695,295]), 380, 'v');
    world.addWall($V([400,490]), 600, 'h');

    var nav = new Nav(world);
    
    var draw = function (proc){
        proc.setup = function() {
            proc.frameRate(60);
            proc.size(800,600);
        };
        proc.draw = function(){
            this.background(20);
            nav.update();
            this.fill(255,255,255);
            nav.world.agents.map(this.drawAgent, this);

            if(nav.debug){
                this.drawDebugInfo();
                
            } else {
                nav.world.obstacles.map(this.drawObstacle, this);   
            }
        };
        
        proc.drawDebugInfo = function(){
            var cellSize = nav.aStar.grid.cellSize;
            if (nav.world.agents[0].strategy== "dynamical") {
                for(var x = 0; x < nav.aStar.grid.xMax/cellSize; x++){
                    for(var y = 0; y < nav.aStar.grid.yMax/cellSize; y++){
                        var coords =nav.aStar.grid.toWorldSpace($V([x,y]));
                        if(nav.aStar.grid.data[x][y] === 1){
                            this.fill(255,255,255);
                            this.rectMode(3);
                            this.rect(coords.e(1),coords.e(2),10,10); 

                        }
                        
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
                    /*
                    var newAgent = new Nav.SupportAgent($V([target.e(1), target.e(2)]), $V([target.e(1), target.e(2)]), 10, true, nav.world);
                    nav.world.agents.push(newAgent);
                    */
                    break;
                case 39:
                    nav.world.addWall(target, 100, 'h');
                    //nav.world.addObstacle(new Nav.Obstacle("block",target, 10));
                    /*
                    var newAgent = new Nav.Agent($V([target.e(1), target.e(2)]), $V([target.e(1), target.e(2)]), 10, true);
                    newAgent.health = Math.random();
                    nav.world.agents.push(newAgent);
                    */
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
            this.fill(255, agent.health*255 ,agent.health*255 );
            this.ellipse(agent.position.e(1), agent.position.e(2), 20, 20);
            
            //draw target
            if(agent.target !== null) {
                this.fill(100, 255, 65);
                this.ellipse(agent.target.e(1), agent.target.e(2), 20, 20);
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
            if(obstacle.type === 'wall'){
                this.stroke(255,255,255);
                this.strokeWeight(10);
                this.line(obstacle.endPoints[0].e(1), obstacle.endPoints[0].e(2), obstacle.endPoints[1].e(1), obstacle.endPoints[1].e(2));
                this.strokeWeight(1);
            }else{
                this.rect(obstacle.position.e(1), obstacle.position.e(2), 10, 10);
            }
        };
    };

	var proc = new Processing(document.getElementById('display'), draw);
	/*proc.size(800,600);*/
});
