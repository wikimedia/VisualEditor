/**
 * Creates an es.DocumentNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {es.EventEmitter}
 */
es.DocumentNode = function() {
	// Inheritance
	es.EventEmitter.call( this );

	// Reusable function for passing update events upstream
	var _this = this;
	this.emitUpdate = function() {
		_this.emit( 'update' );
	};
};

/* Methods */

/**
 * Gets the content length.
 * 
 * @method
 * @abstract
 * @returns {Integer} Length of content
 */
es.DocumentNode.prototype.getContentLength = function() {
	throw 'DocumentNode.getContentLength not implemented in this subclass:' + this.constructor;
};

/**
 * Gets the element length.
 * 
 * @method
 * @abstract
 * @returns {Integer} Length of content
 */
es.DocumentNode.prototype.getElementLength = function() {
	throw 'DocumentNode.getElementLength not implemented in this subclass:' + this.constructor;
};

/**
 * Checks if this node has child nodes.
 * 
 * @method
 * @abstract
 * @returns {Boolean} Whether this node has children
 */
es.DocumentNode.prototype.hasChildren = function() {
	throw 'DocumentNode.hasChildren not implemented in this subclass:' + this.constructor;
};

/**
 * Traverse tree of nodes (model or view) upstream and for each traversed node call callback function passing traversed node as a parameter.
 * Callback function is called for node passed as node paramter as well.
 * 
 * @param {es.DocumentNode} node Node from which to start traversing
 * @param {function} callback Callback method to be called for every traversed node
 * @method
 */
es.DocumentNode.traverseUpstream = function( node, callback ) {
	while ( node ) {
		if ( callback ( node ) === false ) {
			break;
		}
		node = node.getParent();
	}
};

/**
 * Find the common ancestor of two equal-depth nodes, and return the
 * path from each node to the common ancestor.
 * @param {es.DocumentNode} node1
 * @param {es.DocumentNode} node2
 * @returns {Object|Boolean} Object with keys 'commonAncestor', 'node1Path' and 'node2Path',
 *  or false if there is no common ancestor or if the nodes have unequal depth
 */
es.DocumentNode.getCommonAncestorPaths = function( node1, node2 ) {
	var	path1 = [],
		path2 = [],
		n1 = node1,
		n2 = node2;
	
	// Move up from n1 and n2 simultaneously until we find the
	// common ancestor
	while ( n1 !== n2 ) {
		// Add these nodes to their respective paths
		path1.push( n1 );
		path2.push( n2 );
		// Move up
		n1 = n1.getParent();
		n2 = n2.getParent();
		if ( n1 === null || n2 === null ) {
			// Reached a root, so no common ancestor or unequal depth
			return false;
		}
	}
	
	// If we got here, we've found the common ancestor, and because we did
	// simultaneous traversal we also know node1 and node2 have the same depth.
	return { 'commonAncestor': n1, 'node1Path': path1, 'node2Path': path2 };
};

/* Inheritance */

es.extendClass( es.DocumentNode, es.EventEmitter );
