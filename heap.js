function BinHeap(scoreFunc){
	this.data = [];
	this.scorer = scoreFunc;
}

BinHeap.prototype = {
	push: function(element) {
		this.data.push(element);
		this.bubbleUp(this.data.length - 1)
	},
	
	pop: function() {
		var result = this.data[0];
		var end = this.data.pop();
		
		if(this.data.length > 0) {
			this.data[0] = end;
			this.bubbleDown(0);
		}
		return result;
	},
	
	bubbleUp: function(idx) {
		var elem = this.data[idx];
		var parentIndex = 0;
		var parent = null;
		
		while(idx > 0) {
			parentIndex = Math.floor((idx - 1) / 2);
			parent = this.data[parentIndex];
			
			if(this.scorer(parent) < this.scorer(elem)) {
				this.data[parentIndex] = elem;
				this.data[idx] = parent;
				idx = parentIndex;
			} else {
				break;
			}
		}
	},
	
	bubbleDown: function(idx) {
		var left = 2 * idx;
		var right = (2 * idx) + 1;
		var largest = idx;
		var length = this.data.length;
		var temp = null;
		
		if(left <= length && this.scorer(this.data[left]) > this.scorer(this.data[idx])) {
			largest = left;
		}
		
		if(right <= length && this.scorer(this.data[right]) > this.scorer(this.data[largest])) {
			largest = right;
		}
		
		if(largest !== idx) {
			temp = this.data[idx];
			this.data[idx] = this.data[largest];
			this.data[largest] = temp;
			this.bubbleDown(largest);
		}
	}
};
