/*!
 * VisualEditor UserInterface CompletionWidget class.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Widget that displays autocompletion suggestions
 *
 * @class
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface to complete into
 * @param {Object} [config] Configuration options
 * @cfg {Object} [validate] Validation pattern passed to TextInputWidgets
 * @cfg {boolean} [readOnly=false] Prevent changes to the value of the widget.
 */
ve.ui.CompletionWidget = function VeUiCompletionWidget( surface, config ) {
	this.surface = surface;
	this.surfaceModel = surface.getModel();

	// Configuration
	config = config || {
		anchor: false
	};

	// Parent constructor
	ve.ui.CompletionWidget.super.call( this, config );

	this.$tabIndexed = this.$element;

	var $doc = surface.getView().getDocument().getDocumentNode().$element;
	this.menu = new OO.ui.MenuSelectWidget( {
		widget: this,
		$input: $doc,
		width: 'auto'
	} );
	// This may be better semantically as a MenuSectionOptionWidget,
	// but that causes all subsequent options to be indented.
	this.header = new OO.ui.MenuOptionWidget( {
		classes: [ 've-ui-completionWidget-header' ],
		disabled: true
	} );

	// Events
	this.menu.connect( this, {
		choose: 'onMenuChoose',
		toggle: 'onMenuToggle'
	} );

	this.menu.$element.append( this.header.$element );

	// Setup
	this.$element.addClass( 've-ui-completionWidget' )
		.append(
			this.menu.$element
		);
};

/* Inheritance */

OO.inheritClass( ve.ui.CompletionWidget, OO.ui.Widget );

ve.ui.CompletionWidget.prototype.setup = function ( action ) {
	var offset = this.surfaceModel.getSelection().getRange();
	if ( !offset.isCollapsed() ) {
		return;
	}
	this.action = action;
	this.initialOffset = offset.end - this.action.constructor.static.triggerLength;

	this.update();

	this.surfaceModel.connect( this, { select: 'onModelSelect' } );
};

ve.ui.CompletionWidget.prototype.teardown = function () {
	this.tearingDown = true;
	this.menu.toggle( false );
	this.surfaceModel.disconnect( this );
	this.action = undefined;
	this.tearingDown = false;
};

ve.ui.CompletionWidget.prototype.update = function () {
	var direction = this.surface.getDir(),
		range = this.getCompletionRange(),
		boundingRect = this.surface.getView().getSelection( new ve.dm.LinearSelection( range ) ).getSelectionBoundingRect(),
		style = {
			top: boundingRect.bottom
		},
		data = this.surfaceModel.getDocument().data,
		input = data.getText( false, range );

	if ( direction === 'rtl' ) {
		// This works because this.$element is a 0x0px box, with the menu positioned relative to it.
		// If this style was applied to the menu, we'd need to do some math here to align the right
		// edge of the menu with the right edge of the selection.
		style.left = boundingRect.right;
	} else {
		style.left = boundingRect.left;
	}
	this.$element.css( style );

	this.updateMenu( input );
	this.action.getSuggestions( input ).then( function ( suggestions ) {
		this.menu.clearItems().addItems( suggestions.map( this.action.getMenuItemForSuggestion.bind( this.action ) ) );
		if ( this.menu.getItems().length ) {
			this.menu.highlightItem( this.menu.getItems()[ 0 ] );
		}
		this.updateMenu( input, suggestions );
	}.bind( this ) );
};

ve.ui.CompletionWidget.prototype.updateMenu = function ( input, suggestions ) {
	// Update the header based on the input
	var label = this.action.getHeaderLabel( input, suggestions );
	if ( label !== undefined ) {
		this.header.setLabel( label );
		this.header.toggle( label !== null );
	}
	// If there is a label or menu items, show the menu
	if ( this.header.getLabel() !== null || this.menu.items.length ) {
		// HACK: upstream won't show the menu unless there are items.
		// Fix upstream by adding a 'forceShow' option to toggle.
		var length = this.menu.items.length;
		this.menu.items.length = Math.max( length, 1 );
		this.menu.toggle( true );
		this.menu.items.length = length;
	} else {
		this.menu.toggle( false );
	}
};

ve.ui.CompletionWidget.prototype.onMenuChoose = function ( item ) {
	var fragment = this.action.insertCompletion( item.getData(), this.getCompletionRange( true ) );

	fragment.collapseToEnd().select();

	this.teardown();
};

ve.ui.CompletionWidget.prototype.onMenuToggle = function ( visible ) {
	if ( !visible && !this.tearingDown ) {
		// Menu was hidden by the user (e.g. pressed ESC) - trigger a teardown
		this.teardown();
	}
};

ve.ui.CompletionWidget.prototype.onModelSelect = function () {
	var range = this.getCompletionRange();
	if ( !range || range.isBackwards() || this.action.shouldAbandon( this.surfaceModel.getDocument().data.getText( false, range ), this.menu.getItems().length ) ) {
		this.teardown();
	} else {
		this.update();
	}
};

ve.ui.CompletionWidget.prototype.getCompletionRange = function ( withTrigger ) {
	var range = this.surfaceModel.getSelection().getCoveringRange();
	if ( !range || !range.isCollapsed() || !this.action ) {
		return null;
	}
	return new ve.Range( this.initialOffset + ( withTrigger ? 0 : this.action.constructor.static.triggerLength ), range.end );
};
