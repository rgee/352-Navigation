(function(){
	/* Strategies will maintain all internal state related to one agent's navigation. 
	   For example, if an agent is using A* navigation, the A* strategy object keeps
	   it's planned path. If an agent is using dynamical systems navigation, the 
	   dynamical systems object keeps track of the agent's world representation. */
	var Strategy = {};


	/* Create closures for each strategy to encapsulate things like local
	   classes that the strategies don't need to share */
	(function(strategyObj){
        /* Extend the math object to add hyperbolic trigonometric functions */
        Math.sinh = function(x){
            return (Math.exp(x) - Math.exp(-x))/2;  
        };
        Math.cosh = function(x){
            return (Math.exp(x) + Math.exp(-x))/2;    
        };
        Math.tanh = function(x){
            return Math.sinh(x) / Math.cosh(x);
        };

		// Parameters. Naming should be sorted out
        var c1 = 2.0;
        var c2 = 2.0;
        var a = 1.0;
        var sigma = 0.2;
        var h1 = 20.0;
        var aTar = 0.4;
        var gTarObs = 0.05;
        var timestep = 0.05;

        function Circle(pos, rad){
            this.center = pos;
            this.radius = rad;
        }
        
        /* Dynamical systems navigation strategy object */
		function Dynamical(world){
			this.world = world;
		}
        
        
		Dynamical.prototype = {
            //fTar
            calculateAttraction: function(phi, psiTar) {
                return -a * Math.sin(phi - psiTar);
            },
            
            alphaObs: function(phi, d0) {
                

                return Math.tan(Di);
                
                
            },

            targetDetector: function(phi, psiTar, target) {
                var dFtar_dPhi = a * Math.cos(phi - psiTar);
                return -1 * Math.sin(dFtar_dPhi) * Math.pow(Math.E, -c1 * 
                    Math.abs(calculateAttraction(target)));
            },

            obsDetector: function(phi, d0) {
                /* You only have to prepend something with var once. Doing it twice
                   overwrites it with a new variable of the same name. Also,
                   var something += something else doesn't make sense as something
                   has no value yet.
                var fObs = 0;
                var dFobs_dPhi = 0;
                var w = 0;
                for (var i = 0; i < obstacles.size(); i++) {
                    var Di = D(dm, d0);
                    var Wi = W(phi, psi, dPsi);
                    var Ri = R(phi, psi, dPsi);
                    var fObs = fObs + (Di * Wi * Ri);
                    var tmp = (1.0/Math.cos(h1 * (Math.cos(phi - psi) - Math.cos(dPsi + sigma))));
                    var help = (phi - psi)/dPsi;
                    var dWi = (-0.5 * h1 * tmp * tmp * Math.sin(phi - psi));
                    var dRi = ((dPsi - Math.abs(phi - psi)) * Math.pow(Math.E, 1-Math.abs(help)));
                    var dFobs_dPhi += (Di * (Wi * dRi + dWi * Ri));
                    var w += Wi;
                return Math.sin(dFobs_dPhi) * Math.pow(Math.E, -c1 * Math.abs(fObs)) * w;
                }
                */
            },

            getWeights: function(phi, psiTar, w1, w2, d0,aTar, gTarObs) {
                var a1 = alphaTar(aTar);
                var a2 = alphaObs(phi, d0, obstacles);
                var g12 = gammaTarObs(gTarObs);
                var g21 = gammaObsTar(phi, d0, psiTar);
                
                for (var i = 0; i < 100; i++) {
                    var w1dot = (a1 * w1 * (1 - w1 * w1) - g21 * w2 * w2 * w1 + 0.01 * (Math.random() - 0.5));
                    var w2dot = (a2 * w2 * (1 - w2 * w2) - g12 * w1 * w1 * w2 + 0.01 * (Math.random() - 0.5));
                    w1 += w1dot * timestep;
                    w2 += w2dot * timestep;
                }
                if (!(w1 < 1 && w1 > -1)) {
                    w1 = 0.99;
                }
                if (!(w2 < 1 && w2 > -1)) {
                    w2 = 0.99;
                }
                return (w1, w2);
            },

            getPhiDot: function(agent) {
            /* Please re-write this in JS.
                phi = agent.heading;
                psiTar = computeAngle(agent.position.x, agent.position.y, target.position.x, target.position.y);
                (wtar, wobs) = getWeights(phi, psiTar, agent.weights, d0, aTar, gTarObs);
                agent.weights = (wtar, wobs);
                fObs = 0;
                for (int i = 0; i < obstacles.size(); i += 1) {
                    fObs += fObsl(phi, obstacles[i], d0);
                }
                return (Math.abs(wtar) * ftar) + (Math.abs(wobs) * fObs) + 0.01*(Math.random()-0.5);
            */
            },
        
            perceiveObstacle: function(obs) {
            /* distanceFrom takes a vector and the subtraction operator doesn't exist for objects.
                var dist = agent.position.distanceFrom(obs.position - 
                    obs.size - agent.size);
                var psi = agent.position.angleFrom(obs.position);
                return subtendedAngle(agent.position, agent.size, 
                    obs.position, obs.size);
             */
            },
			sense: function(agent) {
                var pos = agent.position,
                    agSize = agent.size,
                    tarCircle = (agent.target.hasOwnProperty("size") ? 
                                    new Circle(agent.target.position, agent.target.size) :
                                    new Circle(agent.target, 10)),
                    percievedObs = [],
                    dm = psi = dPsi = 0;
                var mapper = function(element) {
                };

                this.world.obstacles.map(function(elem){
                    
                });
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
        /**
         * The 2-Dimensional grid representing the world's occupancy data. A 0 is stored
         * at position (i, j) if there is no obstacle at cell (i, j) and a 1 otherwise. 
         */
        function WorldGrid(cellSize, xMax, yMax) {
            this.xMax = xMax;
            this.yMax = yMax;
            this.nRows = yMax / cellSize;
            this.nCols = xMax / cellSize;
            this.data = new Grid(this.nCols,this.nRows);
        }

        WorldGrid.prototype = {
            /* Add an object at position pos. */
            addObject: function(pos) {
                var gridSpace = this.toGridSpace(pos);

                this.data[gridSpace.e(1)][gridSpace.e(2)] = 1;
            },
            clear: function(){
                this.data = new Grid(this.nCols, this.nRows);    
            },
            /* Remove an object at position pos. */
            removeObject: function(pos) {
                var row = Math.floor((this.nRows * (pos.e(2) / this.yMax))),
                    col = Math.floor((this.nCols * (pos.e(1) / this.xMax)));
                this.data[row][col] = 0;
            },
            
            /* Takes a row and a column and returns true if the cell at that position
               is on the world grid and false otherwise. */
            isInWorld: function(col, row) {
            	return (row >= 0 && row < this.nRows) && (col >= 0 && col < this.nCols);
            },
            
            /* Takes a row and column and returns an array of valid (row,col) pairs
               if they are on the world grid. */
            adjacentCells: function(col, row) {
            	var results = [[col+1,row],[col-1,row],[col,row+1],[col,row-1]];
            	var final =  results.filter(function(elem){
            		return this.isInWorld(elem[0],elem[1]); 
            	}, this);
            	return final;
            },
            /**
             * Gets the adjacent cells that are open.
             */
            adjacentOpenCells: function(col,row){
            	return this.adjacentCells(col,row).filter(function(elem){
            		return this.data[elem[0]][elem[1]] === 0;
            	}, this);
            },
            /**
             * Converts a vector from grid space to world space. By the nature of this transformation, some information is lost so we
             * translate to the center of a grid square in world space.
             */
            toWorldSpace: function(pos){
                var cellSize = (this.xMax / this.nCols);
                return Vector.create( [(pos.e(1) * cellSize) + cellSize/2, (pos.e(2) * cellSize) + cellSize/2] );  
            },
            toGridSpace: function(pos){
                return Vector.create( [Math.floor(((this.nCols - 1) * (pos.e(1) / this.xMax))),
                                       Math.floor(((this.nRows -1) * (pos.e(2) / this.yMax)))] );
            }
        };


		/**
		 * A node in the search tree. Stores heuristic data as well as parent info.
		 */
		function Node(state, parent) {
			this.state = state;
			this.parent = parent;
			this.h = 0;
			this.g = 0;
		}

		Node.prototype = {
			expand : function() {
				var successors = [],
				    results = this.state.applyOperators(),
				    len = results.length,
				    i;
				for(i = 0; i < len; i++) {
					successors.push(new Node(results[i], this));
				}
				return successors;
			}
		};

		/**
		 * States in the world represented by a 2d Grid.
		 */
		function GridNavState(col, row, grid) {
			this.col = col;
			this.row = row;
			this.grid = grid;
		}

		GridNavState.prototype = {
			/* Returns an array of states if they represent cells that are are adjacent to the current
			   cell and not obstructed. */
			applyOperators: function(){
				// Generate the possible moves and create states from them.
				var results = this.grid.adjacentOpenCells(this.col, this.row).map(function(elem){
					return new GridNavState(elem[0],elem[1],this.grid);
				}, this);
				return results;
			},
			equals: function(otherState){
				return (this.col === otherState.col) && (this.row === otherState.row);
			}
		};

		/**
		 * Perform heuristic search.
		 * Input: The initial state, the goal state, a structure to represent the fringe of knowledge and a heuristic to use to compare states.
		 * Output: The last node in the search path of an optimal solution.
		 */
		function heuristicSearch(initialState, goalState, fringe, heuristic){
			var maxExpansions = 35000,
			    nodesExpanded = 0,
			    start = new Node(initialState),
				closedStates = new HashSet(function(u){return $V([u.row, u.col]);}, function(u,v){return u.equals(v);}),
			    current,
			    new_nodes;
			fringe.push(start);

			while(!fringe.isEmpty()){
				current = fringe.pop();
				if(current.state.equals(goalState)){
					console.log("Found Solution");
					return current;
				}
				else if(!closedStates.contains(current.state)){
					closedStates.add(current.state);
					if(nodesExpanded < maxExpansions){
						new_nodes = current.expand();
						nodesExpanded += (new_nodes.length ? 1 : 0);
						for(var i = 0; i < new_nodes.length; i++){
							new_nodes[i].g = current.g + 1;
							new_nodes[i].h = heuristic(new_nodes[i].state, goalState);
							fringe.push(new_nodes[i]);
						}
					} else {
						console.log("too many nodes");
						return null;
					}
				}
			}
			console.log("Solution not found.");
			return null;
		}

		/**
		 * Euclidean distance heuristic for A*
		 * Input: Two states, the current state and the goal state
		 * Output: The straight line disance between the two points the states represent.
		 */
		function straightLineDist(currState, goalState){
			return (Math.pow((currState.row - goalState.row),2) + Math.pow((currState.col - goalState.col),2));
		}

		/* A* navigation strategy object */
		function AStar(world){
            this.world = world;
            
            // Create the world grid here
            this.grid = new WorldGrid(10,800,600);
            this.updateRepresentation();
		}
		AStar.prototype = {
            /**
             * Convert from a node chain to an actual path.
             * Input: A node that is the final node in a search path.
             * Output: An array of vectors representing the path in grid space.
             */
            toPath: function(node){
                var results = [$V([node.state.col, node.state.row])];
                while(node = node.parent){
                    results.push($V([node.state.col, node.state.row]));
                }
                return results.reverse().map(function(elem){
                    return this.grid.toWorldSpace(elem);
                }, this);
            },
			/* Generate the navigation path for the agent to follow */
			plan: function(){
				
			},
            updateRepresentation: function(){
                this.grid.clear();
                this.world.agents.map(function(elem){
                    this.grid.addObject(elem.position);
                }, this);
                this.world.obstacles.map(function(elem){
                    this.grid.addObject(elem);
                },this);
            },
			execute: function(agent){
                if(agent.path === null && agent.target !== null){
                   
    				var gridSpacePos = this.grid.toGridSpace(agent.position),
    				    gridSpaceTar = this.grid.toGridSpace(agent.target),
    				    initial = new GridNavState(gridSpacePos.e(1), gridSpacePos.e(2), this.grid),
    				    goal = new GridNavState(gridSpaceTar.e(1), gridSpaceTar.e(2), this.grid),
    				    fringe = new BinHeap(function(node){ return node.h + node.g; }),
    				    heuristic = straightLineDist,
    				    result = heuristicSearch(initial, goal, fringe, heuristic);
                    if(result !== null){
    				    agent.path = this.toPath(result);
                    }

                }
                this.updateRepresentation();
			}
		};
		Strategy.AStar = AStar;
	})(Strategy);

	// Expose the two navigation strategies under
	// Nav.strategy.<nav_strat>
	Nav.Strategy = Strategy;
})();
