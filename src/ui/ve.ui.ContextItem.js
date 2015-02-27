/*!
 * VisualEditor UserInterface ContextItem class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Item in a context.
 *
 * @class
 * @extends OO.ui.Widget
 * @mixins OO.ui.IconElement
 * @mixins OO.ui.LabelElement
 * @mixins OO.ui.PendingElement
 *
 * @constructor
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [basic] Render only basic information
 */
ve.ui.ContextItem = function ( context, model, config ) {
	// Parent constructor
	ve.ui.ContextItem.super.call( this, config );

	// Mixin constructors
	OO.ui.IconElement.call( this, config );
	OO.ui.LabelElement.call( this, config );
	OO.ui.PendingElement.call( this, config );

	// Properties
	this.context = context;
	this.model = model;
	this.$head = $( '<div>' );
	this.$title = $( '<div>' );
	this.$actions = $( '<div>' );
	this.$body = $( '<div>' );
	this.$info = $( '<div>' );
	this.$description = $( '<div>' );
	this.editButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'visualeditor-contextitemwidget-label-secondary' ),
		flags: [ 'progressive' ],
		classes: [ 've-ui-contextItem-editButton' ]
	} );
	this.fragment = null;

	// Events
	this.editButton.connect( this, { click: 'onEditButtonClick' } );
	this.$element.on( 'mousedown', false );

	// Initialization
	this.$label.addClass( 've-ui-contextItem-label' );
	this.$icon.addClass( 've-ui-contextItem-icon' );
	this.$description.addClass( 've-ui-contextItem-description' );
	this.$info
		.addClass( 've-ui-contextItem-info' )
		.append( this.$description );
	this.$title
		.addClass( 've-ui-contextItem-title' )
		.append( this.$icon, this.$label );
	this.$actions
		.addClass( 've-ui-contextItem-actions' )
		.append( this.editButton.$element );
	this.$head
		.addClass( 've-ui-contextItem-head' )
		.append( this.$title, this.$info, this.$actions );
	this.$body.addClass( 've-ui-contextItem-body' );
	this.$element
		.addClass( 've-ui-contextItem' )
		.toggleClass( 've-ui-contextItem-basic', this.context.shouldUseBasicRendering() )
		.append( this.$head, this.$body );
};

/* Inheritance */

OO.inheritClass( ve.ui.ContextItem, OO.ui.Widget );
OO.mixinClass( ve.ui.ContextItem, OO.ui.IconElement );
OO.mixinClass( ve.ui.ContextItem, OO.ui.LabelElement );
OO.mixinClass( ve.ui.ContextItem, OO.ui.PendingElement );

/* Static Properties */

ve.ui.ContextItem.static.editable = true;

ve.ui.ContextItem.static.embeddable = true;

/**
 * Whether this item exclusively handles any model class
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
ve.ui.ContextItem.static.exclusive = true;

ve.ui.ContextItem.static.commandName = null;

/**
 * Annotation or node models this item is related to.
 *
 * Used by #isCompatibleWith.
 *
 * @static
 * @property {Function[]}
 * @inheritable
 */
ve.ui.ContextItem.static.modelClasses = [];

/* Methods */

/**
 * Handle edit button click events.
 *
 * @localdoc Executes the command related to #static-commandName on the context's surface
 *
 * @protected
 */
ve.ui.ContextItem.prototype.onEditButtonClick = function () {
	var command = this.getCommand();

	if ( command ) {
		command.execute( this.context.getSurface() );
	}
};

/**
 * Check if this item is compatible with a given model.
 *
 * @static
 * @inheritable
 * @param {ve.dm.Model} model Model to check
 * @return {boolean} Item can be used with model
 */
ve.ui.ContextItem.static.isCompatibleWith = function ( model ) {
	return ve.isInstanceOfAny( model, this.modelClasses );
};

/**
 * Check if item is editable.
 *
 * @return {boolean} Item is editable
 */
ve.ui.ContextItem.prototype.isEditable = function () {
	return this.constructor.static.editable;
};

/**
 * Get the command for this item.
 *
 * @return {ve.ui.Command} Command
 */
ve.ui.ContextItem.prototype.getCommand = function () {
	return ve.ui.commandRegistry.lookup( this.constructor.static.commandName );
};

/**
 * Get a surface fragment covering the related model item
 *
 * @return {ve.dm.SurfaceFragment} Surface fragment
 */
ve.ui.ContextItem.prototype.getFragment = function () {
	if ( !this.fragment ) {
		this.fragment = this.context.getSurface().getModel().getLinearFragment( this.model.getOuterRange() );
	}
	return this.fragment;
};

/**
 * Get the description.
 *
 * @localdoc Override for custom description content
 * @return {string} Item description
 */
ve.ui.ContextItem.prototype.getDescription = function () {
	return '';
};

/**
 * Render the body.
 *
 * @localdoc Renders the result of #getDescription, override for custom body rendering
 */
ve.ui.ContextItem.prototype.renderBody = function () {
	this.$body.text( this.getDescription() );
};

/**
 * Render the description.
 *
 * @localdoc Renders the result of #getDescription, override for custom description rendering
 */
ve.ui.ContextItem.prototype.renderDescription = function () {
	this.$description.text( this.getDescription() );
};

/**
 * Setup the item.
 *
 * @localdoc Calls #renderDescription if the context suggests basic rendering or #renderBody if not,
 *   override to start any async rendering common to the body and description
 * @chainable
 */
ve.ui.ContextItem.prototype.setup = function () {
	this.editButton.toggle( this.isEditable() );

	if ( this.context.shouldUseBasicRendering() ) {
		this.renderDescription();
	} else {
		this.renderBody();
	}

	return this;
};

/**
 * Teardown the item.
 *
 * @localdoc Empties the description and body, override to abort any async rendering
 * @chainable
 */
ve.ui.ContextItem.prototype.teardown = function () {
	this.$description.empty();
	this.$body.empty();
	return this;
};
