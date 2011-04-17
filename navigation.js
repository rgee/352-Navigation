function draw(proc){
	proc.draw = function(){
		this.background(20);
		this.fill = 200;
		this.stroke = 0;

		//this.ellipse(agentX, agentY, agent.size[0], agent.size[1]);
		this.drawObstacles(worldGrid);
	};
	
	proc.mousePressed = function() {
		var target = $V([this.mouseX, this.mouseY]);
		agent.target = target;
		agent.velocity = agent.target.subtract(agent.position).toUnitVector();
	};
	
	proc.keyPressed = function(){
		
	};

    /**
     * Visualize a path in a grid.
     *
     * Input: A path (list of vectors), a grid (you know what this is...)
     */	
    proc.drawPath = function(path, grid) {
       var node = 0,
           cellWidth = this.width / grid.nCols,
           cellHeight = this.height / grid.nRows,
           numNodes = path.length,
           x, y,
           nextX, nextY;

        for(node; node < numNodes; node++){
            x = path[node].e(1);
            y = path[node].e(2);    

            this.ellipse(x * cellWidth, y * cellHeight, 10, 10);
            
            if(node + 1 < numNodes) {
                nextX = path[node+1].e(1);
                nextY = path[node+1].e(2);
                this.line(x * cellWidth, y * cellHeight, nextX * cellWidth, nextY * cellHeight);
            }
        }
    };

	proc.drawObstacles = function(grid) {
		var cellWidth = this.width / grid.nCols;
		var cellHeight = this.height / grid.nRows;
		this.fill = 125;

		for(var y = 0; y < grid.nRows; ++y){
			for(var x = 0; x < grid.nCols; ++x) {

				if(grid.data[y][x]){
					this.rect(x*cellWidth, y*cellHeight, cellWidth, cellHeight);
				}
			}
		}
	}
}


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
    var agents = [new Nav.Agent($V([200,200]), $V([199,199]), 10, 10)];
    var obstacles = [];
    agents[0].target = $V([50,50]);

    var nav = new Nav(agents, obstacles);
    nav.update();


/*
	worldGrid = new Nav.WorldGrid(10, 800, 600);
	worldGrid.addObject(Vector.create([0,0]));
	worldGrid.addObject(Vector.create([400,300]));
	worldGrid.addObject(Vector.create([800,600]));

	var proc = new Processing(document.getElementById('display'), draw);
	proc.size(800,600);	

    agent = new Nav.Agent(Vector.create([300,400]), Vector.create([0,0]), proc.width/worldGrid.nCols, proc.height/worldGrid.nRows, worldGrid, false);
*/
});
