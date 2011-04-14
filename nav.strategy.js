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
		Dynamical.prototype = {
			sense: function(agent) {
                perceivedObs = [];
                for (int i = 0; i < obstacles.length(); i += 1) {
                    /* need to turn wall representations into a series of 
                     * circles and then iterate through those potentially
                     */
                    var dist = 
                        agent.position.distanceFrom(obstacles[i].position) - 
                        obstacles[i].size - agent.size;
                    var psi = agent.position.angleFrom(obstacles[i].position);
                    var dPsi
                }
            }
            
            execute: function(agent){
				/* This function should probably only update the agent's heading angle at every call,
				   based on the dynamical system. */
			}
		};
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
				results.push([this.col-1, this.row], [this.col +1, this.row], [this.col, this.row -1], [this.col, this.row +1]);
				
				var gridSpaceVec;
				var currentRow, currentCol;
				for(var i = 0; i < results.length; ++i){
					gridSpaceVec = this.grid.toGridSpace(Vector.create(results[i]));
					currentRow = (results[i])[1];
					currentCol = (results[i])[0];

					/* Filter out invalid moves and construct states from valid ones. */
					if(!this.grid.isInWorld(currentRow, currentCol) || 
					    this.grid.data[gridSpaceVec.e(1)][gridSpaceVec.e(0)] === 1){
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
		function AStar(agent){
			// The agent this strategy instance belongs to.
			this.agent = agent;

			// The initial state based on the agent's current position.
			// FIX: Right now agent.position is in world-space coordinates not grid space, so this will
			//      produce strange results. Translate them later.
			this.initial = new GridNavState(agent.position.e(1), agent.position.e(2), agent.world);

			// The goal node.
			this.goal = {};

			// The path is just an array of nodes.
			this.path = [];
		}
		AStar.prototype = {
			/* Generate the navigation path for the agent to follow */
			plan: function(){
				var result = heuristicSearch(
								this.initial,
								this.goal,
								new BinHeap(function(node){return node.h + node.g;}),
								function(state, goal){
									// Use distance squared here since we don't care about the actual distance, just the
									// comparison between two of them. 
									return (Math.pow(state.col - goal.col, 2) + Math.pow(state.row - goal.row, 2));
								});

				if(result !== null){
					while(result !== null){
						this.path.unshift(result);
						result = result.parent;
					}
				}
			},
			execute: function(goalCell){
				/* Ideas for this implementation:
				   This function should adjust the agent's target property, as the agent will
				   logically always be moving to its target. If the agent has reached
				   the target on a frame in which this is called, give it the next target if
				   there is one. */

				   this.goal = new GridNavState(goalCell.e(1), goalCell.e(2), this.agent.world);

				   // Check if the agent has reached its target, if so we should return null here.

				   if(this.path.length === 0){
				       this.plan();
				       if(this.path.length === 0){
				           this.agent.target = null;
				       } else {
				        this.agent.target = this.path.shift();
				       }
				   }
			}
		};
		Strategy.AStar = AStar;
	})(Strategy);

	// Expose the two navigation strategies under
	// Nav.strategy.<nav_strat>
	Nav.Strategy = Strategy;
})();
