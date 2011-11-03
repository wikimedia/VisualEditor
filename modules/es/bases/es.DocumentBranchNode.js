/**
 * Creates an es.DocumentBranchNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @param {es.DocumentNode[]} nodes List of document nodes to initially add
 */
es.DocumentBranchNode = function( nodes ) {
	this.children = es.isArray( nodes ) ? nodes : [];
};

/* Methods */

/**
 * Gets a list of child nodes.
 * 
 * @abstract
 * @method
 * @returns {es.DocumentNode[]} List of document nodes
 */
es.DocumentBranchNode.prototype.getChildren = function() {
	return this.children;
};

/**
 * Gets the range within this node that a given child node covers.
 * 
 * @method
 * @param {es.ModelNode} node Node to get range for
 * @param {Boolean} [shallow] Do not iterate into child nodes of child nodes
 * @returns {es.Range|null} Range of node or null if node was not found
 */
es.DocumentBranchNode.prototype.getRangeFromNode = function( node, shallow ) {
	if ( this.children.length ) {
		var isBranch;
		for ( var i = 0, length = this.children.length, left = 0; i < length; i++ ) {
			if ( this.children[i] === node ) {
				return new es.Range( left, left + this.children[i].getElementLength() );
			}
			isBranch = typeof this.children[i].getChildren === 'function';
			if ( !shallow && isBranch && this.children[i].getChildren().length ) {
				var range = this.children[i].getRangeFromNode( node );
				if ( range !== null ) {
					// Include opening of parent
					left++;
					return es.Range.newFromTranslatedRange( range, left );
				}
			}
			left += this.children[i].getElementLength();
		}
	}
	return null;
};

/**
 * Gets the content offset of a node.
 * 
 * This method is pretty expensive. If you need to get different slices of the same content, get
 * the content first, then slice it up locally.
 * 
 * TODO: Rewrite this method to not use recursion, because the function call overhead is expensive
 * 
 * @method
 * @param {es.DocumentNode} node Node to get offset of
 * @param {Boolean} [shallow] Do not iterate into child nodes of child nodes
 * @returns {Integer} Offset of node or -1 of node was not found
 */
es.DocumentBranchNode.prototype.getOffsetFromNode = function( node, shallow ) {
	if ( this.children.length ) {
		var offset = 0,
			isBranch;
		for ( var i = 0, length = this.children.length; i < length; i++ ) {
			if ( this.children[i] === node ) {
				return offset;
			}
			isBranch = typeof this.children[i].getChildren === 'function';
			if ( !shallow && isBranch && this.children[i].getChildren().length ) {
				var childOffset = this.getOffsetFromNode.call( this.children[i], node );
				if ( childOffset !== -1 ) {
					return offset + 1 + childOffset;
				}
			}
			offset += this.children[i].getElementLength();
		}
	}
	return -1;
};

/**
 * Gets the node at a given offset.
 * 
 * This method is pretty expensive. If you need to get different slices of the same content, get
 * the content first, then slice it up locally.
 * 
 * TODO: Rewrite this method to not use recursion, because the function call overhead is expensive
 * 
 * @method
 * @param {Integer} offset Offset get node for
 * @param {Boolean} [shallow] Do not iterate into child nodes of child nodes
 * @returns {es.DocumentNode|null} Node at offset, or null if non was found
 */
es.DocumentBranchNode.prototype.getNodeFromOffset = function( offset, shallow ) {
	if ( this.children.length ) {
		var nodeOffset = 0,
			nodeLength,
			isBranch;
		for ( var i = 0, length = this.children.length; i < length; i++ ) {
			nodeLength = this.children[i].getElementLength();
			if ( offset >= nodeOffset && offset < nodeOffset + nodeLength ) {
				isBranch = typeof this.children[i].getChildren === 'function';
				if ( !shallow && isBranch && this.children[i].getChildren().length ) {
					return this.getNodeFromOffset.call( this.children[i], offset - nodeOffset - 1 );
				} else {
					return this.children[i];
				}
			}
			nodeOffset += nodeLength;
		}
	}
	return null;
};

/**
 * Gets a list of nodes and their sub-ranges which are covered by a given range.
 * 
 * @method
 * @param {es.Range} range Range to select nodes within
 * @param {Boolean} [shallow] Do not recurse into child nodes of child nodes
 * @returns {Array} List of objects with 'node' and 'range' properties describing nodes which are
 * covered by the range and the range within the node that is covered
 */
es.DocumentBranchNode.prototype.selectNodes = function( range, shallow ) {
	if ( typeof range === 'undefined' ) {
		range = new es.Range( 0, this.model.getContentLength() );
	} else {
		range.normalize();
	}
	var nodes = [],
		i,
		left,
		right,
		start = range.start,
		end = range.end,
		startInside,
		endInside;
	
	if ( start < 0 ) {
		throw 'The start offset of the range is negative';
	}
	
	if ( this.children.length === 0 ) {
		// Special case: this node doesn't have any children
		// The return value is simply the range itself, if it is not out of bounds
		if ( end > this.getContentLength() ) {
			throw 'The end offset of the range is past the end of the node';
		}
		return [{ 'node': this, 'range': new es.Range( start, end ) }];
	}
	
	// This node has children, loop over them
	left = 1; // First offset inside the first child. Offset 0 is before the first child
	for ( i = 0; i < this.children.length; i++ ) {
		// left <= any offset inside this.children[i] <= right
		right = left + this.children[i].getContentLength();
		
		if ( start == end && ( start == left - 1 || start == right + 1 ) ) {
			// Empty range outside of any node
			return [];
		}
		if ( start == left - 1 && end == right + 1 ) {
			// The range covers the entire node, including its opening and closing elements
			return [ { 'node': this.children[i] } ];
		}
		if ( start == left - 1 ) {
			// start is between this.children[i-1] and this.children[i], move it to left for
			// convenience
			// We don't need to check for start < end here because we already have start != end and
			// start <= end
			start = left;
		}
		if ( end == right + 1 ) {
			// end is between this.children[i] and this.children[i+1], move it to right for
			// convenience
			// We don't need to check for start < end here because we already have start != end and
			// start <= end
			end = right;
		}
		
		startInside = start >= left && start <= right; // is the start inside this.children[i]?
		endInside = end >= left && end <= right; // is the end inside this.children[i]?
		
		if ( startInside && endInside ) {
			// The range is entirely inside this.children[i]
			if ( shallow ) {
				nodes = [
					{ 'node': this.children[i], 'range': new es.Range( start - left, end - left ) }
				];
			} else {
				// Recurse into this.children[i]
				nodes = this.children[i].selectNodes( new es.Range( start - left, end - left ) );
			}
			// Since the start and end are both inside this.children[i], we know for sure that we're
			// done, so return
			return nodes;
		} else if ( startInside ) {
			// The start is inside this.children[i] but the end isn't
			// Add a range from the start of the range to the end of this.children[i]
			nodes.push(
				{ 'node': this.children[i], 'range': new es.Range( start - left, right - left ) }
			);
		} else if ( endInside ) {
			// The end is inside this.children[i] but the start isn't
			// Add a range from the start of this.children[i] to the end of the range
			nodes.push( { 'node': this.children[i], 'range': new es.Range( 0, end - left ) } );
			// We've found the end, so we're done
			return nodes;
		} else if ( nodes.length > 0 ) {
			// Neither the start nor the end is inside this.children[i], but nodes is non-empty,
			// so this.children[i] must be between the start and the end
			// Add the entire node, so no range property
			nodes.push( { 'node': this.children[i] } );
		}
		
		// Move left to the start of this.children[i+1] for the next iteration
		// We use +2 because we need to jump over the offset between this.children[i] and
		// this.children[i+1]
		left = right + 2;
	}
	
	// If we got here, that means that at least some part of the range is out of bounds
	// This is an error
	if ( nodes.length === 0 ) {
		throw 'The start offset of the range is past the end of the node';
	} else {
		// Apparently the start was inside this node, but the end wasn't
		throw 'The end offset of the range is past the end of the node';
	}
	return nodes;
};
