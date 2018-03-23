/*!
 * VisualEditor UserInterface Table Context class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context menu for editing tables.
 *
 * Two are usually generated for column and row actions separately.
 *
 * @class
 * @extends ve.ui.Context
 *
 * @constructor
 * @param {ve.ce.TableNode} tableNode
 * @param {string} itemGroup Tool group to use, 'col' or 'row'
 * @param {Object} [config] Configuration options
 */
ve.ui.TableLineContext = function VeUiTableLineContext( tableNode, itemGroup, config ) {
	config = config || {};

	// Parent constructor
	ve.ui.TableLineContext.super.call( this, tableNode.surface.getSurface(), config );

	// Properties
	this.tableNode = tableNode;
	this.itemGroup = itemGroup;
	this.icon = new OO.ui.IconWidget( {
		icon: itemGroup === 'col' ? 'expand' : 'next'
	} );
	this.popup = new OO.ui.PopupWidget( {
		classes: [ 've-ui-tableLineContext-menu' ],
		$container: this.surface.$element,
		$floatableContainer: this.icon.$element,
		position: itemGroup === 'col' ? 'below' : 'after',
		width: 180
	} );

	// Events
	this.icon.$element.on( 'mousedown', this.onIconMouseDown.bind( this ) );
	this.onDocumentMouseDownHandler = this.onDocumentMouseDown.bind( this );

	// Initialization
	this.popup.$body.append( this.$group );
	// The following classes can be used here:
	// * ve-ui-tableLineContext-col
	// * ve-ui-tableLineContext-row
	this.$element
		.addClass( 've-ui-tableLineContext ve-ui-tableLineContext-' + itemGroup )
		.append( this.icon.$element, this.popup.$element );
	// Visibility is handled by the table overlay
	this.toggle( true );
};

/* Inheritance */

OO.inheritClass( ve.ui.TableLineContext, ve.ui.Context );

/* Static Properties */

ve.ui.TableLineContext.static.groups = {
	col: [ 'insertColumnBefore', 'insertColumnAfter', 'moveColumnBefore', 'moveColumnAfter', 'deleteColumn' ],
	row: [ 'insertRowBefore', 'insertRowAfter', 'moveRowBefore', 'moveRowAfter', 'deleteRow' ]
};

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.TableLineContext.prototype.getRelatedSources = function () {
	var i, l,
		items = this.constructor.static.groups[ this.itemGroup ];

	if ( !this.relatedSources ) {
		this.relatedSources = [];

		for ( i = 0, l = items.length; i < l; i++ ) {
			this.relatedSources.push( {
				type: 'item',
				name: items[ i ]
			} );
		}
	}
	return this.relatedSources;
};

/**
 * @inheritdoc
 */
ve.ui.TableLineContext.prototype.onContextItemCommand = function () {
	this.toggleMenu( false );
};

/**
 * Handle mouse down events on the icon
 *
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.TableLineContext.prototype.onIconMouseDown = function ( e ) {
	e.preventDefault();
	this.toggleMenu();
};

/**
 * Handle document mouse down events
 *
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.TableLineContext.prototype.onDocumentMouseDown = function ( e ) {
	if ( !$( e.target ).closest( this.$element ).length ) {
		this.toggleMenu( false );
	}
};

/**
 * Handle model select events
 *
 * @param {ve.dm.Selection} selection
 */
ve.ui.TableLineContext.prototype.onModelSelect = function () {
	this.toggleMenu();
};

/**
 * @inheritdoc
 */
ve.ui.TableLineContext.prototype.toggleMenu = function ( show ) {
	var dir, surfaceModel, surfaceView;

	surfaceModel = this.surface.getModel();
	surfaceView = this.surface.getView();

	this.popup.toggle( show );
	if ( this.popup.isVisible() ) {
		this.tableNode.setEditing( false );
		surfaceModel.connect( this, { select: 'onModelSelect' } );
		surfaceView.$document.on( 'mousedown', this.onDocumentMouseDownHandler );
		dir = surfaceView.getSelection().getDirection();
		this.$element
			.removeClass( 've-ui-dir-block-rtl ve-ui-dir-block-ltr' )
			.addClass( 've-ui-dir-block-' + dir );
	} else {
		surfaceModel.disconnect( this );
		surfaceView.$document.off( 'mousedown', this.onDocumentMouseDownHandler );
	}

	// Parent method - call after selection has been possibly modified above
	ve.ui.TableLineContext.super.prototype.toggleMenu.call( this, show );

	// Update popup positioning after the parent method fills in its contents
	this.popup.position();
};
