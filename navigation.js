function Node(state, parent, action) {
	this.state = state;
	this.parent = parent;
	this.action = action;
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
			successors.push(new Node(results[i][0], this, result[i][1]));
		}
		return successors;
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
			return;
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
}