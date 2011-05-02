$(document).ready(function(){
    var world = new Nav.World();
        world.agents = [];
        world.obstacles = [];

    world.addAgent(new Nav.Agent($V([75,75]), $V([50,50]), 5, true));
    world.addAgent(new Nav.Agent($V([75,475]), $V([50,50]), 5, false));
    world.addAgent(new Nav.Agent($V([700,75]), $V([50,50]), 5, false));
    world.addAgent(new Nav.Agent($V([400,75]), $V([50,50]), 5, true));
    //top left is 50,50; bottom right is 750,550
    world.addExt($V([399,50]), 800, 'n');
    world.addExt($V([399,550]), 800, 's');
    world.addExt($V([750,300]), 600, 'e');
    world.addExt($V([50,300]), 600, 'w');
    world.addFire($V([50,50]));
    world.addWall($V([100,200]), 100, 'h');
    world.addWall($V([150,75]), 50, 'v');
    world.addWall($V([300,150]), 200, 'v');
    world.addWall($V([200,400]), 300, 'v');
    world.addWall($V([700,450]), 100, 'h');
    world.addWall($V([500,100]), 100, 'v');
    world.addWall($V([500,150]), 200, 'h');
    world.addWall($V([600,300]), 300, 'h');
    world.addWall($V([500,500]), 100, 'v');
    world.agents.map(function(elem){
        target = $V([700,500]);
        elem.target = target; 
        elem.heading = Math.atan2(target.e(2) - elem.position.e(2), target.e(1) - elem.position.e(1));
    });


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
            if (nav.world.agents.some(function(e){ return e.strategy === 'A*';})) {
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
        
        // Respond to mouse events.
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
        
        // Draw an agent in the world.
        proc.drawAgent = function(agent){
            if(agent.path !== null){
                this.drawPath(agent.path, nav.aStar.grid);
            }
            this.ellipseMode(0);
            this.fill(255, agent.health*255 ,agent.health*255 );
            this.ellipse(agent.position.e(1) - 5, agent.position.e(2) - 5, agent.size*2, agent.size*2);
            
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

        // Visualize a path in a grid.
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
                this.ellipse(x-5, y-5, width, height);
                
                if(node + 1 < numNodes) {
                    nextX = path[node+1].e(1);
                    nextY = path[node+1].e(2);
                    this.line(x, y, nextX, nextY);
                }
            }
        };

        // Draw an obstacle in the world
        proc.drawObstacle = function(obstacle) {
            switch(obstacle.type){
                case 'exterior':
                    this.rectMode(3);
                    this.noStroke();
                    this.fill(255,255,255);
                    if(obstacle.direction == 'n' || obstacle.direction == 's'){
                        this.rect(obstacle.position.e(1), obstacle.position.e(2), obstacle.size, 10);
                    } else {
                        this.rect(obstacle.position.e(1), obstacle.position.e(2), 10, obstacle.size);   
                    }
                    this.stroke(0,0,0);
                    break;
                case 'block':
                    this.noStroke();
                    this.fill(255,255,255);
                    this.rect(obstacle.position.e(1), obstacle.position.e(2), obstacle.size, obstacle.size);
                    break;
                case 'fire':
                    this.noFill();
                    this.ellipseMode(3);
                    this.stroke(247, 115, 7);
                    this.ellipse(obstacle.position.e(1), obstacle.position.e(2), obstacle.size*2, obstacle.size*2);
                    break;
                default:
                    break;
            }
        };
    };

	var proc = new Processing(document.getElementById('display'), draw);
});
