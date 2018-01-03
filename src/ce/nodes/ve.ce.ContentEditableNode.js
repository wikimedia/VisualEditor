/*!
 * VisualEditor ContentEditable ContentEditableNode class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * A ContentEditableNode maintains its own contentEditable property
 *
 * @class
 * @abstract
 *
 * @constructor
 */
ve.ce.ContentEditableNode = function VeCeContentEditableNode() {
	this.$element.prop( { contentEditable: 'true', spellcheck: true } );
	this.connect( this, {
		root: 'onNodeRoot',
		unroot: 'onNodeUnroot'
	} );
};

/* Inheritance */

OO.initClass( ve.ce.ContentEditableNode );
// Assumes ve.ce.Node as a base class

/* Methods */

ve.ce.ContentEditableNode.prototype.onNodeRoot = function ( root ) {
	root.connect( this, { contentEditable: 'onRootContentEditable' } );
};

ve.ce.ContentEditableNode.prototype.onNodeUnroot = function ( root ) {
	root.disconnect( this, { contentEditable: 'onRootContentEditable' } );
};

/**
 * Called when the documentNode is enabled / disabled
 *
 * @param {boolean} disabled Whether the documentNode is disabled
 */
ve.ce.ContentEditableNode.prototype.onRootContentEditable = function () {
	this.setContentEditable( this.getRoot().isContentEditable() );
};

/**
 * Enable or disable editing on this node
 *
 * @param {boolean} enabled Whether to enable editing
 */
ve.ce.ContentEditableNode.prototype.setContentEditable = function ( enabled ) {
	if ( enabled === this.isContentEditable() ) {
		return;
	}
	this.$element.prop( 'contentEditable', enabled ? 'true' : 'false' );
	this.emit( 'contentEditable' );
};

ve.ce.ContentEditableNode.prototype.isContentEditable = function () {
	return this.$element.prop( 'contentEditable' ) === 'true';
};
