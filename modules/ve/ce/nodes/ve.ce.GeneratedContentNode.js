/*!
 * VisualEditor ContentEditable GeneratedContentNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable generated content node.
 *
 * @class
 * @abstract
 *
 * @constructor
 */
ve.ce.GeneratedContentNode = function VeCeGeneratedContentNode() {
	// DOM Changes
	this.$.addClass( 've-ce-generatedContentNode' );
	this.$.attr( 'contenteditable', false );

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );

	// Initialization
	this.onUpdate();
};

/* Events */

/**
 * @event setup
 */

/**
 * @event teardown
 */

/**
 * @event rerender
 */

/* Methods */

/**
 * Handle update events.
 *
 * @method
 * @emits setup
 * @emits teardown
 * @emits rerender
 */
ve.ce.GeneratedContentNode.prototype.onUpdate = function () {
	var doc = this.getElementDocument(),
		store = this.model.doc.getStore(),
		index = store.indexOfHash( ve.getHash( this.model ) );
	if ( index !== null ) {
		if ( this.live ) {
			this.emit( 'teardown' );
		}
		this.$.empty().append(
			ve.copyDomElements( store.value( index ), doc )
		);
		if ( this.live ) {
			this.emit( 'setup' );
			this.emit( 'rerender' );
		}
	} else {
		this.startGenerating();
		this.generateContents()
			.done( ve.bind( this.doneGenerating, this ) )
			.fail( ve.bind( this.failGenerating, this ) );
	}
};

/**
 * Start a deferred process to generate the contents of the node.
 * @returns {jQuery.Promise} Promise object
 */
ve.ce.GeneratedContentNode.prototype.generateContents = function () {
	throw new Error( 've.ce.GeneratedContentNode subclass must implement generateContents' );
};

/**
 * Called when the node starts generating new content.
 * @method
 */
ve.ce.GeneratedContentNode.prototype.startGenerating = function () {
	// TODO: add 'generating' style
};

/**
 * Called when the node successfully finishes generating new content.
 *
 * @method
 * @param {HTMLElement[]} domElements Generated content
 */
ve.ce.GeneratedContentNode.prototype.doneGenerating = function ( domElements ) {
	var store = this.model.doc.getStore(),
		hash = ve.getHash( this.model );
	store.index( domElements, hash );
	// TODO: remove 'generating' style
	this.onUpdate();
};

/**
 * Called when the has failed to generate new content.
 * @method
 */
ve.ce.GeneratedContentNode.prototype.failGenerating = function () {
	// TODO: remove 'generating' style
};