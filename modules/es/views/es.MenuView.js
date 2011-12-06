/**
 * Creates an es.MenuView object.
 * 
 * @class
 * @constructor
 * @param {Object[]} items List of items to append initially
 * @param {Function} callback Function to call if an item doesn't have it's own callback
 * @param {jQuery} [$overlay=$( 'body' )] DOM selection to add nodes to
 */
es.MenuView = function( items, callback, $overlay ) {
	// Properties
	this.$ = $( '<div class="es-menuView"></div>' ).appendTo( $overlay || $( 'body' ) );
	this.items = [];
	this.autoNamedBreaks = 0;
	this.callback = callback;

	// Items
	if ( es.isArray( items ) ) {
		for ( var i = 0; i < items.length; i++ ) {
			this.addItem( items[i] );
		}
	}

	// Events
	var _this = this;
	this.$.bind( {
		'mousedown': function( e ) {
			if ( e.which === 1 ) {
				e.preventDefault();
				return false;
			}
		},
		'mouseup': function( e ) {
			if ( e.which === 1 ) {
				var $item = $( e.target ).closest( '.es-menuView-item' );
				if ( $item.length ) {
					var name = $item.attr( 'rel' );
					for ( var i = 0; i < _this.items.length; i++ ) {
						if ( _this.items[i].name === name ) {
							_this.onSelect( _this.items[i], e );
							return true;
						}
					}
				}
			}
		}
	} );
};

/* Methods */

es.MenuView.prototype.addItem = function( item, before ) {
	if ( item === '-' ) {
		item = {
			'name': 'break-' + this.autoNamedBreaks++
		};
	}
	// Items that don't have custom DOM elements will be auto-created
	if ( !item.$ ) {
		if ( !item.name ) {
			throw 'Invalid menu item error. Items must have a name property.';
		}
		if ( item.label ) {
			item.$ = $( '<div class="es-menuView-item"></div>' )
				.attr( 'rel', item.name )
				// TODO: i18n time!
				.append( $( '<span></span>' ).text( item.label ) );
		} else {
			// No label, must be a break
			item.$ = $( '<div class="es-menuView-break"></div>' )
				.attr( 'rel', item.name );
		}
		// TODO: Keyboard shortcut (and icons for them), support for keyboard accelerators, etc.
	}
	if ( before ) {
		for ( var i = 0; i < this.items.length; i++ ) {
			if ( this.items[i].name === before ) {
				this.items.splice( i, 0, item );
				this.items[i].$.before( item.$ );
				return;
			}
		}
	}
	this.items.push( item );
	this.$.append( item.$ );
};

es.MenuView.prototype.removeItem = function( name ) {
	for ( var i = 0; i < this.items.length; i++ ) {
		if ( this.items[i].name === name ) {
			this.items.splice( i, 1 );
			i--;
		}
	}
};

es.MenuView.prototype.getItems = function() {
	return this.items;
};

es.MenuView.prototype.setPosition = function( position ) {
	return this.$.css( { 'top': position.top, 'left': position.left } );
};

es.MenuView.prototype.show = function() {
	this.$.show();
};

es.MenuView.prototype.toggle = function() {
	this.$.toggle();
};

es.MenuView.prototype.hide = function() {
	this.$.hide();
};

es.MenuView.prototype.onSelect = function( item, event ) {
	if ( typeof item.callback === 'function' ) {
		item.callback( item );
	} else if ( typeof this.callback === 'function' ) {
		this.callback( item );
	}
	this.hide();
};
