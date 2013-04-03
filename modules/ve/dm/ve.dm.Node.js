/*!
 * VisualEditor DataModel Node class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic DataModel node.
 *
 * @abstract
 * @extends ve.dm.Model
 * @mixins ve.Node
 *
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.Node = function VeDmNode( length, element ) {
	// Parent constructor
	ve.dm.Model.call( this, element );
	// Mixin constructor
	ve.Node.call( this );

	// Properties
	this.length = length || 0;
	this.element = element;
	this.doc = undefined;
};

/**
 * @event lengthChange
 * @param diff
 */

/**
 * @event update
 */

/* Inheritance */

ve.inheritClass( ve.dm.Node, ve.dm.Model );

ve.mixinClass( ve.dm.Node, ve.Node );

/* Static Properties */

/**
 * Whether this node type has a wrapping element in the linear model. Most node types are wrapped,
 * only special node types are not wrapped.
 *
 * @static
 * @property {boolean} static.isWrapped
 * @inheritable
 */
ve.dm.Node.static.isWrapped = true;

/**
 * Whether this node type is a content node type. This means the node represents content, cannot
 * have children, and can only appear as children of a content container node. Content nodes are
 * also known as inline nodes.
 *
 * @static
 * @property {boolean} static.isContent
 * @inheritable
 */
ve.dm.Node.static.isContent = false;

/**
 * Whether this node type can contain content. The children of content container nodes must be
 * content nodes.
 *
 * @static
 * @property {boolean} static.canContainContent
 * @inheritable
 */
ve.dm.Node.static.canContainContent = false;

/**
 * Whether this node type has significant whitespace. Only applies to content container nodes
 * (i.e. can only be true if canContainContent is also true).
 *
 * If a content node has significant whitespace, the text inside it is not subject to whitespace
 * stripping and preservation.
 *
 * @static
 * @property {boolean} static.hasSignificantWhitespace
 * @inheritable
 */
ve.dm.Node.static.hasSignificantWhitespace = false;

/**
 * Array of allowed child node types for this node type.
 *
 * An empty array means no children are allowed. null means any node type is allowed as a child.
 *
 * @static
 * @property {string[]|null} static.childNodeTypes
 * @inheritable
 */
ve.dm.Node.static.childNodeTypes = null;

/**
 * Array of allowed parent node types for this node type.
 *
 * An empty array means this node type cannot be the child of any node. null means this node type
 * can be the child of any node type.
 *
 * @static
 * @property {string[]|null} static.parentNodeTypes
 * @inheritable
 */
ve.dm.Node.static.parentNodeTypes = null;

/**
 * Array of suggested parent node types for this node type.
 *
 * These parent node types are allowed but the editor will avoid creating them.
 *
 * An empty array means this node type should not be the child of any node. null means this node type
 * can be the child of any node type.
 *
 * @static
 * @property {string[]|null} static.suggestedParentNodeTypes
 * @inheritable
 */
ve.dm.Node.static.suggestedParentNodeTypes = null;

/**
 * Default attributes to set for newly created linear model elements. These defaults will be used
 * when creating a new element in ve.dm.NodeFactory#getDataElement when there is no DOM node or
 * existing linear model element to base the attributes on.
 *
 * This property is an object with attribute names as keys and attribute values as values.
 * Attributes may be omitted, in which case they'll simply be undefined.
 *
 * @static
 * @property {Object} static.defaultAttributes
 * @inheritable
 */
ve.dm.Node.static.defaultAttributes = {};

/**
 * Get hash object of a linear model data element
 *
 * @static
 * @param {Object} dataElement Data element
 * @returns {Object} Hash object
 */
ve.dm.Node.static.getHashObject = function ( dataElement ) {
	return {
		type: dataElement.type,
		attributes: dataElement.attributes
	};
};

/* Methods */

/**
 * Get a clone of the node's document data element.
 *
 * The attributes object will be deep-copied, and the .internal.generated property will be removed,
 * if present.
 *
 * @returns {Object} Cloned element object
 */
ve.dm.Node.prototype.getClonedElement = function () {
	var clone = ve.copyObject( this.element );
	if ( clone.internal ) {
		delete clone.internal.generated;
	}
	return clone;
};

/**
 * Get allowed child node types.
 *
 * @method
 * @returns {string[]|null} List of node types allowed as children or null if any type is allowed
 */
ve.dm.Node.prototype.getChildNodeTypes = function () {
	return this.constructor.static.childNodeTypes;
};

/**
 * Get allowed parent node types.
 *
 * @method
 * @returns {string[]|null} List of node types allowed as parents or null if any type is allowed
 */
ve.dm.Node.prototype.getParentNodeTypes = function () {
	return this.constructor.static.parentNodeTypes;
};

/**
 * Get suggested parent node types.
 *
 * @method
 * @returns {string[]|null} List of node types suggested as parents or null if any type is suggested
 */
ve.dm.Node.prototype.getSuggestedParentNodeTypes = function () {
	return this.constructor.static.suggestedParentNodeTypes;
};

/**
 * Check if the node can have children.
 *
 * @method
 * @returns {boolean} Node can have children
 */
ve.dm.Node.prototype.canHaveChildren = function () {
	return ve.dm.nodeFactory.canNodeHaveChildren( this.type );
};

/**
 * Check if the node can have children but not content nor be content.
 *
 * @method
 * @returns {boolean} Node can have children but not content nor be content
 */
ve.dm.Node.prototype.canHaveChildrenNotContent = function () {
	return ve.dm.nodeFactory.canNodeHaveChildrenNotContent( this.type );
};

/**
 * Check if the node has a wrapped element in the document data.
 *
 * @method
 * @returns {boolean} Node represents a wrapped element
 */
ve.dm.Node.prototype.isWrapped = function () {
	return this.constructor.static.isWrapped;
};

/**
 * Check if the node can contain content.
 *
 * @method
 * @returns {boolean} Node can contain content
 */
ve.dm.Node.prototype.canContainContent = function () {
	return this.constructor.static.canContainContent;
};

/**
 * Check if the node is content.
 *
 * @method
 * @returns {boolean} Node is content
 */
ve.dm.Node.prototype.isContent = function () {
	return this.constructor.static.isContent;
};

/**
 * Check if the node has significant whitespace.
 *
 * Can only be true if canContainContent is also true.
 *
 * @method
 * @returns {boolean} Node has significant whitespace
 */
ve.dm.Node.prototype.hasSignificantWhitespace = function () {
	return this.constructor.static.hasSignificantWhitespace;
};

/**
 * Check if the node has an ancestor with matching type and attribute values.
 *
 * @method
 * @returns {boolean} Node is content
 */
ve.dm.Node.prototype.hasMatchingAncestor = function ( type, attributes ) {
	var key,
		node = this;
	// Traverse up to matching node
	while ( node && node.getType() !== type ) {
		node = node.getParent();
		// Stop at root
		if ( node === null ) {
			return false;
		}
	}
	// Check attributes
	if ( attributes ) {
		for ( key in attributes ) {
			if ( node.getAttribute( key ) !== attributes[key] ) {
				return false;
			}
		}
	}
	return true;
};

/**
 * Get the length of the node.
 *
 * @method
 * @returns {number} Length of the node's contents
 */
ve.dm.Node.prototype.getLength = function () {
	return this.length;
};

/**
 * Get the outer length of the node, which includes wrappers if present.
 *
 * @method
 * @returns {number} Length of the entire node
 */
ve.dm.Node.prototype.getOuterLength = function () {
	return this.length + ( this.isWrapped() ? 2 : 0 );
};

/**
 * Get the range inside the node.
 *
 * @method
 * @returns {ve.Range} Inner node range
 */
ve.dm.Node.prototype.getRange = function () {
	var offset = this.getOffset();
	if ( this.isWrapped() ) {
		offset++;
	}
	return new ve.Range( offset, offset + this.length );
};

/**
 * Get the range outside the node.
 *
 * @method
 * @returns {ve.Range} Outer node range
 */
ve.dm.Node.prototype.getOuterRange = function () {
	var offset = this.getOffset();
	return new ve.Range( offset, offset + this.getOuterLength() );
};

/**
 * Set the inner length of the node.
 *
 * This should only be called after a relevant change to the document data. Calling this method will
 * not change the document data.
 *
 * @method
 * @param {number} length Length of content
 * @emits lengthChange
 * @emits update
 * @throws {Error} Invalid content length error if length is less than 0
 */
ve.dm.Node.prototype.setLength = function ( length ) {
	if ( length < 0 ) {
		throw new Error( 'Length cannot be negative' );
	}
	// Compute length adjustment from old length
	var diff = length - this.length;
	// Set new length
	this.length = length;
	// Adjust the parent's length
	if ( this.parent ) {
		this.parent.adjustLength( diff );
	}
	// Emit events
	this.emit( 'lengthChange', diff );
	this.emit( 'update' );
};

/**
 * Adjust the length.
 *
 * This should only be called after a relevant change to the document data. Calling this method will
 * not change the document data.
 *
 * @method
 * @param {number} adjustment Amount to adjust length by
 * @emits lengthChange
 * @emits update
 * @throws {Error} Invalid adjustment error if resulting length is less than 0
 */
ve.dm.Node.prototype.adjustLength = function ( adjustment ) {
	this.setLength( this.length + adjustment );
};

/**
 * Get the offset of the node within the document.
 *
 * If the node has no parent than the result will always be 0.
 *
 * @method
 * @returns {number} Offset of node
 */
ve.dm.Node.prototype.getOffset = function () {
	return this.root === this ? 0 : this.root.getOffsetFromNode( this );
};

/**
 * Check if the node can be merged with another.
 *
 * For two nodes to be mergeable, the two nodes must either be the same node or:
 *  - Have the same type
 *  - Have the same depth
 *  - Have similar ancestory (each node upstream must have the same type)
 *
 * @method
 * @param {ve.dm.Node} node Node to consider merging with
 * @returns {boolean} Nodes can be merged
 */
ve.dm.Node.prototype.canBeMergedWith = function ( node ) {
	var n1 = this,
		n2 = node;
	// Move up from n1 and n2 simultaneously until we find a common ancestor
	while ( n1 !== n2 ) {
		if (
			// Check if we have reached a root (means there's no common ancestor or unequal depth)
			( n1 === null || n2 === null ) ||
			// Ensure that types match
			n1.getType() !== n2.getType()
		) {
			return false;
		}
		// Move up
		n1 = n1.getParent();
		n2 = n2.getParent();
	}
	return true;
};

/**
 * Get the hash object of the node.
 *
 * The actual logic is in a static function as this needs
 * to be accessible from ve.dm.Converter
 *
 * This is a custom hash function for ve#getHash.
 *
 * @method
 * @returns {Object} Hash object
 */
ve.dm.Node.prototype.getHashObject = function () {
	return this.constructor.static.getHashObject( this.element );
};
