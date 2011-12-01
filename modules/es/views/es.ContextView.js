/**
 * Creates an es.ContextView object.
 * 
 * @class
 * @constructor
 * @param {jQuery} $overlay DOM selection to add nodes to
 */
es.ContextView = function( surfaceView, $overlay ) {
	this.surfaceView = surfaceView;
	this.$ = $( '<div class="es-contextView"></div>' ).appendTo( $overlay || $( 'body' ) );
	this.$toolbar = $( '<div class="es-contextView-menuSection"></div>' );
	this.$container = $( '<div class="es-contextView-container"></div>' )
		.appendTo( this.$ );
	this.$menu = $( '<div class="es-contextView-menu"></div>' )
		.append( this.$toolbar )
		.appendTo( this.$container );
	this.$panels = $( '<div class="es-contextView-panels"></div>' )
		.appendTo( this.$container );
	this.$icon = $( '<div class="es-contextView-icon"></div>' )
		.appendTo( this.$ );
	this.toolbarView = new es.ToolbarView(
		this.$toolbar,
		this.surfaceView,
		[{ 'name': 'textStyle', 'items' : [ 'bold', 'italic', 'formatting', 'clear' ] }]
	);

	// Example menu items
	this.$menu.append(
		'<div class="es-contextView-menuItem-break"></div>' +
		'<div class="es-contextView-menuItem" rel="link">Link to...</div>' +
		'<div class="es-contextView-menuItem-break"></div>' +
		'<div class="es-contextView-menuItem">Copy</div>' +
		'<div class="es-contextView-menuItem">Cut</div>' +
		'<div class="es-contextView-menuItem">Paste</div>'
	);

	this.$panels.append(
		'<div class="es-contextView-panel" rel="link">' +
			'<div><label>Page title or URL <input type="text"></label></div>' +
			'<div><a href="#cancel">Cancel</a> <button>Change</button></div>' +
		'</div>'
	);

	// Events
	var _this = this;
	this.$icon.click( function() {
		_this.$container.toggle();
	} );

	this.$menu.find( '[rel="link"]' ).click( function() {
		_this.$menu.hide();
		_this.$panels.find( '[rel="link"]' ).show();
		_this.$panels.find( '[rel="link"] input:first' ).focus();
	} );
	this.$panels.find( 'button, [href="#cancel"]' ).click( function() {
		_this.$menu.show();
		_this.$panels.children().hide();
		_this.$container.toggle();
		_this.surfaceView.$input.focus();
		return false;
	} );
};

/* Methods */

es.ContextView.prototype.update = function() {
	if ( this.$icon.is( ':visible' ) ) {
		this.set();
	}
};

es.ContextView.prototype.set = function() {

	this.$.removeClass(
		'es-contextView-position-below es-contextView-position-above ' +
		'es-contextView-position-left es-contextView-position-right ' +
		'es-contextView-position-start es-contextView-position-end'
	);
	var selection = this.surfaceView.getModel().getSelection(),
		position,
		offset;
	if ( selection.from < selection.to ) {
		var $lastRange = this.surfaceView.$.find( '.es-contentView-range:visible:last' );
		if ( $lastRange.length ) {
			offset = $lastRange.offset();
			position = new es.Position(
				offset.left + $lastRange.width(), offset.top + $lastRange.height()
			);
			this.$.addClass( 'es-contextView-position-end' );
		}
	} else if ( selection.from > selection.to ) {
		var $firstRange = this.surfaceView.$.find( '.es-contentView-range:visible:first' );
		if ( $firstRange.length ) {
			offset = $firstRange.offset();
			position = new es.Position( offset.left, offset.top );
			this.$.addClass( 'es-contextView-position-start' );
		}
	}
	if ( position ) {
		if ( position.left + this.$container.width() < $( 'body' ).width() ) {
			this.$.addClass( 'es-contextView-position-left' );
		} else {
			this.$.addClass( 'es-contextView-position-right' );
		}
		if ( position.top + this.$container.height() < $( window ).height() + $( window ).scrollTop() ) {
			this.$.addClass( 'es-contextView-position-below' );
		} else {
			this.$.addClass( 'es-contextView-position-above' );
		}
		this.$.css( { 'left': position.left, 'top': position.top } );
		this.$icon.fadeIn( 'fast' );
	}
};

es.ContextView.prototype.clear = function() {
	this.$icon.hide();
	this.$container.hide();
};
