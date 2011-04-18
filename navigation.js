/*
Code from slides

act(agent):
    pd = getPhiDot(agent)
    vel = getV(agent)
    oldPhi = agent.headingAngle
    (oldX,oldY) = agent.posn
    #perform action
    xd = vel * cos(oldPhi)
    yd = vel * sin(oldPhi)

    newX = oldX + timestep*xd
    newY = oldY + timestep*yd
    newPhi = oldPhi + timestep*pd

    agent.headingAngle = newPhi
    agent.posn = (newX,newY)


def getPhiDot(agent):
    #get necessary quantities for calculating phiDot
    phi = agent.headingAngle
    (x,y)=agent.posn
    size = agent.size
    weights = agent.weights
    (d0,c1,c2,a,sigma,aTar,gTarObs,h1) = agent.params
    obsList = agent.perceivedObs #perceived obs. attributes of the form (dm,psi,dPsi)
    (tarX,tarY,tarSize) = agent.target
    psiTar = computeAngle(x,y,tarX,tarY)

    #calculate weights dynamical system and from that get phiDot
    (wtar,wobs) = getWeights(phi,psiTar,obsList,weights,timestep, d0,c1,c2,a,h1,sigma,aTar,gTarObs)
    agent.weights = (wtar,wobs)
*/




$(document).ready(function(){
    var agents = [new Nav.Agent($V([500,600]), $V([199,199]), 10, 10)];
    var obstacles = [$V([400, 300])];

    var nav = new Nav(agents, obstacles);
    
    var draw = function (proc){
        proc.draw = function(){
            this.background(20);
            this.fill = 200;
            this.stroke = 0;
            nav.update();
            //this.ellipse(agentX, agentY, agent.size[0], agent.size[1]);
            //this.drawObstacles(worldGrid);
            nav.world.agents.map(this.drawAgent, this);
            nav.world.obstacles.map(this.drawObstacle, this);
        };
        
        proc.mousePressed = function() {
            var target = $V([this.mouseX, this.mouseY]);
            nav.world.agents.map(function(elem){
                elem.target = target; 
            });
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
            this.rect(obstacle.e(1), obstacle.e(2), 10, 10);
        }
    };

	var proc = new Processing(document.getElementById('display'), draw);
	proc.size(800,600);
});
