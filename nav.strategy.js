(function(){
	/* Strategies will maintain all internal state related to one agent's navigation. 
	   For example, if an agent is using A* navigation, the A* strategy object keeps
	   it's planned path. If an agent is using dynamical systems navigation, the 
	   dynamical systems object keeps track of the agent's world representation. */
	var Strategy = {};


	/* Create closures for each strategy to encapsulate things like local
	   classes that the strategies don't need to share */
	(function(strategyObj){
		/* Dynamical systems navigation strategy object */
		function Dynamical(world){
			this.world = world;
		}
		Dynamical.prototype = {
			sense: function(agent) {
                perceivedObs = [];
                for (var i = 0; i < obstacles.length(); i += 1) {
                    /* need to turn wall representations into a series of 
                     * circles and then iterate through those potentially
                     */
                    var dist = 
                        agent.position.distanceFrom(obstacles[i].position) - 
                        obstacles[i].size - agent.size;
                    var psi = agent.position.angleFrom(obstacles[i].position);
                    var dPsi
                }
            },
            
            execute: function(agent){
				/* This function should probably only update the agent's heading angle at every call,
				   based on the dynamical system. */
			}
		};
		Strategy.Dynamical = Dynamical;
	})(Strategy);



	(function(strategyObj){
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
            	var results = [[row+1,col],[row-1,col],[row,col+1],[row,col-1]];
            	return results.filter(function(elem){
            		return this.isInWorld(elem[0],elem[1]); 
            	});
            },
            // Gets the adjacent cells that are open.
            adjacentOpenCells: function(row,col){
            	return this.adjacentCells(row,col).filter(function(elem){
            		return this.data[row][col] === 0;
            	});
            },
            toGridSpace: function(pos){
                return Vector.create( [Math.floor(((this.nCols - 1) * (pos.e(1) / this.xMax))),
                                       Math.floor(((this.nRows -1) * (pos.e(2) / this.yMax)))] );
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
				// Generate the possible moves and create states from them.
				var results = this.grid.adjacentOpenCells(this.row, this.col).map(function(elem){
					return new GridNavState(elem[0],elem[1],this.grid);
				});

				return results;
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
						nodesExpanded += (new_nodes.length ? 1 : 0);
						for(var i = 0; i < new_nodes.length; i++){
							//console.log(new_nodes[i]);
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



		/* A* navigation strategy object */
		function AStar(world){
            this.world = world;
            
            // Create the world grid here
            this.grid = new WorldGrid(10,800,600);
 
            for(var i = 0; i < this.world.agents.length; i++){
                this.world.addObject(this.world.agents[i].position);
            }
		}
		AStar.prototype = {
			/* Generate the navigation path for the agent to follow */
			plan: function(){
				
			},
			execute: function(agent){

			}
		};
		Strategy.AStar = AStar;
	})(Strategy);

	// Expose the two navigation strategies under
	// Nav.strategy.<nav_strat>
	Nav.Strategy = Strategy;
})();
