/**
 * Creates an es.LinkInspector object.
 * 
 * @class
 * @constructor
 * @param {es.ToolbarView} toolbar
 */
es.LinkInspector = function( toolbar, context ) {
	// Inheritance
	es.Inspector.call( this, toolbar, context );

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
		var surfaceView = _this.context.getSurfaceView(),
			surfaceModel = surfaceView.getModel(),
			tx = surfaceModel.getDocument().prepareContentAnnotation(
				surfaceView.currentSelection,
				'clear',
				/link\/.*/
			);
		surfaceModel.transact( tx );
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

es.LinkInspector.prototype.getTitleFromSelection = function() {
	var surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		documentModel = surfaceModel.getDocument(),
		data = documentModel.getData( surfaceView.currentSelection );
	if ( data.length ) {
		var annotation = es.DocumentModel.getMatchingAnnotations( data[0], /link\/.*/ );
		if ( annotation.length ) {
			annotation = annotation[0];
		}
		if ( annotation && annotation.data && annotation.data.title ) {
			return annotation.data.title;
		}
	}
	return null;
};

es.LinkInspector.prototype.onOpen = function() {
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

es.LinkInspector.prototype.onClose = function( accept ) {
	if ( accept ) {
		var title = this.$locationInput.val();
		if ( title === this.getTitleFromSelection() || !title ) {
			return;
		}
		var surfaceView = this.context.getSurfaceView(),
			surfaceModel = surfaceView.getModel();
		var clear = surfaceModel.getDocument().prepareContentAnnotation(
			surfaceView.currentSelection,
			'clear',
			/link\/.*/
		);
		surfaceModel.transact( clear );
		var set = surfaceModel.getDocument().prepareContentAnnotation(
			surfaceView.currentSelection,
			'set',
			{ 'type': 'link/internal', 'data': { 'title': title } }
		);
		surfaceModel.transact( set );
	}
};

/* Inheritance */

es.extendClass( es.LinkInspector, es.Inspector );
