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
		function Dynamical(agent){
			this.agent = agent;

		}
		Dynamical.prototype = {};
		Strategy.Dynamical = Dynamical;
	})(Strategy);

	(function(strategyObj){
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

		/* A* navigation strategy object */
		function AStar(agent){
			this.agent = agent;


		}
		AStar.prototype = {};
		Strategy.AStar = AStar;
	})(Strategy);

	// Expose the two navigation strategies under
	// Nav.strategy.<nav_strat>
	Nav.Strategy = Strategy;
})();