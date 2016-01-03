/*!
 * VisualEditor ContentEditable Annotation class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Generic ContentEditable annotation.
 *
 * This is an abstract class, annotations should extend this and call this constructor from their
 * constructor. You should not instantiate this class directly.
 *
 * Subclasses of ve.dm.Annotation should have a corresponding subclass here that controls rendering.
 *
 * @abstract
 * @extends ve.ce.View
 *
 * @constructor
 * @param {ve.dm.Annotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.Annotation = function VeCeAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.View.call( this, model, config );

	// Properties
	this.parentNode = parentNode || null;
	this.$element.data( 'view', this );
};

/* Inheritance */

OO.inheritClass( ve.ce.Annotation, ve.ce.View );

/* Static Properties */

ve.ce.Annotation.static.tagName = 'span';

/* Static Methods */

/**
 * Get a plain text description.
 *
 * @static
 * @inheritable
 * @param {ve.dm.Annotation} annotation Annotation model
 * @return {string} Description of annotation
 */
ve.ce.Annotation.static.getDescription = function () {
	return '';
};

/* Methods */

/**
 * Get the content branch node this annotation is rendered in, if any.
 *
 * @return {ve.ce.ContentBranchNode|null} Content branch node or null if none
 */
ve.ce.Annotation.prototype.getParentNode = function () {
	return this.parentNode;
};

/** */
ve.ce.Annotation.prototype.getModelHtmlDocument = function () {
	return this.parentNode && this.parentNode.getModelHtmlDocument();
};

ve.ce.Annotation.prototype.appendChild = function ( childNode ) {
	this.$element.append( childNode );
};

ve.ce.Annotation.prototype.getContentContainer = function () {
	return this.$element[ 0 ];
};

ve.ce.Annotation.prototype.attachContents = function () {
	// Do nothing; already attached
};

ve.ce.Annotation.prototype.appendTo = function ( node ) {
	node.appendChild( this.$element[ 0 ] );
};

/**
 * Release all memory.
 */
ve.ce.Annotation.prototype.destroy = function () {
	this.parentNode = null;

	// Parent method
	ve.ce.View.prototype.destroy.call( this );
};
