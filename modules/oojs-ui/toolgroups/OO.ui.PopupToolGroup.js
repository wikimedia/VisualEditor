/*!
 * ObjectOriented UserInterface PopupToolGroup class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Popup list of tools with an icon and optional label.
 *
 * @class
 * @abstract
 * @extends OO.ui.ToolGroup
 * @mixins OO.ui.IconedElement
 * @mixins OO.ui.LabeledElement
 * @mixins OO.ui.ClippableElement
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.PopupToolGroup = function OoUiPopupToolGroup( toolbar, config ) {
	// Configuration initialization
	config = OO.ui.extendObject( { 'icon': 'down' }, config );

	// Parent constructor
	OO.ui.ToolGroup.call( this, toolbar, config );

	// Mixin constructors
	OO.ui.IconedElement.call( this, this.$$( '<span>' ), config );
	OO.ui.LabeledElement.call( this, this.$$( '<span>' ) );
	OO.ui.ClippableElement.call( this, this.$group );

	// Properties
	this.active = false;
	this.dragging = false;
	this.onBlurHandler = OO.ui.bind( this.onBlur, this );
	this.$handle = this.$$( '<span>' );

	// Events
	this.$handle.on( {
		'mousedown': OO.ui.bind( this.onHandleMouseDown, this ),
		'mouseup': OO.ui.bind( this.onHandleMouseUp, this )
	} );

	// Initialization
	this.$handle
		.addClass( 'oo-ui-popupToolGroup-handle' )
		.append( this.$label, this.$icon );
	this.$
		.addClass( 'oo-ui-popupToolGroup' )
		.prepend( this.$handle );
	this.setLabel( config.label ? OO.ui.msg( config.label ) : '' );
};

/* Inheritance */

OO.inheritClass( OO.ui.PopupToolGroup, OO.ui.ToolGroup );

OO.mixinClass( OO.ui.PopupToolGroup, OO.ui.IconedElement );
OO.mixinClass( OO.ui.PopupToolGroup, OO.ui.LabeledElement );
OO.mixinClass( OO.ui.PopupToolGroup, OO.ui.ClippableElement );

/* Static Properties */

/* Methods */

/**
 * Handle focus being lost.
 *
 * The event is actually generated from a mouseup, so it is not a normal blur event object.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.PopupToolGroup.prototype.onBlur = function ( e ) {
	// Only deactivate when clicking outside the dropdown element
	if ( $( e.target ).closest( '.oo-ui-popupToolGroup' )[0] !== this.$[0] ) {
		this.setActive( false );
	}
};

/**
 * @inheritdoc
 */
OO.ui.PopupToolGroup.prototype.onMouseUp = function ( e ) {
	this.setActive( false );
	return OO.ui.ToolGroup.prototype.onMouseUp.call( this, e );
};

/**
 * @inheritdoc
 */
OO.ui.PopupToolGroup.prototype.onMouseDown = function ( e ) {
	return OO.ui.ToolGroup.prototype.onMouseDown.call( this, e );
};

/**
 * Handle mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.PopupToolGroup.prototype.onHandleMouseUp = function () {
	return false;
};

/**
 * Handle mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.PopupToolGroup.prototype.onHandleMouseDown = function ( e ) {
	if ( !this.disabled && e.which === 1 ) {
		this.setActive( !this.active );
	}
	return false;
};

/**
 * Switch into active mode.
 *
 * When active, mouseup events anywhere in the document will trigger deactivation.
 *
 * @method
 */
OO.ui.PopupToolGroup.prototype.setActive = function ( value ) {
	value = !!value;
	if ( this.active !== value ) {
		this.active = value;
		if ( value ) {
			this.setClipping( true );
			this.$.addClass( 'oo-ui-popupToolGroup-active' );
			this.getElementDocument().addEventListener( 'mouseup', this.onBlurHandler, true );
		} else {
			this.setClipping( false );
			this.$.removeClass( 'oo-ui-popupToolGroup-active' );
			this.getElementDocument().removeEventListener( 'mouseup', this.onBlurHandler, true );
		}
	}
};
