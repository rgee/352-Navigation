(function(){
	// Strategies will maintain all internal state related to one agent's navigation. 
	// For example, if an agent is using A* navigation, the A* strategy object keeps
    // it's planned path. If an agent is using dynamical systems navigation, the 
	// dynamical systems object keeps track of the agent's world representation.
	var Strategy = {};


	// Create closures for each strategy to encapsulate things like local
	// classes that the strategies don't need to share 
	(function(strategyObj){
        // Extend the math object to add hyperbolic trigonometric functions 
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

        function collision(o1, o2){
            if(o1.health){
                o1.health -= .1;
                if(o1.health<0) o1.health=0;
            }
            if(o2.health){
                o2.health -= .1;
                if(o2.health<0) o2.health=0;
            }
                
        }
        
        // Dynamical systems navigation strategy object 
		function Dynamical(world){
			this.world = world;
            this.envObs = [];
            //Parameters
            this.d0 = 100;
            this.c1 = 2.0;
            this.c2 = 2.0;
            this.a = 3.0;
            this.sigma = 0.2;
            this.h1 = 20.0;
            //advantage of going towards target
            this.aTar = 0.4;
            //advantage of going to target over obstacle
            this.gTarObs = 0.005;
            this.timestep = 0.05;
		}

        
		Dynamical.prototype = {
            // Returns angle between an agent and a target
            computeAngle: function(aPos, tPos) {
                return Math.atan2(tPos.e(2) - aPos.e(2), tPos.e(1) - aPos.e(1))+Math.PI;
            },
            // Returns delta Psi, the angle between the internal tangents of 
            // two circles.
            subtendedAngle: function(agent, obs) {
                var aPos=agent.center,
                     aRad=agent.radius,
                     oPos=obs.center,
                     oRad=obs.radius;
                var bigRad=aRad+oRad;
                var d=aPos.distanceFrom(oPos);
                if (d < bigRad) {
                    d = bigRad;
                }
                var theta=2*(Math.asin(bigRad/d));
                return theta;
            },

            // Calculates attraction of a target.
            // In Juan Pablo's code, this is fTar
            calculateAttraction: function(phi, psiTar) {
                return -this.a * Math.sin(phi - psiTar);
            },

            // Distance function. Adjusts force of repeller by distance.
            // In Juan Pablo's code, this is D
            distanceFunc: function(dm) {
                return Math.exp(-1 * (dm/this.d0));
            },

            // Adjusts need to avoid obstacles
            alphaObs: function(phi, perceivedObs) {
                if (perceivedObs.length === 0) { return 0;}
                return Math.tanh(perceivedObs.map(function(ob){
                                    return this.distanceFunc(ob[2]);
                                },this).reduce(function(prev, curr){
                                    return prev + curr;
                                }));
            },

            // Windowing function. Sees if obstacle is in the way.
            // In Juan Pablo's code, this is W
            windowFunc: function(phi, psi, dPsi) {
                var phiPsi = Math.cos(phi - psi + Math.PI);
                var dPsiSigma = Math.cos(dPsi + this.sigma);
                var tan = Math.tanh(this.h1 * (phiPsi - dPsiSigma)) + 1;
                return 0.5*(tan);
            },

            // Repeller function. Gets the repelling power of an obstacle.
            // In Juan Pablo's code, this is R
            repellerFunc: function(phi, psi, dPsi) {
                return this.signum(((phi - psi)/dPsi) *
                    Math.exp(1 - Math.abs((phi - psi)/dPsi)));
            },
            
            // Returns 1 if x > 0, 0 if x == 0 and -1 if x < 0.
            // In Juan Pablo's code, this is sign.
            signum: function(x) {
                return (x > 0) ? 1 : (x === 0) ? 0 : -1;
            },

            // The complete repeller function.
            // In Juan Pablo's code, this is fObsI
            fullRepellerFunc: function(phi, obs) {
                var dist = this.distanceFunc(obs[0]),
                    win = this.windowFunc(phi, obs[1], obs[2]);
                    rep = this.repellerFunc(phi, obs[1], obs[2]);
                return dist * win * rep;
            },

            // Detects where the target is.
            // In Juan Pablo's code, this is P_tar
            targetDetector: function(phi, psiTar) {
                var dFtar_dPhi = this.a * Math.cos(phi - psiTar);
                return -1 * this.signum(dFtar_dPhi) * Math.exp(-this.c1 * 
                    Math.abs(this.calculateAttraction(phi, psiTar)));
            },

            // Detects if an obstacle is in the way.
            // In Juan Pablo's code, this is P_obs
            obsDetector: function(phi, obsList) {
                var fObs = 0;
                var dFobs_dPhi = 0;
                var w = 0;
                var Di, Wi, Ri, tmp, help, dWi, dRi, psi, dm, dPsi;
                
                // Each obstacle is an array of the form:
                //   [dm, psi, dPsi]
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
            // Sees if agent is heading towards a stable point or unstable 
            // point
            gammaObsTar: function(phi, psiTar, perceivedObs) {
                var pTar = this.targetDetector(phi, psiTar),
                    pObs = this.obsDetector(phi, perceivedObs);
                return Math.exp(-1 * this.c2 * pTar * pObs - this.c2);
            },
            
            // Defines an attractor.
            // In Juan Pablo's code, this is fTar.
            defAttractor: function(phi, psiTar) {
                return this.a * Math.sin(phi - psiTar);
            },

            // Gets the weight of a target and a repeller.
            // returns in the form [weight of targer, weight of obstacle]
            getWeights: function(phi, psiTar, w1, w2, perceivedObs) {
                var a2 = this.alphaObs(phi, perceivedObs),
                    g21 = this.gammaObsTar(phi, psiTar, perceivedObs);
                for (var i = 0; i < 100; i++) {
                    //w1 is target, w2 is obstacle
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
            
            // Get the heading that the agent should be moving in
            getPhiDot: function(agent, perceivedObs) {
                var phi = agent.heading;
                var fObs = 0;
                var psiTar = this.computeAngle(agent.position, agent.target);
                agent.weights = this.getWeights(phi, psiTar, agent.weights[0], 
                    agent.weights[1], perceivedObs); //of the form [wtar, wobs]
				if (perceivedObs.length === 0) {
					fObs = 0;
				}
				else {
					fObs = perceivedObs.map(function(elem){
						return this.fullRepellerFunc(phi, elem);
					}, this).reduce(function(prev, curr){
						return prev + curr;
					});
				}
				weightedObs = ((Math.abs(agent.weights[1]) * fObs));
				phiDot = (Math.abs(agent.weights[0]) * this.defAttractor(phi, psiTar)) + 
                    weightedObs + 0.01*(Math.random()-0.5);
                return phiDot;
            },

            // Perceive objects
			sense: function(agent) {
                var pos = agent.position,
                    agSize = agent.size,
                    tarCircle = (agent.target.hasOwnProperty("size") ? 
                                    new Circle(agent.target.position, agent.target.size) :
                                    new Circle(agent.target, 10)),
                    perceivedObs = [],
                    dm=0,
                    psi =0,
                    dPsi = 0;

                this.envObs.map(function(elem){
                    if(elem !== agent){
                        dm = pos.distanceFrom(elem.center) - elem.radius - agSize;
                        psi = this.computeAngle(pos, elem.center);
                        dPsi = this.subtendedAngle(new Circle(pos, agSize), elem);
                        psi = psi;
                        dPsi = dPsi;
                        perceivedObs.push([dm, psi, dPsi]); 
                    }
                },this);
                return perceivedObs;
            },
            // update the perception of objects
            updateRepresentation: function(agent){
                this.envObs = [];

                var obsCirc;
                this.world.agents.map(function(elem){
                    if(elem !== agent) {
                        obsCirc=new Circle(elem.position, elem.size);
                        //collision detection
                        dm = agent.position.distanceFrom(obsCirc.center) - obsCirc.radius - agent.size;
                        if(dm<0){
                            collision(agent, elem);
                            agent.heading = this.computeAngle(agent.position, obsCirc.center);
                            agent.heading = agent.heading;
                        }
                        this.envObs.push(obsCirc);
                    }
                }, this);

                this.world.obstacles.map(function(elem){
                    switch(elem.type) {
                        case "exterior":
                            switch(elem.direction){
                                case 'n':
                                    obsCirc=new Circle($V([elem.position.e(1), elem.position.e(2)-10000]), 10000);
                                    break;
                                case 's':
                                    obsCirc=new Circle($V([elem.position.e(1), elem.position.e(2)+10000]), 10000);
                                    break;
                                case 'e':
                                    obsCirc=new Circle($V([elem.position.e(1)+10000, elem.position.e(2)]), 10000);
                                    break;
                                case 'w':
                                    obsCirc=new Circle($V([elem.position.e(1)-10000, elem.position.e(2)]), 10000);
                                    break;
                            }
                            break;
                        case "block":
                            obsCirc=new Circle(elem.position, elem.size);
                            break;
                        case "fire":
                            obsCirc=new Circle(elem.position, elem.size);
                            break;
                    }
                    dm = agent.position.distanceFrom(obsCirc.center) - obsCirc.radius - agent.size;
                    if(dm<0){
                        collision(agent, elem);
                        agent.heading = (agent.heading+Math.PI);
                        while(agent.heading>Math.PI){ agent.heading -= 2*Math.PI}
                        while(agent.heading<-Math.PI){ agent.heading += 2*Math.PI}
                    }
                    this.envObs.push(obsCirc);
                }, this);
            },

            // Execute dynamical systems and move forward one timestep
            execute: function(agent){
				// Currently updates both the position and heading because the position 
                // is dependent on the old heading
                if (agent.target !== null) {
                    this.updateRepresentation(agent);
                    var perceivedObs = this.sense(agent),
                        pd = this.getPhiDot(agent, perceivedObs),
                        vel = agent.velocity,
                        oldHeading = agent.heading,
                        xd = vel.e(1) * agent.health * Math.cos(agent.heading),
                        yd = vel.e(2) * agent.health * Math.sin(agent.heading);
                    var newX = agent.position.e(1) + this.timestep * xd,
                        newY = agent.position.e(2) + this.timestep * yd,
                        newHeading = oldHeading + this.timestep * pd;

                    agent.heading = newHeading;
                    agent.position = $V([newX, newY]);
                    if(agent.position.distanceFrom(agent.target) <= (agent.size+5)){
                        agent.target = null;
                    }
                }
			}
		};
		Strategy.Dynamical = Dynamical;
	})(Strategy);



	(function(strategyObj){
        // Helper function for creating a 2-D Array (Grid)
        function Grid(rows, cols){
            for(var x = 0; x < rows; ++x){
                this[x] = [];
                for(var y = 0; y < cols; ++y){
                    this[x].push(0);
                }
            }
        }
        // The 2-Dimensional grid representing the world's occupancy data. A 0 is stored
        // at position (i, j) if there is no obstacle at cell (i, j) and a 1 otherwise. 
        function WorldGrid(cellSize, xMax, yMax) {
            this.xMax = xMax;
            this.cellSize = cellSize;
            this.yMax = yMax;
            this.nRows = yMax / cellSize;
            this.nCols = xMax / cellSize;
            this.data = new Grid(this.nCols,this.nRows);
        }

        WorldGrid.prototype = {
            // Add an object at position pos.
            addObject: function(pos) {
                var gridSpace = this.toGridSpace(pos);

                this.data[gridSpace.e(1)][gridSpace.e(2)] = 1;
            },
            // This function deals with objects overlapping grid boundaries
            addObstacle: function(obs){
                var gridSpacePos = this.toGridSpace(obs.position);
                this.data[gridSpacePos.e(1)][gridSpacePos.e(2)] = 1;
                switch(obs.type){
                    case 'block':
                        var eastEdgeExtent, westEdgeExtent, northEdgeExtent, southEdgeExtent;
                        
                        // Check if the east edge of this block is in another grid square.
                        eastEdgeExtent = this.toGridSpace($V([obs.position.e(1) + obs.size, obs.position.e(2)]));
                        if(eastEdgeExtent.e(1) > gridSpacePos.e(1) &&
                           this.isInWorld(eastEdgeExtent.e(1), eastEdgeExtent.e(2))){
                            this.data[eastEdgeExtent.e(1)][eastEdgeExtent.e(2)] = 1;    
                        }
                        
                        // Check if the west edge of this block is in another grid square.
                        westEdgeExtent = this.toGridSpace($V([obs.position.e(1) - obs.size, obs.position.e(2)]));
                        if(westEdgeExtent.e(1) < gridSpacePos.e(1) &&
                           this.isInWorld(westEdgeExtent.e(1), westEdgeExtent.e(1))){
                            this.data[westEdgeExtent.e(1)][westEdgeExtent.e(2)] = 1;       
                        }
                        
                        break;
                    case 'exterior':
                        switch(obs.direction){
                            case 'n':
                                this.spreadFill(obs, 'h');
                                break;
                            case 's':
                                this.spreadFill(obs, 'h');
                                break;
                            case 'e':
                                this.spreadFill(obs, 'v');
                                break;
                            case 'w':
                                this.spreadFill(obs, 'v');
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'fire':
                        // Approximate a circle on the grid by using the circumscribing square.
                        var topLeft = $V([obs.position.e(1) - obs.size/2, obs.position.e(2) - obs.size/2]),
                            bottomRight = $V([obs.position.e(1) + obs.size/2, obs.position.e(2) + obs.size/2]),
                            gridSpace;
                            
                            for(var i = topLeft.e(1); i < topLeft.e(1) + obs.size; i += this.cellSize){
                                if(this.isInWorldWS(i, topLeft.e(2))){
                                    gridSpace = this.toGridSpace($V([i, topLeft.e(2)]));
                                    this.data[gridSpace.e(1)][gridSpace.e(2)] = 1;
                                }
                            }
                            for(i = topLeft.e(2); i < topLeft.e(2) + obs.size; i += this.cellSize){
                                if(this.isInWorldWS(i,topLeft.e(1))){
                                    gridSpace = this.toGridSpace($V([topLeft.e(1), i]));
                                    this.data[gridSpace.e(1)][gridSpace.e(2)] = 1;    
                                }
                            }
                            for(var j = bottomRight.e(1); j > bottomRight.e(1) - obs.size; j -= this.cellSize){
                                if(this.isInWorldWS(j, bottomRight.e(2))){
                                    gridSpace = this.toGridSpace($V([j, bottomRight.e(2)]));
                                    this.data[gridSpace.e(1)][gridSpace.e(2)] = 1;
                                }
                            }
                            for(j = bottomRight.e(2); j > bottomRight.e(2) - obs.size; j -= this.cellSize){
                                if(this.isInWorldWS(bottomRight.e(1), j)){
                                    gridSpace = this.toGridSpace($V([bottomRight.e(1), j]));
                                    this.data[gridSpace.e(1)][gridSpace.e(2)] = 1;    
                                }
                            }
                        break;
                    default:
                        break;
                }
            },
            // Fills in a strip of space on the occupancy grid, given an exterior wall object.
            spreadFill: function(ob, orientation){
                var center = ob.position,
                    len = ob.size+10,
                    gridCenter = this.toGridSpace(ob.position);
                if(orientation === 'h'){
                    // The number of grid squares to the left & right this object extends from its
                    // center.
                    var gridLeftX = this.toGridSpace($V([center.e(1) - len/2, center.e(2)])).e(1),
                        gridRightX = this.toGridSpace($V([center.e(1) + len/2, center.e(2)])).e(1);
                    
                    for(var x = gridCenter.e(1); x < gridRightX; x++){
                        this.data[x][gridCenter.e(2)] = 1;
                    }
                    for(x = gridCenter.e(1); x > gridLeftX; x--){
                        this.data[x][gridCenter.e(2)] = 1;   
                    }

                }else if(orientation === 'v'){
                    // The number of grid squares to the top and bottom this object extends from its
                    // center.
                    var gridTopY = this.toGridSpace($V([center.e(1), center.e(2) - len/2])).e(2),
                        gridBottomY = this.toGridSpace($V([center.e(1), center.e(2) + len/2])).e(2);
                    
                    for(var y = gridCenter.e(2); y < gridBottomY; y++){
                        this.data[gridCenter.e(1)][y] = 1;    
                    }
                    for(y = gridCenter.e(2); y > gridTopY; y--){
                        this.data[gridCenter.e(1)][y] = 1;    
                    }
                }
            },
            clear: function(){
                this.data = new Grid(this.nCols, this.nRows);    
            },
            // Remove an object at position pos.
            removeObject: function(pos) {
                var row = Math.floor((this.nRows * (pos.e(2) / this.yMax))),
                    col = Math.floor((this.nCols * (pos.e(1) / this.xMax)));
                this.data[row][col] = 0;
            },
            
            // Takes a row and a column and returns true if the cell at that position
            //is on the world grid and false otherwise.
            isInWorld: function(col, row) {
                return (row >= 0 && row < this.nRows) && (col >= 0 && col < this.nCols);
            },
            isInWorldWS: function(x, y) {
                return (x >= 0 && x < this.xMax) && (y >= 0 && y < this.yMax);
            },
            
            // Takes a row and column and returns an array of valid (row,col) pairs
            // if they are on the world grid.
            adjacentCells: function(col, row) {
                // A cell and it's neighbors:
                //  *********
                //  * 0|1|2 *
                //  * 3|4|5 *
                //  * 6|7|8 *
                //  *********
                var results = [[col-1, row-1], // 0
                               [col-1, row+1], // 6
                               [col+1, row-1], // 2
                               [col+1, row+1], // 8
                               [col+1, row], // 5
                               [col-1, row], // 3
                               [col, row+1], // 7
                               [col, row-1]]; // 1
                var final =  results.filter(function(elem){
                    return this.isInWorld(elem[0],elem[1]); 
                }, this);
                return final;
            },
            // Gets the adjacent cells that are open.
            adjacentOpenCells: function(col,row){
                return this.adjacentCells(col,row).filter(function(elem){
                    return this.data[elem[0]][elem[1]] === 0;
                }, this);
            },
            // Converts a vector from grid space to world space. By the nature of this transformation, some information is lost so we
            // translate to the center of a grid square in world space.
            toWorldSpace: function(pos){
                var cellSize = (this.xMax / this.nCols);
                return Vector.create( [(pos.e(1) * cellSize) + cellSize/2, (pos.e(2) * cellSize) + cellSize/2] );  
            },
            pairToWorld: function(col, row){
                return Vector.create( [(col * this.cellSize) + this.cellSize / 2, (row * this.cellSize) + this.cellSize/2] );
            },
            toGridSpace: function(pos){
                return Vector.create( [Math.floor(((this.nCols) * (pos.e(1) / this.xMax))),
                                       Math.floor(((this.nRows) * (pos.e(2) / this.yMax)))] );
            }
        };

		// A node in the search tree. Stores heuristic data as well as parent info.
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

		// States in the world represented by a 2d Grid.
		function GridNavState(col, row, grid) {
			this.col = col;
			this.row = row;
			this.grid = grid;
		}

		GridNavState.prototype = {
			// Returns an array of states if they represent cells that are are adjacent to the current
			// cell and not obstructed. 
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

		 // Perform heuristic search.
		function heuristicSearch(initialState, goalState, fringe, heuristic){
			var maxExpansions = 10000,
			    nodesExpanded = 0,
			    start = new Node(initialState),
				closedStates = new HashSet(function(u){return $V([u.row, u.col]);}, function(u,v){return u.equals(v);}),
			    current,
			    new_nodes;
			fringe.push(start);

			while(!fringe.isEmpty()){
				current = fringe.pop();
				if(current.state.equals(goalState)){
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
						return null;
					}
				}
			}
			return null;
		}

		 // Euclidean distance heuristic for A*
		function straightLineDist(currState, goalState){
            return Math.sqrt((Math.pow(currState.row - goalState.row,2) + Math.pow(currState.col - goalState.col,2)));
		}

		// A* navigation strategy object 
		function AStar(world){
            this.world = world;
            
            // Create the world grid here
            this.grid = new WorldGrid(10,800,600);
            this.updateRepresentation();
            
            // Map from agent ids to path arrays.
            // Needed so we can verify the validity of paths against the /grid/, 
            // which agents themselves have nor should have access to. Now when an agent
            // calls execute, the A* module will first check if that agent's path is valid
            // then if it is, return the node the agent should be heading to currently. If not
            // it will recompute the path and store it here.
            this.pathHash = {};
		}
		AStar.prototype = {
             // Convert from a node chain to an actual path.
             // Input: A node that is the final node in a search path.
             // Output: An array of vectors representing the path in grid space.
            toPath: function(node, agent){

                var results = [$V([node.state.col, node.state.row])];
                while((node = node.parent)){
                    results.push($V([node.state.col, node.state.row]));
                }
                results =  results.reverse().map(function(elem){
                    return this.grid.toWorldSpace(elem);
                }, this);
                results.shift();
                return results;
            },
			// Generate the navigation path for the agent to follow
			plan: function(){
				
			},
            updateRepresentation: function(){
                this.grid.clear();
                
                this.world.agents.map(function(elem){
                    this.grid.addObject(elem.position);
                }, this);
                this.world.obstacles.map(function(elem){
                    
                    this.grid.addObstacle(elem);
                },this);
                
                
            },
            pathInvalid: function(path, agent){
                if(!path){
                    return true;    
                }
 
                // We only care about obstructions along the first maxDistance nodes of the path
                // since looking only so far ahead means there's a higher chance a further obstruction
                // will be the fault of a dynamic object, so it will have moved away by the time we reach
                // it.
                var maxDistance = 2,
                    agentCell = this.grid.toGridSpace(agent.position),
                    node;
                    
                maxDistance = (path.length < maxDistance ? path.length : maxDistance);
                for(var i = 0; i < maxDistance; i++){
                    node = this.grid.toGridSpace(path[i]);
                    if(this.grid.data[node.e(1)][node.e(2)] === 1 &&
                       !node.eql(agentCell)){
                        return true;    
                    }
                }
                return false;
            },
            // Returns the next intermediate target an agent needs to reach its goal.
            getNextTarget: function(agent){
                var gridPos = this.grid.toGridSpace(agent.position),
                    path = this.pathHash[agent.id].path,
                    currentTarget = agent.interTarget;
                if(agent.interTarget){
                    var currentTargetGrid = this.grid.toGridSpace(currentTarget);
                    if(agent.position.distanceFrom(currentTarget) <= 1.0){
                        if(path.length === 0){
                            agent.interTarget = null;
                            agent.target = null;
                            this.pathHash[agent.id] = null;
                        } else {
                            agent.interTarget = path.shift();
                            while(gridPos.eql(agent.interTarget)){
                                agent.interTarget = path.shift();   
                            }
                        }
                    }
                } else {
                    agent.interTarget = (path.length === 0 ? null : path.shift());
                }
            },
			execute: function(agent){
                this.updateRepresentation();
                if(agent.target !== null){
                    if( this.pathHash[agent.id] &&
                        !this.pathInvalid(this.pathHash[agent.id].path, agent) &&
                        this.pathHash[agent.id].goal.eql(agent.target)){
                        this.getNextTarget(agent);
                    } else {
            			var gridSpacePos = this.grid.toGridSpace(agent.position),
            			    gridSpaceTar = this.grid.toGridSpace(agent.target),
            			    initial = new GridNavState(gridSpacePos.e(1), gridSpacePos.e(2), this.grid),
            			    goal = new GridNavState(gridSpaceTar.e(1), gridSpaceTar.e(2), this.grid),
            			    fringe = new BinHeap(function(node){ return (node.h + node.g); }),
            			    heuristic = straightLineDist,
            			    result = heuristicSearch(initial, goal, fringe, heuristic);
                        if(result !== null){
                            this.pathHash[agent.id] = {
                                                       path:this.toPath(result, agent),
                                                       goal:agent.target
                                                      };
            			    agent.path = this.pathHash[agent.id].path;
                        }
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
