(function(){
	/* Helper function for creating a 2-D Array (Grid) */
	function Grid(rows, cols){
		for(var x = 0; x < rows; ++x){
			this[x] = new Array(cols);
			for(var y = 0; y < cols; ++y){
				this[x][y] = 0;
			}
		}
	}
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
			return !(row < 0 || row > this.yMax) || (col < 0 || col > this.xMax);
		},
		
		/* Takes a row and column and returns an array of valid (row,col) pairs
		   if they are on the world grid. */
		adjacentCells: function(row, col) {

		},
		toGridSpace: function(pos){
			return Vector.create( [Math.floor(((this.nCols - 1) * (pos.e(1) / this.xMax))),
								   Math.floor(((this.nRows -1) * (pos.e(2) / this.yMax)))] );
		}
	};

	Nav.WorldGrid = WorldGrid;
})();