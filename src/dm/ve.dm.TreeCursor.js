/*!
 * VisualEditor DataModel TreeCursor class
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

// TODO identify a core of "trusted" code that is guaranteed to detect tree invalidation.
// Probably needs: removeNode insertNode removeText insertText

/**
 * DataModel TreeCursor - a tree walker that tracks the path to the current position.
 *
 * @class
 *
 * @constructor
 * @param {ve.dm.Node} root A document node or a branch root within which to walk
 * @param {ve.dm.Node[]} liveIgnoreNodes Live array of nodes to ignore (cross without counting)
 */
ve.dm.TreeCursor = function VeDmTreeCursor( root, liveIgnoreNodes ) {
	this.root = root;
	this.liveIgnoreNodes = liveIgnoreNodes;
	this.path = [];
	this.offset = 0;
	this.nodes = [ root ];
	this.node = root;
	this.lastStep = null;
};

/* Inheritance */

OO.initClass( ve.dm.TreeCursor );

/* Methods */

/**
 * Skip past ignored nodes and text node boundaries
 *
 * @param {number} [tooShort] Only step into text nodes longer than this
 */
ve.dm.TreeCursor.prototype.normalize = function ( tooShort ) {
	var len, item;
	if ( !this.node ) {
		return;
	}
	if ( tooShort === undefined ) {
		tooShort = -1;
	}
	// If at the end of a text node, step out
	if ( this.node instanceof ve.dm.TextNode && this.offset === this.node.length ) {
		this.nodes.pop();
		this.node = this.nodes[ this.nodes.length - 1 ];
		this.offset = this.path.pop() + 1;
		return;
	}
	// Cross any ignored nodes
	len = ( this.node && this.node.hasChildren() && this.node.children.length ) || 0;
	while (
		this.offset < len &&
		( item = this.node.children[ this.offset ] ) &&
		this.liveIgnoreNodes.indexOf( item ) !== -1
	) {
		this.offset++;
	}
	// If at the start of long enough text node, step in
	if (
		this.node.hasChildren() &&
		( item = this.node.children[ this.offset ] ) &&
		item instanceof ve.dm.TextNode &&
		item.length > tooShort
	) {
		this.node = item;
		this.nodes.push( item );
		this.path.push( this.offset );
		this.offset = 0;
	}
};

/**
 * Take a single step in the walk, consuming no more than a given linear model length
 *
 * A "single step" means either stepping across text content, or stepping over a node, or
 * stepping into/out of a non-text node. (Steps into/out of text nodes happen transparently)
 *
 * See https://phabricator.wikimedia.org/T162762 for the algorithm
 *
 * @param {number} maxLength Maximum linear model length to step over (integer >= 1)
 * @return {Object|undefined} The type of step taken, or undefined if there are no more steps
 * @return {string} return.type open|close|cross|crosstext
 * @return {number} return.length Linear length of the step (integer >= 1)
 * @return {number[]} return.path Offset path from the root to the node containing the stepped item
 * @return {ve.dm.Node|null} return.node The node containing the stepped item
 * @return {number} return.offset The offset of the stepped item within its parent
 * @return {number} [return.offsetLength] Number of characters 'crosstext' passed
 * @return {ve.dm.Node} [return.item] The node stepped into/out of/across (absent for 'crosstext')
 */
ve.dm.TreeCursor.prototype.stepAtMost = function ( maxLength ) {
	var childLength, item, step, length;
	if ( !this.node ) {
		this.lastStep = undefined;
		return undefined;
	}
	this.normalize( maxLength );
	if ( this.node instanceof ve.dm.TextNode ) {
		// We cannot be the end, because we just normalized
		length = Math.min( maxLength, this.node.length - this.offset );
		step = {
			type: 'crosstext',
			length: length,
			path: this.path.slice(),
			node: this.node,
			offset: this.offset,
			offsetLength: length
		};
		this.offset += step.length;
		this.lastStep = step;
		return step;
	}
	// Else not a text node
	childLength = this.node.hasChildren() ? this.node.children.length : 0;
	if ( this.offset > childLength ) {
		throw new Error( 'Offset ' + this.offset + ' > childLength ' + childLength );
	}
	if ( this.offset === childLength ) {
		return this.stepOut();
	}
	// Else there are unpassed child nodes
	item = this.node.children[ this.offset ];
	if ( item.getOuterLength() > maxLength ) {
		return this.stepIn();
	}
	// Else step across this item
	step = {
		type: 'cross',
		length: item.getOuterLength(),
		path: this.path.slice(),
		node: this.node,
		offset: this.offset,
		item: item
	};
	this.offset++;
	this.lastStep = step;
	return step;
};

/**
 * Adjust own position to account for an insertion/deletion
 *
 * @param {number[]} path The path to the node in which the insertion/deletion occurs
 * @param {number} offset The offset at which the insertion/deletion occurs
 * @param {number} adjustment The number of nodes inserted (if > 0) or deleted (if < 0)
 */
ve.dm.TreeCursor.prototype.adjustPath = function ( path, offset, adjustment ) {
	var i, len;
	if ( this.path.length < path.length ) {
		// Adjusted node is deeper than own position, so cannot contain it
		return;
	}
	len = path.length;
	for ( i = 0; i < len; i++ ) {
		if ( this.path[ i ] !== path[ i ] ) {
			// Own position does not lie within the adjusted node
			return;
		}
	}

	// Temporarily push offset onto path to simplify the logic
	this.path.push( this.offset );
	if ( this.path[ len ] > offset || (
		adjustment > 0 && this.path[ len ] === offset
	) ) {
		// Own position lies after the adjustment
		if ( this.path[ len ] + adjustment < offset ) {
			throw new Error( 'Cursor lies within deleted range' );
		}
		this.path[ len ] += adjustment;
	}
	// Restore offset
	this.offset = this.path.pop();
};

/**
 * Step into the next node
 *
 * @return {Object} The step
 */
ve.dm.TreeCursor.prototype.stepIn = function () {
	var item, step;
	if (
		this.node instanceof ve.dm.TextNode ||
		!this.node.hasChildren() ||
		this.offset >= this.node.children.length
	) {
		throw new Error( 'No node to step into' );
	}
	item = this.node.children[ this.offset ];
	step = {
		type: 'open',
		length: item instanceof ve.dm.TextNode ? 0 : 1,
		path: this.path.slice(),
		node: this.node,
		offset: this.offset,
		item: item
	};
	this.path.push( this.offset );
	this.nodes.push( item );
	this.node = item;
	this.offset = 0;
	this.lastStep = step;
	return step;
};

/**
 * Step out of the current node (skipping past any uncrossed children or text within)
 * @return {Object} The step
 */
ve.dm.TreeCursor.prototype.stepOut = function () {
	var item, step;
	item = this.nodes.pop();
	this.node = this.nodes[ this.nodes.length - 1 ];
	this.offset = this.path.pop();
	if ( this.node === undefined ) {
		// Stepped out of the root
		this.lastStep = undefined;
		return undefined;
	}
	step = {
		type: 'close',
		length: item instanceof ve.dm.TextNode ? 0 : 1,
		path: this.path.slice(),
		node: this.node,
		offset: this.offset,
		item: item
	};
	this.offset++;
	this.lastStep = step;
	return step;
};
