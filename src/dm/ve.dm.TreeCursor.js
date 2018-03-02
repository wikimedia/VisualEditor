/*!
 * VisualEditor DataModel TreeCursor class
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
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
 * @param {number} [linearOffset] The first linear model offset inside root; default 0
 */
ve.dm.TreeCursor = function VeDmTreeCursor( root, liveIgnoreNodes, linearOffset ) {
	this.root = root;
	this.liveIgnoreNodes = liveIgnoreNodes;
	this.path = [];
	this.offset = 0;
	this.nodes = [ root ];
	this.node = root;
	this.lastStep = null;
	if ( linearOffset === undefined ) {
		linearOffset = 0;
	}
	this.linearOffset = linearOffset;
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
	if ( this.node.type === 'text' && this.offset === this.node.length ) {
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
		this.linearOffset += item.getOuterLength();
	}
	// If at the start of long enough text node, step in
	if (
		this.node.hasChildren() &&
		( item = this.node.children[ this.offset ] ) &&
		item.type === 'text' &&
		item.length > tooShort
	) {
		this.node = item;
		this.nodes.push( item );
		this.path.push( this.offset );
		this.offset = 0;
	}
};

/**
 * Validate this.linearOffset against this.node and this.offset
 *
 * TODO: Improve the unit tests, then move this method to the unit testing framework
 *
 * @throws {Error} If this.linearOffset does not match this.node and this.offset
 */
ve.dm.TreeCursor.prototype.checkLinearOffset = function () {
	var expected = this.node.getOffset();
	if ( this.node.type === 'text' ) {
		expected += this.offset;
	} else {
		if ( this.node !== this.root ) {
			// Add 1 for the open tag
			expected += 1;
		}
		if ( this.node.hasChildren() ) {
			// Add the outer length of each crossed child
			this.node.children.slice( 0, this.offset ).forEach( function ( child ) {
				expected += child.getOuterLength();
			} );
		}
	}
	if ( expected !== this.linearOffset ) {
		throw new Error( 'Linear offset does not match tree position' );
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
	// On very large pages this is a performance bottleneck, so only run in tests
	if ( ve.test ) {
		this.checkLinearOffset();
	}
	this.normalize( maxLength );
	if ( this.node.type === 'text' ) {
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
		this.linearOffset += length;
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
	length = item.getOuterLength();
	step = {
		type: 'cross',
		length: length,
		path: this.path.slice(),
		node: this.node,
		offset: this.offset,
		item: item
	};
	this.offset++;
	this.lastStep = step;
	this.linearOffset += length;
	return step;
};

/**
 * Adjust own position to account for an insertion/deletion
 *
 * @param {number[]} path The path to the node in which the insertion/deletion occurs
 * @param {number} offset The offset at which the insertion/deletion occurs
 * @param {number} adjustment The number of nodes inserted (if > 0) or deleted (if < 0)
 * @param {number} linearAdjustment The linear adjustment made at the offset
 */
ve.dm.TreeCursor.prototype.adjustPath = function ( path, offset, adjustment, linearAdjustment ) {
	var i, len;

	len = path.length;
	// Find the first offset i where this.path[ i ] is undefined or differs from path[ i ]
	// If there is such an offset, then own position lies outside the adjusted node
	for ( i = 0; i < len; i++ ) {
		if ( this.path[ i ] === path[ i ] ) {
			continue;
		}
		if ( path[ i ] < ( i === this.path.length ? this.offset : this.path[ i ] ) ) {
			// Own position lies after the adjusted node
			this.linearOffset += linearAdjustment;
		}
		return;
	}
	// Else own position is in the adjusted node or one of its children

	// Temporarily push offset onto path to simplify the logic
	this.path.push( this.offset );

	if ( this.path[ len ] > offset || (
		this.path[ len ] === offset && ( adjustment || linearAdjustment ) > 0
	) ) {
		// Own position lies inside the adjusted node, after the adjustment
		if ( this.path[ len ] + adjustment < offset ) {
			throw new Error( 'Cursor lies within deleted range' );
		}
		this.path[ len ] += adjustment;
		// Need not adjust this.nodes, because the actual node object is unchanged
		this.linearOffset += linearAdjustment;
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
	var item, length, step;
	if (
		this.node.type === 'text' ||
		!this.node.hasChildren() ||
		this.offset >= this.node.children.length
	) {
		throw new Error( 'No node to step into' );
	}
	item = this.node.children[ this.offset ];
	length = item.type === 'text' ? 0 : 1;
	step = {
		type: 'open',
		length: length,
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
	this.linearOffset += length;
	return step;
};

/**
 * Step out of the current node (skipping past any uncrossed children or text within)
 * @return {Object} The step
 */
ve.dm.TreeCursor.prototype.stepOut = function () {
	var item, step,
		treeCursor = this,
		priorOffset = this.offset;
	item = this.nodes.pop();
	this.node = this.nodes[ this.nodes.length - 1 ];
	this.offset = this.path.pop();
	if ( this.node === undefined ) {
		// Stepped out of the root
		this.lastStep = undefined;
		return undefined;
	}
	if ( item.type === 'text' ) {
		this.linearOffset += item.getLength() - priorOffset;
	} else {
		if ( item.hasChildren() ) {
			// Increase linearOffset by the length of each child
			item.children.slice( priorOffset ).forEach( function ( child ) {
				treeCursor.linearOffset += child.getOuterLength();
			} );
		}
		// Increase linearOffset for the close tag
		this.linearOffset++;
	}
	step = {
		type: 'close',
		length: item.type === 'text' ? 0 : 1,
		path: this.path.slice(),
		node: this.node,
		offset: this.offset,
		item: item
	};
	this.offset++;
	this.lastStep = step;
	return step;
};
