/*!
 * VisualEditor DataModel Node class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic DataModel node.
 *
 * @abstract
 * @extends ve.Node
 * @constructor
 * @param {string} type Symbolic name of node type
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.Node = function VeDmNode( type, length, element ) {
	// Parent constructor
	ve.Node.call( this, type );

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

ve.inheritClass( ve.dm.Node, ve.Node );

/* Static members */

/**
 * Symbolic name for the node class. Must be set to a unique string by every subclass. Must not
 * conflict with other node names or other annotation names.
 * @static
 * @property {string} [static.name=null]
 * @inheritable
 */
ve.dm.Node.static.name = null;

/**
 * Array of HTML tag names that this node should be a match candidate for.
 * Empty array means none, null means any.
 * For more information about element matching, see ve.dm.ModelRegistry.
 * @static
 * @property {Array} static.matchTagNames
 * @inheritable
 */
ve.dm.Node.static.matchTagNames = null;

/**
 * Array of RDFa types that this node should be a match candidate for.
 * Empty array means none, null means any.
 * For more information about element matching, see ve.dm.ModelRegistry.
 * @static
 * @property {Array} static.matchRdfaType
 * @inheritable
 */
ve.dm.Node.static.matchRdfaTypes = null;

/**
 * Optional function to determine whether this node should match a given element.
 * Takes an HTMLElement and returns true or false.
 * This function is only called if this node has a chance of "winning"; see
 * ve.dm.ModelRegistry for more information about element matching.
 * If set to null, this property is ignored. Setting this to null is not the same as unconditionally
 * returning true, because the presence or absence of a matchFunction affects the node's
 * specificity.
 *
 * NOTE: This function is NOT a method, within this function "this" will not refer to an instance
 * of this class (or to anything reasonable, for that matter).
 * @static
 * @property {Function} static.matchFunction
 * @inheritable
 */
ve.dm.Node.static.matchFunction = null;

/**
 * Static function to convert a DOM element to a linear model data element for this node type.
 *
 * This function is only called if this node "won" the matching for the DOM element, so domElement
 * will match this node's matching rule.
 *
 * The returned linear model element must have a type property set to a registered node name
 * (usually the node's .static.name, but that's not required). It may optionally have an attributes
 * property set to an object with key-value pairs. Any other properties are not allowed.
 *
 * @static
 * @method
 * @param {HTMLElement} domElement DOM element to convert
 * @returns {Object} Linear model element
 */
ve.dm.Node.static.toDataElement = function ( /*domElement*/ ) {
	throw new Error( 've.dm.Node subclass must implement toDataElement' );
};

/**
 * Static function to convert a linear model data element for this node type back to a DOM element.
 *
 * @static
 * @method
 * @param {Object} Linear model element with a type property and optionally an attributes property
 * @returns {HTMLElement} DOM element
 */
ve.dm.Node.static.toDomElement = function ( /*dataElement*/ ) {
	throw new Error( 've.dm.Node subclass must implement toDomElement' );
};

/**
 * Whether this node type has a wrapping element in the linear model. Most node types are wrapped,
 * only special node types are not wrapped.
 *
 * @static
 * @property {Boolean} static.isWrapped
 * @inheritable
 */
ve.dm.Node.static.isWrapped = true;

/**
 * Whether this node type is a content node type. This means the node represents content, cannot
 * have children, and can only appear as children of a content container node. Content nodes are
 * also known as inline nodes.
 *
 * @static
 * @property {Boolean} static.isContent
 * @inheritable
 */
ve.dm.Node.static.isContent = false;

/**
 * Whether this node type can contain content. The children of content container nodes must be
 * content nodes.
 *
 * @static
 * @property {Boolean} static.canContainContent
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
 * @property {Boolean} static.hasSignificantWhitespace
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

/* Methods */

/**
 * Get allowed child node types.
 *
 * @method
 * @returns {string[]|null} List of node types allowed as children or null if any type is allowed
 */
ve.dm.Node.prototype.getChildNodeTypes = function () {
	return ve.dm.nodeFactory.getChildNodeTypes( this.type );
};

/**
 * Get allowed parent node types.
 *
 * @method
 * @returns {string[]|null} List of node types allowed as parents or null if any type is allowed
 */
ve.dm.Node.prototype.getParentNodeTypes = function () {
	return ve.dm.nodeFactory.getParentNodeTypes( this.type );
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
 * Check if the node can have grandchildren.
 *
 * @method
 * @returns {boolean} Node can have grandchildren
 */
ve.dm.Node.prototype.canHaveGrandchildren = function () {
	return ve.dm.nodeFactory.canNodeHaveGrandchildren( this.type );
};

/**
 * Check if the node has a wrapped element in the document data.
 *
 * @method
 * @returns {boolean} Node represents a wrapped element
 */
ve.dm.Node.prototype.isWrapped = function () {
	return ve.dm.nodeFactory.isNodeWrapped( this.type );
};

/**
 * Check if the node can contain content.
 *
 * @method
 * @returns {boolean} Node can contain content
 */
ve.dm.Node.prototype.canContainContent = function () {
	return ve.dm.nodeFactory.canNodeContainContent( this.type );
};

/**
 * Check if the node is content.
 *
 * @method
 * @returns {boolean} Node is content
 */
ve.dm.Node.prototype.isContent = function () {
	return ve.dm.nodeFactory.isNodeContent( this.type );
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
	return ve.dm.nodeFactory.doesNodeHaveSignificantWhitespace( this.type );
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
 * @throws {Error} Invalid content length error if length is less than 0
 * @emits lengthChange
 * @emits update
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
 * @throws {Error} Invalid adjustment error if resulting length is less than 0
 * @emits lengthChange (diff)
 * @emits update
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
 * Get the value of an attribute.
 *
 * Return value is by reference if array or object.
 *
 * @method
 * @returns {Mixed} Value of attribute, or undefined if no such attribute exists
 */
ve.dm.Node.prototype.getAttribute = function ( key ) {
	return this.element && this.element.attributes ? this.element.attributes[key] : undefined;
};

/**
 * Get a copy of all attributes.
 *
 * Values are by reference if array or object, similar to using the getAttribute method.
 *
 * @method
 * @param {string} prefix Only return attributes with this prefix, and remove the prefix from them
 * @returns {Object} Attributes
 */
ve.dm.Node.prototype.getAttributes = function ( prefix ) {
	var key, filtered,
		attributes = this.element && this.element.attributes ? this.element.attributes : {};
	if ( prefix ) {
		filtered = {};
		for ( key in attributes ) {
			if ( key.indexOf( prefix ) === 0 ) {
				filtered[key.substr( prefix.length )] = attributes[key];
			}
		}
		return filtered;
	}
	return ve.extendObject( {}, attributes );
};

/**
 * Check if the node has certain attributes.
 *
 * If an array of keys is provided only the presence of the attributes will be checked. If an object
 * with keys and values is provided both the presence of the attributes and their values will be
 * checked. Comparison of values is done by casting to strings unless the strict argument is used.
 *
 * @method
 * @param {string[]|Object} attributes Array of keys or object of keys and values
 * @param {boolean} strict Use strict comparison when checking if values match
 * @returns {boolean} Node has attributes
 */
ve.dm.Node.prototype.hasAttributes = function ( attributes, strict ) {
	var key, i, len,
		ourAttributes = this.getAttributes() || {};
	if ( ve.isPlainObject( attributes ) ) {
		// Node must have all the required attributes
		for ( key in attributes ) {
			if (
				!( key in ourAttributes ) ||
				( strict ?
					attributes[key] !== ourAttributes[key] :
					String( attributes[key] ) !== String( ourAttributes[key] )
				)
			) {
				return false;
			}
		}
	} else if ( ve.isArray( attributes ) ) {
		for ( i = 0, len = attributes.length; i < len; i++ ) {
			if ( !( attributes[i] in ourAttributes ) ) {
				return false;
			}
		}
	}
	return true;
};

/**
 * Get a clone of the node's document data element.
 *
 * The attributes object will be deep-copied.
 *
 * @returns {Object} Cloned element object
 */
ve.dm.Node.prototype.getClonedElement = function () {
	return ve.copyObject( this.element );
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
