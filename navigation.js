var agent = new Object();
var worldGrid = new Object();

/* Helper function for creating a 2-D Array (Grid) */
function Grid(rows, cols){
	for(var x = 0; x < rows; ++x){
		this[x] = new Array(cols);
		for(var y = 0; y < cols; ++y){
			this[x][y] = 0;
		}
	}
}

/* An agent in the world. */
function Agent(position, velocity, width, height) {
	this.position = position;
	this.velocity = velocity;
	this.target = position;
	this.speed = 20;
	this.size = [width, height];
	this.heading = Math.PI /2;
}
Agent.prototype = {
	update: function() {
		var dist = this.target.distanceFrom(this.position);
		
		/* Fail out for tiny movement requests so as to avoid weird numerical
		   instability issues. */
		if(dist <= 0.001) return;
		this.position = this.position.add(this.velocity.multiply(dist* (1 / this.speed)));
		
	}
};

/* The 2-Dimensional grid representing the world's occupancy data. A 0 is stored
   at position (i, j) if there is no obstacle at cell (i, j) and a 1 otherwise. */
function WorldGrid(cellSize, xMax, yMax) {
	this.xMax = xMax;
	this.yMax = yMax;
	this.nRows = yMax / cellSize;
	this.nCols = xMax / cellSize;
	this.data = new Grid(this.nRows, this.nCols);
}

WorldGrid.prototype = {
	/* Add an object at position pos. */
	addObject: function(pos) {
		var row = Math.floor(((this.nRows -1) * (pos.e(2) / this.yMax)));
		var col = Math.floor(((this.nCols -1) * (pos.e(1) / this.xMax)));
		console.log(row + " " + col);
		this.data[row][col] = 1;
	},
	
	/* Remove an object at position pos. */
	removeObject: function(pos) {
		var row = Math.floor((this.nRows * (pos.e(2) / this.yMax)));
		var col = Math.floor((this.nCols * (pos.e(1) / this.xMax)));
		this.data[row][col] = 0;
	},
	
	/* Takes a row and a column and returns true if the cell at that position
	   is on the world grid and false otherwise. */
	isInWorld: function(row, col) {
	
	},
	
	/* Takes a row and column and returns an array of valid (row,col) pairs
	   if they are on the world grid. */
	adjacentCells: function(row, col) {

	}
};

/* A node in the search tree. Stores heuristic data as well as parent info. */
function Node(state, parent) {
	this.state = state;
	this.parent = parent;
	this.h = 0;
	this.g = 0;
}

Node.prototype = {
	expand : function() {
		var successors = new Array();
		var results = this.state.applyOperators();
		var len = results.length;
		var i;
		for(i = 0; i < len; i++) {
			successors.push(new Node(results[i], this));
		}
		return successors;
	}
};

function GridNavState(row, col, grid) {
	this.row = row;
	this.col = col;
	this.grid = grid;
}

GridNavState.prototype = {
	/* Returns an array of states if they represent cells that are are adjacent to the current
	   cell and not obstructed. */
	applyOperators: function(){
		var results = new Array();
		results.push([row -1, col], [row +1, col], [row, col -1], [row, col +1]);
		
		var currentRow, currentCol;
		for(var i = 0; i < results.length; ++i){
			currentRow = (results[i])[0];
			currentCol = (results[i])[1];
			
			/* Filter out invalid moves and construct states from valid ones. */
			if(!this.grid.isInWorld(currentRow, currentCol) || 
			    this.grid.data[currentRow][currentCol] === undefined){
				results.splice(i,1);
			} else {
				results[i] = new GridNavState(currentRow, currentCol, this.grid);
			}
		}
		return results;
	}
};

/* Direct translation of Aaron's version. Currently untested. (3/15/11) */
function heuristicSearch(initialState, goalState, fringe, heuristic){
	var maxExpansions = 3500;
	var nodesExpanded = 0;
	var start = new Node(initialState);
	fringe.push(start);
	var closedStates = new HashSet(function(u){return u;}, function(u,v){return u === v;});
	var current;
	var new_nodes;
	while(!fringe.isEmpty()){
		current = fringe.pop();
		if(current.state === goalState){
			console.log("Found Solution");
			return current;
		}
		else if(!closedStates.contains(current.state)){
			closedStates.add(current.state);
			if(nodesExpanded < maxExpansions){
				new_nodes = current.expand();
				nodes_expanded += (new_nodes.length ? 1 : 0);
				for(var i = 0; i < new_nodes.length; i++){
					new_nodes[i].g = current.g + 1;
					new_nodes[i].h = heuristic(new_nodes[i].state, goalState);
					fringe.push(new_nodes[i]);
				}
			}
		}
	}
	console.log("Solution not found.");
	return null;
}

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

function testHeap(){
	/* From the looks of this, the heap is working properly. */
	var heap = new BinHeap(function(u) { return u; });
	heap.push(1);
	heap.push(3);
	heap.push(2);
	heap.push(-1);
	heap.push(4);
	while(!heap.isEmpty()){
		console.log(heap.pop());
	}
}

$(document).ready(function(){
	worldGrid = new WorldGrid(10, 800, 600);
	worldGrid.addObject(Vector.create([0,0]));
	worldGrid.addObject(Vector.create([400,300]));
	worldGrid.addObject(Vector.create([800,600]));

	var proc = new Processing(document.getElementById('display'), draw);
	proc.size(800,600);	

    agent = new Agent(Vector.create([300,400]), Vector.create([0,0]), proc.width/worldGrid.nCols, proc.height/worldGrid.nRows);
});