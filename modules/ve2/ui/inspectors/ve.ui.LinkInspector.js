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

		var		surfaceModel = _this.context.getSurfaceView().getModel(),
				annotation = _this.getSelectedLinkAnnotation();
		// If link annotation exists, clear it.
		if ( annotation !== undefined ) {
			surfaceModel.annotate( 'clear', annotation );
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

ve.ui.LinkInspector.prototype.getSelectedLinkAnnotation = function(){
	var surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		documentModel = surfaceModel.getDocument(),
		data = documentModel.getData( surfaceModel.getSelection() );

	if ( data.length ) {
		if ( ve.isPlainObject( data[0][1] ) ) {
			var annotation = ve.dm.Document.getMatchingAnnotation( data[0][1], /link\/.*/ );
			if ( ve.isPlainObject(annotation) ) {
				return annotation;
			}
		}
	}
	return ;
};

ve.ui.LinkInspector.prototype.getTitleFromSelection = function() {
	var annotation = this.getSelectedLinkAnnotation();

	if ( annotation && annotation.data && annotation.data.title ) {
		return annotation.data.title;
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
			annotation = this.getSelectedLinkAnnotation();

		// Clear link annotation if it exists
		if ( annotation !== undefined ) {
			surfaceModel.annotate( 'clear', annotation );
		}
		surfaceModel.annotate( 'set', { 'type': 'link/wikiLink', 'data': { 'title': title } } );
	}
};

/* Inheritance */

ve.extendClass( ve.ui.LinkInspector, ve.ui.Inspector );
