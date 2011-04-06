function draw(proc){
	proc.draw = function(){
		this.background(20);
		this.fill = 200;
		this.stroke = 0;
		agent.update();

		var agentX = agent.position.e(1),
			agentY = agent.position.e(2);
		this.ellipse(agentX, agentY, agent.size[0], agent.size[1]);
		this.drawObstacles(worldGrid);
	};
	
	proc.mousePressed = function() {
		var target = $V([this.mouseX, this.mouseY]);
		agent.target = target;
		agent.velocity = agent.target.subtract(agent.position).toUnitVector();
	}
	
	proc.keyPressed = function(){
		
	}
	
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


$(document).ready(function(){
	worldGrid = new Nav.WorldGrid(10, 800, 600);
	worldGrid.addObject(Vector.create([0,0]));
	worldGrid.addObject(Vector.create([400,300]));
	worldGrid.addObject(Vector.create([800,600]));

	var proc = new Processing(document.getElementById('display'), draw);
	proc.size(800,600);	

    agent = new Nav.Agent(Vector.create([300,400]), Vector.create([0,0]), proc.width/worldGrid.nCols, proc.height/worldGrid.nRows);
});