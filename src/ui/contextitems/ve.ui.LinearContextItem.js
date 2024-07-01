/*!
 * VisualEditor UserInterface LinearContextItem class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Item in a context.
 *
 * @class
 * @extends ve.ui.ContextItem
 * @mixes OO.ui.mixin.PendingElement
 *
 * @constructor
 * @param {ve.ui.LinearContext} context Context the item is in
 * @param {ve.dm.Model} [model] Model the item is related to
 * @param {Object} [config] Configuration options
 */
ve.ui.LinearContextItem = function VeUiLinearContextItem( context, model, config ) {
	config = config || {};

	// Parent constructor
	ve.ui.LinearContextItem.super.apply( this, arguments );

	// Mixin constructors
	OO.ui.mixin.PendingElement.call( this, config );

	// Properties
	this.$head = $( '<div>' );
	this.$title = $( '<div>' );
	this.$actions = $( '<div>' );
	this.$body = $( '<div>' );
	// Don't use mixins as they expect the icon and label to be children of this.$element.
	this.icon = new OO.ui.IconWidget( { icon: config.icon || this.constructor.static.icon } );
	this.label = new OO.ui.LabelWidget( { label: config.label || this.constructor.static.label } );
	this.actionButtons = new OO.ui.ButtonGroupWidget();

	if ( this.context.isMobile() ) {
		this.editButton = new OO.ui.ButtonWidget( {
			framed: false,
			label: ve.msg( this.isReadOnly() ? 'visualeditor-contextitemwidget-label-view' : 'visualeditor-contextitemwidget-label-secondary' ),
			invisibleLabel: true,
			icon: this.isReadOnly() ? 'eye' : 'edit',
			flags: [ 'progressive' ]
		} );
		this.$foot = $( '<div>' );
		this.$bodyAction = $( '<div>' );
	} else {
		// Desktop
		this.editButton = new OO.ui.ButtonWidget( {
			label: ve.msg( this.isReadOnly() ? 'visualeditor-contextitemwidget-label-view' : 'visualeditor-contextitemwidget-label-secondary' ),
			flags: [ 'progressive' ]
		} );
	}
	if ( this.isEditable() ) {
		this.actionButtons.addItems( [ this.editButton ] );
	}

	// Events
	this.editButton.connect( this, { click: 'onEditButtonClick' } );

	// Initialization
	this.$title
		.addClass( 've-ui-linearContextItem-title' )
		.append( this.icon.$element, this.label.$element );
	this.$actions
		.addClass( 've-ui-linearContextItem-actions' )
		.append( this.actionButtons.$element );
	this.$head
		.addClass( 've-ui-linearContextItem-head' )
		.append( this.$title, this.$actions );
	this.$body.addClass( 've-ui-linearContextItem-body' );
	this.$element
		.addClass( 've-ui-linearContextItem' )
		.append( this.$head, this.$body );

	if ( this.context.isMobile() ) {
		this.$foot.addClass( 've-ui-linearContextItem-foot' );
		this.$bodyAction.addClass( 've-ui-linearContextItem-body-action' ).append( this.$body, this.$actions );
		this.$element.append(
			this.$head,
			$( '<div>' ).addClass( 've-ui-linearContextItem-body-action-wrapper' ).append( this.$bodyAction ),
			this.$foot
		);
	}
};

/* Inheritance */

OO.inheritClass( ve.ui.LinearContextItem, ve.ui.ContextItem );
OO.mixinClass( ve.ui.ContextItem, OO.ui.mixin.PendingElement );

/* Static Properties */

ve.ui.LinearContextItem.static.editable = true;

/**
 * Whether the context item should try (if space permits) to go inside the node,
 * rather than below with an arrow
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
ve.ui.LinearContextItem.static.embeddable = true;

/* Methods */

/**
 * Handle edit button click events.
 *
 * @localdoc Executes the command related to #static-commandName on the context's surface
 *
 * @protected
 * @fires ve.ui.ContextItem#command
 */
ve.ui.LinearContextItem.prototype.onEditButtonClick = function () {
	const command = this.getCommand();

	if ( command ) {
		command.execute( this.context.getSurface(), undefined, 'context' );
		this.emit( 'command' );
	}
};

/**
 * Check if item is editable.
 *
 * @return {boolean} Item is editable
 */
ve.ui.LinearContextItem.prototype.isEditable = function () {
	return this.constructor.static.editable && ( !this.model || this.model.isEditable() );
};

/**
 * Get the description.
 *
 * @localdoc Override for custom description content
 * @return {string} Item description
 */
ve.ui.LinearContextItem.prototype.getDescription = function () {
	return '';
};

ve.ui.LinearContextItem.prototype.setIcon = function ( icon ) {
	return this.icon.setIcon( icon );
};

ve.ui.LinearContextItem.prototype.setLabel = function ( label ) {
	return this.label.setLabel( label );
};

/**
 * Render the body.
 *
 * @localdoc Renders the result of #getDescription, override for custom body rendering
 */
ve.ui.LinearContextItem.prototype.renderBody = function () {
	this.$body.text( this.getDescription() );
};

/**
 * @inheritdoc
 */
ve.ui.LinearContextItem.prototype.setup = function ( refreshing ) {
	this.renderBody();

	const isEmpty = this.$body.is( ':empty' );
	if ( isEmpty && this.context.isMobile() ) {
		if ( this.isEditable() ) {
			this.$head.append( this.editButton.$element );
		}
	}
	this.$element.toggleClass( 've-ui-linearContextItem-empty', isEmpty );

	if ( !refreshing ) {
		// Re-showing a context for some reason (probably a selection-change
		// within the context on a persistent item) shouldn't re-fire this.
		ve.track( 'activity.' + this.constructor.static.name, { action: 'context-show' } );
	}

	return this;
};

/**
 * @inheritdoc
 */
ve.ui.LinearContextItem.prototype.teardown = function () {
	this.$body.empty();
	return this;
};
