/*!
 * VisualEditor ContentEditable Node class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic ContentEditable node.
 *
 * @abstract
 * @extends ve.ce.View
 * @mixins ve.Node
 *
 * @constructor
 * @param {ve.dm.Node} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.Node = function VeCeNode( model, $element ) {
	// Parent constructor
	ve.ce.View.call( this, model, $element );
	// Mixin constructor
	ve.Node.call( this );

	// Properties
	this.parent = null;

	// Events
	this.model.connect( this, { 'attributeChange': 'onAttributeChange' } );
};

/* Inheritance */

ve.inheritClass( ve.ce.Node, ve.ce.View );

ve.mixinClass( ve.ce.Node, ve.Node );

/* Static Members */

/**
 * Whether this node type can be split.
 *
 * When the user presses Enter, we split the node they're in (if splittable), then split its parent
 * if splittable, and continue traversing up the tree and stop at the first non-splittable node.
 *
 * @static
 * @property static.canBeSplit
 * @inheritable
 */
ve.ce.Node.static.canBeSplit = false;

/**
 * Template for shield elements.
 *
 * Uses data URI to inject a 1x1 transparent PNG image into the DOM.
 *
 * Using transparent png instead of gif because IE 10 renders gif as solid red when used as img src.
 *
 * @static
 * @property static.$shieldTemplate
 * @inheritable
 */
ve.ce.Node.static.$shieldTemplate = $( '<img>' )
	.addClass( 've-ce-node-shield' )
	.attr( 'src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAFElEQVR4' +
		'XgXAAQ0AAABAMP1L30IDCPwC/o5WcS4AAAAASUVORK5CYII=' );

/* Methods */

/**
 * Handle attribute change events.
 *
 * Whitelisted attributes will be added or removed in sync with the DOM. They are initially set in
 * the constructor.
 *
 * @method
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.ce.Node.prototype.onAttributeChange = function ( key, from, to ) {
	var htmlKey = key.substr( 7 ).toLowerCase();
	if (
		this.constructor.static.renderHtmlAttributes &&
		key.indexOf( 'html/0/' ) === 0 &&
		htmlKey.length &&
		this.constructor.static.domAttributeWhitelist.indexOf( htmlKey ) !== -1
	) {
		if ( to === undefined ) {
			this.$.removeAttr( htmlKey );
		} else {
			this.$.attr( htmlKey, to );
		}
	}
};

/**
 * Get allowed child node types.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {string[]|null} List of node types allowed as children or null if any type is allowed
 */
ve.ce.Node.prototype.getChildNodeTypes = function () {
	return this.model.getChildNodeTypes();
};

/**
 * Get allowed parent node types.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {string[]|null} List of node types allowed as parents or null if any type is allowed
 */
ve.ce.Node.prototype.getParentNodeTypes = function () {
	return this.model.getParentNodeTypes();
};

/**
 * Check if the node can have children.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {boolean} Model node can have children
 */
ve.ce.Node.prototype.canHaveChildren = function () {
	return this.model.canHaveChildren();
};

/**
 * Check if the node can have children but not content nor be content.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {boolean} Model node can have children but not content nor be content
 */
ve.ce.Node.prototype.canHaveChildrenNotContent = function () {
	return this.model.canHaveChildrenNotContent();
};

/**
 * Check if the node has a wrapped element in the document data.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {boolean} Model node is a wrapped element
 */
ve.ce.Node.prototype.isWrapped = function () {
	return this.model.isWrapped();
};

/**
 * Check if the node can contain content.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {boolean} Node can contain content
 */
ve.ce.Node.prototype.canContainContent = function () {
	return this.model.canContainContent();
};

/**
 * Check if the node is content.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {boolean} Node is content
 */
ve.ce.Node.prototype.isContent = function () {
	return this.model.isContent();
};

/**
 * Check if the node can have a slug before it.
 *
 * TODO: Figure out a way to remove the hard-coding for text nodes here.
 *
 * @static
 * @method
 * @returns {boolean} Whether the node can have a slug before it
 */
ve.ce.Node.prototype.canHaveSlugBefore = function () {
	return !this.canContainContent() && this.getParentNodeTypes() === null && this.type !== 'text';
};

/**
 * Check if the node can have a slug after it.
 *
 * @static
 * @method
 * @returns {boolean} Whether the node can have a slug after it
 */
ve.ce.Node.prototype.canHaveSlugAfter = ve.ce.Node.prototype.canHaveSlugBefore;

/**
 * Get the length of the node.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {number} Model length
 */
ve.ce.Node.prototype.getLength = function () {
	return this.model.getLength();
};

/**
 * Get the outer length of the node, which includes wrappers if present.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {number} Model outer length
 */
ve.ce.Node.prototype.getOuterLength = function () {
	return this.model.getOuterLength();
};

/**
 * Check if the node can be split.
 *
 * @method
 * @returns {boolean} Node can be split
 */
ve.ce.Node.prototype.canBeSplit = function () {
	return this.constructor.static.canBeSplit;
};

/**
 * Get the closest splittable node upstream.
 *
 * @method
 * @returns {ve.ce.Node} Closest splittable node
 */
ve.ce.Node.getSplitableNode = function ( node ) {
	var splitableNode = null;

	node.traverseUpstream( function ( node ) {
		if ( node.canBeSplit() ) {
			splitableNode = node;
			return true;
		} else {
			return false;
		}
	} );

	return splitableNode;
};
