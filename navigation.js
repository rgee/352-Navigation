$(document).ready(function(){
    var world = new Nav.World();
        world.agents = [];
        world.obstacles = [];
    world.addAgent(new Nav.Agent($V([400,300]), $V([50,50]), 5, true));

    /*
    var i=0;
    while(i<10){
        var x = Math.random()*800;
        var y = Math.random()*600;
        if(x<=55){ x+=100;}
        if(x>=745){ x-=100;}
        if(y<=55){ y+=100;}
        if(y>=545){ y-=100;}
        world.addAgent(new Nav.Agent($V([x,y]), $V([50,50]), 5, true));
        i++;
    }
    */
    
    world.obstacles.push(new Nav.Obstacle("block", $V([300, 350]), 10));
    world.addWall($V([350,200]), 100, 'h');
    world.addExt($V([399,50]), 800, 'n');
    world.addExt($V([399,550]), 800, 's');
    world.addExt($V([750,300]), 600, 'e');
    world.addExt($V([50,300]), 600, 'w');
    world.addFire($V([50,50]));


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
            if (nav.world.agents[0].strategy === "A*") {
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
                this.noFill();
                this.stroke(255,255,255);
                this.ellipseMode(3);
                nav.dynamical.envObs.forEach(function(elem){
                    this.ellipse(elem.center.e(1), elem.center.e(2), elem.radius*2, elem.radius*2);
                },this);
                this.stroke(0,0,0);
                this.fill();
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
                    nav.world.addWall(target, 100, 'h');
                    break;
                default:
                    break;
            }
        };

        proc.drawAgent = function(agent){

            if(agent.path !== null){
                this.drawPath(agent.path, nav.aStar.grid);
            }
            this.ellipseMode(0);
            this.fill(255, agent.health*255 ,agent.health*255 );
            this.ellipse(agent.position.e(1), agent.position.e(2), agent.size*2, agent.size*2);
            
            if(agent.target !== null) {
                
                var pos = agent.target;
                if(agent.strategy === "A*"){
                    pos = nav.aStar.grid.toGridSpace(agent.target);
                }
                this.ellipseMode(0);
                this.fill(100, 255, 65);
                this.ellipse(pos.e(1) * nav.aStar.grid.cellSize, pos.e(2) * nav.aStar.grid.cellSize, 10, 10);
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
                this.ellipseMode(0);
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
                this.rect(obstacle.position.e(1), obstacle.position.e(2), obstacle.size, obstacle.size);
            }
        };
    };

	var proc = new Processing(document.getElementById('display'), draw);
});
