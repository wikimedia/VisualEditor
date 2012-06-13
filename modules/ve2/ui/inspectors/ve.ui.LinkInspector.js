/**
 * Creates an ve.ui.LinkInspector object.
 *
 * @class
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.LinkInspector = function( toolbar, context ) {
	// Inheritance
	ve.ui.Inspector.call( this, toolbar, context );
	// Properties
	this.$clearButton = $( '<div class="es-inspector-button es-inspector-clearButton"></div>' )
		.prependTo( this.$ );
	this.$.prepend( '<div class="es-inspector-title">Edit link</div>' );
	this.$locationLabel = $( '<label>Page title</label>' ).appendTo( this.$form );
	this.$locationInput = $( '<input type="text">' ).appendTo( this.$form );
	this.initialValue = null;

	// Events
	var _this = this;
	this.$clearButton.click( function() {
		if ( $(this).is( '.es-inspector-button-disabled' ) ) {
			return;
		}

		var	surfaceModel = _this.context.getSurfaceView().getModel(),
			annotations = _this.getSelectedLinkAnnotations();
		// If link annotation exists, clear it.
		for ( var hash in annotations ) {
			surfaceModel.annotate( 'clear', annotations[hash] );
		}

		_this.$locationInput.val( '' );
		_this.context.closeInspector();
	} );
	this.$locationInput.bind( 'mousedown keydown cut paste', function() {
		setTimeout( function() {
			if ( _this.$locationInput.val() !== _this.initialValue ) {
				_this.$acceptButton.removeClass( 'es-inspector-button-disabled' );
			} else {
				_this.$acceptButton.addClass( 'es-inspector-button-disabled' );
			}
		}, 0 );
	} );
};

/* Methods */

ve.ui.LinkInspector.prototype.getSelectedLinkAnnotations = function(){
	var surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		documentModel = surfaceModel.getDocument(),
		data = documentModel.getData( surfaceModel.getSelection() );

	if ( data.length ) {
		if ( ve.isPlainObject( data[0][1] ) ) {
			var annotations = ve.dm.Document.getMatchingAnnotations( data[0][1], /link\/.*/ );
			for ( var hash in annotations ) {
				return annotations[hash];
			}
		}
	}
	return ;
};

ve.ui.LinkInspector.prototype.getTitleFromSelection = function() {
	var annotations = this.getSelectedLinkAnnotations();
	for ( var hash in annotations ) {
		// Use the first one that has a title (there should only be one, but this is just in case)
		if ( annotations[hash].data && annotations[hash].data.title ) {
			return annotations[hash].data.title;
		}
	}
	return null;
};

ve.ui.LinkInspector.prototype.onOpen = function() {
	var title = this.getTitleFromSelection();
	if ( title !== null ) {
		this.$locationInput.val( title );
		this.$clearButton.removeClass( 'es-inspector-button-disabled' );
	} else {
		this.$locationInput.val( '' );
		this.$clearButton.addClass( 'es-inspector-button-disabled' );
	}
	this.$acceptButton.addClass( 'es-inspector-button-disabled' );
	this.initialValue = this.$locationInput.val();
	var _this = this;
	setTimeout( function() {
		_this.$locationInput.focus().select();
	}, 0 );
};

ve.ui.LinkInspector.prototype.onClose = function( accept ) {
	if ( accept ) {
		var title = this.$locationInput.val();
		if ( title === this.getTitleFromSelection() || !title ) {
			return;
		}
		var surfaceModel = this.context.getSurfaceView().getModel(),
			annotations = this.getSelectedLinkAnnotations();

		// Clear link annotation if it exists
		for ( var hash in annotations ) {
			surfaceModel.annotate( 'clear', annotations[hash] );
		}
		surfaceModel.annotate( 'set', { 'type': 'link/wikiLink', 'data': { 'title': title } } );
	}
};

/* Inheritance */

ve.extendClass( ve.ui.LinkInspector, ve.ui.Inspector );
