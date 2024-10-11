/*!
 * VisualEditor ContentEditable TextStyleAnnotation class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * ContentEditable text style annotation.
 *
 * @class
 * @abstract
 * @extends ve.ce.Annotation
 * @constructor
 * @param {ve.dm.TextStyleAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.TextStyleAnnotation = function VeCeTextStyleAnnotation() {
	// Parent constructor
	ve.ce.TextStyleAnnotation.super.apply( this, arguments );

	// DOM changes
	this.$element.addClass( 've-ce-textStyleAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.TextStyleAnnotation, ve.ce.Annotation );

/* Methods */

/**
 * @inheritdoc
 */
ve.ce.TextStyleAnnotation.prototype.getTagName = function () {
	return this.getModel().getAttribute( 'nodeName' ) || this.constructor.static.tagName;
};
