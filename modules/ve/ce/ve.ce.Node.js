/**
 * VisualEditor content editable Node class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic ContentEditable node.
 *
 * @class
 * @abstract
 * @constructor
 * @extends {ve.Node}
 * @param {String} type Symbolic name of node type
 * @param {ve.dm.Node} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.Node = function VeCeNode( type, model, $element ) {
	// Parent constructor
	ve.Node.call( this, type );

	// Properties
	this.model = model;
	this.$ = $element || $( '<div>' );
	this.parent = null;
	this.live = false;

	// Initialization
	this.$.data( 'node', this );
	ve.setDomAttributes(
		this.$[0],
		this.model.getAttributes( 'html/' ),
		this.constructor.static.domAttributeWhitelist
	);
};

/* Inheritance */

ve.inheritClass( ve.ce.Node, ve.Node );

/* Static Memebers */

ve.ce.Node.static = {};

/**
 * Allowed attributes for DOM elements.
 *
 * This list includes attributes that are generally safe to include in HTML loaded from a
 * foreign source and displaying it inside the browser. It doesn't include any event attributes,
 * for instance, which would allow arbitrary JavaScript execution. This alone is not enough to
 * make HTML safe to display, but it helps.
 *
 * TODO: Rather than use a single global list, set these on a per-node basis to something that makes
 * sense for that node in particular.
 */
ve.ce.Node.static.domAttributeWhitelist = [
	'abbr', 'about', 'align', 'alt', 'axis', 'bgcolor', 'border', 'cellpadding', 'cellspacing',
	'char', 'charoff', 'cite', 'class', 'clear', 'color', 'colspan', 'datatype', 'datetime',
	'dir', 'face', 'frame', 'headers', 'height', 'href', 'id', 'itemid', 'itemprop', 'itemref',
	'itemscope', 'itemtype', 'lang', 'noshade', 'nowrap', 'property', 'rbspan', 'rel',
	'resource', 'rev', 'rowspan', 'rules', 'scope', 'size', 'span', 'src', 'start', 'style',
	'summary', 'title', 'type', 'typeof', 'valign', 'value', 'width'
];

/**
 * Template for shield elements.
 *
 * Uses data URI to inject a 1x1 transparent PNG image into the DOM.
 *
 * @static
 * @member
 */
// Using transparent png instead of gif because IE 10 renders gif as solid red when used as img src.
ve.ce.Node.static.$shieldTemplate = $(
	'<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAFElEQVR4XgXAAQ0AAABAMP1L30IDCPwC/o5WcS4AAAAASUVORK5CYII=" ' +
		'class="ve-ce-node-shield">'
);

/* Methods */

/**
 * Gets a list of allowed child node types.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {String[]|null} List of node types allowed as children or null if any type is allowed
 */
ve.ce.Node.prototype.getChildNodeTypes = function () {
	return this.model.getChildNodeTypes();
};

/**
 * Gets a list of allowed parent node types.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {String[]|null} List of node types allowed as parents or null if any type is allowed
 */
ve.ce.Node.prototype.getParentNodeTypes = function () {
	return this.model.getParentNodeTypes();
};

/**
 * Checks if model is for a node that can have children.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {Boolean} Model node can have children
 */
ve.ce.Node.prototype.canHaveChildren = function () {
	return this.model.canHaveChildren();
};

/**
 * Checks if model is for a node that can have children.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {Boolean} Model node can have children
 */
ve.ce.Node.prototype.canHaveChildren = function () {
	return this.model.canHaveChildren();
};

/**
 * Checks if model is for a node that can have grandchildren.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {Boolean} Model node can have grandchildren
 */
ve.ce.Node.prototype.canHaveGrandchildren = function () {
	return this.model.canHaveGrandchildren();
};

/**
 * Checks if model is for a wrapped element.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {Boolean} Model node is a wrapped element
 */
ve.ce.Node.prototype.isWrapped = function () {
	return this.model.isWrapped();
};

/**
 * Checks if this node can contain content.
 *
 * @method
 * @returns {Boolean} Node can contain content
 */
ve.ce.Node.prototype.canContainContent = function () {
	return this.model.canContainContent();
};

/**
 * Checks if this node is content.
 *
 * @method
 * @returns {Boolean} Node is content
 */
ve.ce.Node.prototype.isContent = function () {
	return this.model.isContent();
};

/**
 * Checks if this node can have a slug before it
 *
 * @static
 * @method
 * @returns {Boolean} Whether the node can have a slug before it
 */
ve.ce.Node.prototype.canHaveSlugBefore = function () {
	return !this.canContainContent() && this.getParentNodeTypes() === null && this.type !== 'text';
};

/**
 * Checks if this node can have a slug after it
 *
 * @static
 * @method
 * @returns {Boolean} Whether the node can have a slug after it
 */
ve.ce.Node.prototype.canHaveSlugAfter = ve.ce.Node.prototype.canHaveSlugBefore;

/**
 * Gets model length.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {Number} Model length
 */
ve.ce.Node.prototype.getLength = function () {
	return this.model.getLength();
};

/**
 * Gets model outer length.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {Number} Model outer length
 */
ve.ce.Node.prototype.getOuterLength = function () {
	return this.model.getOuterLength();
};

/**
 * Checks if this node can be split.
 *
 * @method
 * @returns {Boolean} Node can be split
 */
ve.ce.Node.prototype.canBeSplit = function () {
	return ve.ce.nodeFactory.canNodeBeSplit( this.type );
};

/**
 * Gets a reference to the model this node observes.
 *
 * @method
 * @returns {ve.dm.Node} Reference to the model this node observes
 */
ve.ce.Node.prototype.getModel = function () {
	return this.model;
};

ve.ce.Node.getSplitableNode = function ( node ) {
	var splitableNode = null;

	ve.Node.traverseUpstream( node, function ( node ) {
		if ( node.canBeSplit() ) {
			splitableNode = node;
			return true;
		} else {
			return false;
		}
	} );

	return splitableNode;
};

/**
 * @method
 * @returns {Boolean} Node is attached to the live DOM
 */
ve.ce.Node.prototype.isLive = function () {
	return this.live;
};

/**
 * @method
 */
ve.ce.Node.prototype.setLive = function ( live ) {
	this.live = live;
	this.emit( 'live' );
};
