function BinHeap(scoreFunc){
	this.data = [];
	this.scorer = scoreFunc;
}

BinHeap.prototype = {
	push: function(element) {
		this.data.push(element);
		this.bubbleUp(this.data.length - 1)
	},
	
	isEmpty: function() {
		return (this.data.length === 0);
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
	remove: function(node){
		var len = this.data.length;
		for(var i = 0; i < len; i++){
			if(this.data[i] === node){
				var end = this.data.pop();
				if(i != len - 1){
					this.data[i] = end;
					if(this.scorer(end) < this.scorer(node)){
						this.bubbleUp(i);
					} else {
						this.bubbleDown(i);
					}
				}
				return;
			}
		}
	},
	
	bubbleUp: function(idx) {
		var elem = this.data[idx];
		var parentIndex = 0;
		var parent = null;
		
		while(idx > 0) {

			parentIndex = Math.floor((idx + 1) / 2) - 1;
			parent = this.data[parentIndex];

			if(this.scorer(elem) < this.scorer(parent)) {
				this.data[parentIndex] = elem;
				this.data[idx] = parent;
				idx = parentIndex;
			} else {


				break;
			}
		}
	},
	
	bubbleDown: function(idx) {
		var length = this.data.length,
			element = this.data[idx],
			elemScore = this.scorer(element),
			child2N = 0,
			child1N = 0,
			swap = null,
			child2 = 0;
		while(true){
			child2N = (idx + 1)*2,
			child1N = child2N - 1,
			swap = null;

			if(child1N < length){
				var child1 = this.data[child1N],
					child1Score = this.scorer(child1);
				if(child1Score < elemScore){
					swap = child1N;
				}
			}
			if(child2N < length){
				var child2 = this.data[child2N],
					child2Score = this.scorer(child2);
				if(child2Score < (swap == null ? elemScore : child1Score)){
					swap = child2N
				}
			}
			if(swap != null){
				this.data[idx] = this.data[swap];
				this.data[swap] = element;
				idx = swap;
			} else {
				break;
			}
		}


		// var left = 2 * idx;
		// var right = (2 * idx) + 1;
		// var largest = idx;
		// var length = this.data.length;
		// var temp = null;
		
		// if(left <= length && this.scorer(this.data[left]) > this.scorer(this.data[idx])) {
		// 	largest = left;
		// }
		
		// if(right <= length && this.scorer(this.data[right]) > this.scorer(this.data[largest])) {
		// 	largest = right;
		// }
		
		// if(largest !== idx) {
		// 	temp = this.data[idx];
		// 	this.data[idx] = this.data[largest];
		// 	this.data[largest] = temp;
		// 	this.bubbleDown(largest);
		// }
	}
};
