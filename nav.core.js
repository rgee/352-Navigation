(function(global) {
	function Nav(){
		
	}

	// Expose our module to the global scope
	if(global.Nav){
		throw new Error("Nav object already defined");
	} else {
		global.Nav = Nav;
	}

})(window)