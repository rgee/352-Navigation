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


        function Circle(pos, rad){
            this.center = pos;
            this.radius = rad;
        }
        
        /* Dynamical systems navigation strategy object */
		function Dynamical(world){
			this.world = world;
            this.envObs = [];
            //Parameters
            this.d0 = 1.0;
            this.c1 = 2.0;
            this.c2 = 2.0;
            this.a = 1.0;
            this.sigma = 0.2;
            this.h1 = 20.0;
            //advantage of going towards target
            this.aTar = 0.4;
            //advantage of going to target over obstacle
            this.gTarObs = 0.05;
            this.timestep = 0.05;
		}
        
        
		Dynamical.prototype = {
            /* Returns angle between an agent and a target*/
            computeAngle: function(aPos, tPos) {
                return Math.atan2(tPos.e(2) - aPos.e(2), tPos.e(1) - aPos.e(1)) - Math.PI;
            },
            /* Returns delta Psi, the angle between the internal tangents of 
             * two circles.
             */
            subtendedAngle: function(agent, obs) {
                var aPos=agent.center,
                     aRad=agent.radius,
                     oPos=obs.center,
                     oRad=obs.radius;
                var bigRad=aRad+oRad;
                var d=aPos.distanceFrom(oPos);
                var theta=2*(Math.asin(bigRad/d));
                return theta;
            },

            /* Calculates attraction of a target.
             * In Juan Pablo's code, this is fTar
             */
            calculateAttraction: function(phi, psiTar) {
                //console.log("phi\t" + phi + "\tpsiTar\t" + psiTar + "\tMath.sin(phi - psiTar)\t" + Math.sin(phi - psiTar));
                return -this.a * Math.sin(phi - psiTar);
            },
            
            /* Distance function. Adjusts force of repeller by distance.
             * In Juan Pablo's code, this is D
             */
            distanceFunc: function(dm) {
                return Math.exp(-1 * (dm/this.d0));
            },

            /* Adjusts need to avoid obstacles */
            alphaObs: function(phi, perceivedObs) {
				if (perceivedObs.length === 0) { return 0;}
                return Math.tanh(perceivedObs.map(function(ob){
                                    return this.distanceFunc(ob[2]);
                                },this).reduce(function(prev, curr){
                                    return prev + curr;
                                }));
            },

            /* Windowing function. Sees if obstacle is in the way.
             * In Juan Pablo's code, this is W
             */
            windowFunc: function(phi, psi, dPsi) {
                return 0.5*(Math.tanh(this.h1*(Math.cos(phi - psi) - 
                    Math.cos(dPsi + this.sigma))) + 1)
            },

            /* Repeller function. Gets the repelling power of an obstacle.
             * In Juan Pablo's code, this is R
             */
            repellerFunc: function(phi, psi, dPsi) {
                return ((phi - psi)/dPsi) *
                Math.exp(1 - Math.abs((phi - psi)/dPsi));
            },
            
            /* Returns 1 if x > 0, 0 if x == 0 and -1 if x < 0.
             * In Juan Pablo's code, this is sign.
             */
            signum: function(x) {
                return (x > 0) ? 1 : (x == 0) ? 0 : -1;
            },

            /* The complete repeller function.
             * In Juan Pablo's code, this is fObsI
             */
            fullRepellerFunc: function(phi, obs) {
                var dist = this.distanceFunc(obs[0]),
                    win = this.windowFunc(phi, obs[1], obs[2]),
                    rep = this.repellerFunc(phi, obs[1], obs[2]);
                return dist * win * rep;
            },

            /* Detects where the target is.
             * In Juan Pablo's code, this is P_tar
             */
            targetDetector: function(phi, psiTar) {
                var dFtar_dPhi = this.a * Math.cos(phi - psiTar);
                /*console.log(this.signum(dFtar_dPhi) + "\t" + -1 * this.signum(dFtar_dPhi) * Math.exp(-this.c1 * 
                    Math.abs(this.calculateAttraction(phi, psiTar))) + "\t" + this.calculateAttraction(phi, psiTar));*/
                return -1 * this.signum(dFtar_dPhi) * Math.exp(-this.c1 * 
                    Math.abs(this.calculateAttraction(phi, psiTar)));
            },

            /* Detects if an obstacle is in the way.
             * In Juan Pablo's code, this is P_obs
             */
            obsDetector: function(phi, obsList) {
                /* RABBIT HOLE BEGINS HERE. RETURNS NaN */
                var fObs = 0;
                var dFobs_dPhi = 0;
                var w = 0;
                var Di, Wi, Ri, fObs, tmp, help, dWi, dRi, dFobs_dPhi, psi, dm, dPsi
                
                /* Each obstacle is an array of the form:
                    [dm, psi, dPsi]
                 */
                obsList.map(function(ob){
                    dm = ob[0];
                    psi = ob[1];
                    dPsi = ob[2];

                    Di = this.distanceFunc(dm);
                    Wi = this.windowFunc(phi, psi, dPsi);
                    Ri = this.repellerFunc(phi, psi, dPsi);

                    fObs = fObs + (Di * Wi * Ri);
                    tmp = (1.0/Math.cosh(this.h1 * (Math.cos(phi - psi) - Math.cos(dPsi + this.sigma))));
                    help = (phi - psi)/dPsi;
                    dWi = (-0.5 * this.h1 * tmp * tmp * Math.sin(phi - psi));
                    dRi = (((dPsi - Math.abs(phi - psi)) * Math.exp(1-Math.abs(help))) / (dPsi * dPsi));

                    dFobs_dPhi += (Di * (Wi * dRi + dWi * Ri));
                    w += Wi;
                }, this);
                

                return this.signum(dFobs_dPhi) * Math.exp(-this.c1 * Math.abs(fObs)) * w;
                
            },
            /* Sees if agent is heading towards a stable point or unstable 
             * point
             */
            gammaObsTar: function(phi, psiTar, obsList) {
                var pTar = this.targetDetector(phi, psiTar),
                    pObs = this.obsDetector(phi, obsList);
				//console.log("pTar\t" + pTar + "\tObs\t" + pObs + "\t" + Math.exp(-1 * this.c2 * pTar * pObs - this.c2));
                return Math.exp(-1 * this.c2 * pTar * pObs - this.c2);
            },
            
            /* Defines an attractor.
             * In Juan Pablo's code, this is fTar.
             */
            defAttractor: function(phi, psiTar) {
                return this.a * Math.sin(phi - psiTar);
            },

            /* Gets the weight of a target and a repeller*/
            getWeights: function(phi, psiTar, w1, w2, perceivedObs) {
                var a2 = this.alphaObs(phi, perceivedObs),
                    g21 = this.gammaObsTar(phi, psiTar, perceivedObs);
                for (var i = 0; i < 100; i++) {
                    var w1dot = (this.aTar * w1 * (1 - w1 * w1) - g21 * w2 * w2 * w1 + 0.01 * (Math.random() - 0.5));
                    var w2dot = (a2 * w2 * (1 - w2 * w2) - this.gTarObs * w1 * w1 * w2 + 0.01 * (Math.random() - 0.5));
                    w1 += w1dot * this.timestep;
                    w2 += w2dot * this.timestep;
                }
                if (!(w1 < 1 && w1 > -1)) {
                    w1 = 0.99;
                }
                if (!(w2 < 1 && w2 > -1)) {
                    w2 = 0.99;
                }
                return [w1, w2];
            },
            
            /* Get the heading that the agent should be moving in */
            getPhiDot: function(agent, perceivedObs) {
                var phi = agent.heading;
                var psiTar = this.computeAngle(agent.position, agent.target);
                agent.weights = this.getWeights(phi, psiTar, agent.weights[0], 
                    agent.weights[1], perceivedObs); //of the form [wtar, wobs]

				if (perceivedObs.length === 0) {
					fObs = 0;
				}
				else {
					var fObs = perceivedObs.map(function(elem){
						return this.fullRepellerFunc(phi, elem);
					}, this).reduce(function(prev, curr){
						return prev + curr;
					});
				}
                return (Math.abs(agent.weights[0]) * this.defAttractor(phi, psiTar)) + 
                    (Math.abs(agent.weights[1]) * fObs) + 0.01*(Math.random()-0.5);
            },
            /* Perceive objects */
			sense: function(agent) {
                var pos = agent.position,
                    agSize = agent.size,
                    tarCircle = (agent.target.hasOwnProperty("size") ? 
                                    new Circle(agent.target.position, agent.target.size) :
                                    new Circle(agent.target, 10)),
                    perceivedObs = [],
                    dm = psi = dPsi = 0;

                this.envObs.map(function(elem){
                    if(elem !== agent){
                        dm = pos.distanceFrom(elem.center) - elem.radius - agSize;
                        psi = this.computeAngle(pos, elem.center);
                        dPsi = this.subtendedAngle(new Circle(pos, agSize), elem);
                        perceivedObs.push([dm, psi, dPsi]); 
                    }
                },this);
                return perceivedObs;
            },
            /* update the perception of objects*/
            updateRepresentation: function(agent){
                this.envObs = [];

                this.world.agents.map(function(elem){
                    if(elem !== agent) {
                        this.envObs.push(new Circle(elem.position, elem.size));
                    }
                }, this);

                this.world.obstacles.map(function(elem){
                    if(elem.type !== "wall") {
                        this.envObs.push(new Circle(elem.position, elem.size));
                    } else {
                        // We're looking at a wall so TODO: Convert a wall to a bunch of circles.
                    }
                }, this);
            },

            /* Execute dynamical systems and move forward one timestep
             */
            execute: function(agent){
				/* Currently updates both the position and heading because the position 
                 * is dependent on the old heading*/
                if (agent.target !== null) {
                    this.updateRepresentation(agent);
                    var perceivedObs = this.sense(agent),
                        pd = this.getPhiDot(agent, perceivedObs),
                        vel = agent.velocity,
                        oldHeading = agent.heading,
                        xd = 50 *Math.cos(agent.heading),
                        yd = 50 * Math.sin(agent.heading);
                    var newX = agent.position.e(1) + this.timestep * xd,
                        newY = agent.position.e(2) + this.timestep * yd,
                        newHeading = oldHeading + this.timestep * pd;

                    agent.heading = newHeading;
                    agent.position = $V([newX, newY]);
                    if (agent.position.e(1) >= agent.target.e(1) - 10 && 
                        agent.position.e(1) < agent.target.e(1) + 10 &&
                        agent.position.e(2) >= agent.target.e(2) - 10 &&
                        agent.position.e(2) < agent.target.e(2) + 10) {
                        agent.target = null;
                    }
                }
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
                    this.grid.addObject(elem.position); //the position was added as a hack
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
