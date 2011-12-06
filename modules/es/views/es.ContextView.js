/**
 * Creates an es.ContextView object.
 * 
 * @class
 * @constructor
 * @param {jQuery} $overlay DOM selection to add nodes to
 */
es.ContextView = function( surfaceView, $overlay ) {
	var _this = this;

	// Properties
	this.surfaceView = surfaceView;
	this.$ = $( '<div class="es-contextView"></div>' ).appendTo( $overlay || $( 'body' ) );
	this.$panels = $( '<div class="es-contextView-panels"></div>' ).appendTo( this.$ );
	this.$toolbar = $( '<div class="es-contextView-toolbar"></div>' );
	this.toolbarView = new es.ToolbarView(
		this.$toolbar,
		this.surfaceView,
		[{ 'name': 'textStyle', 'items' : [ 'bold', 'italic', 'formatting', 'clear' ] }]
	);
	this.menuView = new es.MenuView( [
			// Example menu items
			{ 'name': 'tools', '$': this.$toolbar },
			'-',
			{ 'name': 'link', 'label': 'Link to...', 'callback': function( item ) {
				_this.menuView.hide();
				_this.$panels
					.show()
					.find( '[rel="link"]' )
						.show()
						.end()
					.find( '[rel="link"] input:first' )
						.focus();
			} },
			'-',
			{ 'name': 'copy', 'label': 'Copy' },
			{ 'name': 'cut', 'label': 'Cut' },
			{ 'name': 'paste', 'label': 'Paste' }
		],
		null,
		this.$
	);
	this.$icon = $( '<div class="es-contextView-icon"></div>' ).appendTo( this.$ );
	
	// Example panel
	this.$panels.append(
		'<div class="es-contextView-panel" rel="link">' +
			'<div><label>Page title or URL <input type="text"></label></div>' +
			'<div><a href="#cancel">Cancel</a> <button>Change</button></div>' +
		'</div>'
	);
	this.$panels.find( '[href="#cancel"]' ).click( function( e ) {
		_this.$panels.children().hide();
		e.preventDefault();
		return false;
	} );

	// Events
	this.$icon.bind( {
		'mousedown': function( e ) {
			if ( e.which === 1 ) {
				e.preventDefault();
				return false;
			}
		},
		'mouseup': function( e ) {
			if ( e.which === 1 ) {
				_this.menuView.toggle();
			}
		}
	} );
};

/* Methods */

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
		if ( position.left + this.menuView.$.width() < $( 'body' ).width() ) {
			this.$.addClass( 'es-contextView-position-left' );
		} else {
			this.$.addClass( 'es-contextView-position-right' );
		}
		var $window = $( window );
		if ( position.top + this.menuView.$.height() < $window.height() + $window.scrollTop() ) {
			this.$.addClass( 'es-contextView-position-below' );
		} else {
			this.$.addClass( 'es-contextView-position-above' );
		}
		this.$.css( { 'left': position.left, 'top': position.top } );
		this.$icon.fadeIn( 'fast' );
	}
};

es.ContextView.prototype.clear = function() {
	this.$panels.hide().children().hide();
	this.$icon.hide();
	this.menuView.hide();
};
