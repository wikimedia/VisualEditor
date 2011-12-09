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
	this.$clearButton = $( '<div class="es-inspector-clearButton"></div>' ).prependTo( this.$ );
	this.$.prepend( '<div class="es-inspector-title">Link inspector</div>' );
	this.$form = $( '<form></form>' ).appendTo( this.$ );
	this.$locationLabel = $( '<label>Page title</label>' ).appendTo( this.$form );
	this.$locationInput = $( '<input type="text">' ).appendTo( this.$form );

	// Events
	var _this = this;
	this.$clearButton.click( function() {
		var surfaceView = _this.context.getSurfaceView(),
			surfaceModel = surfaceView.getModel(),
			tx = surfaceModel.getDocument().prepareContentAnnotation(
				surfaceView.currentSelection,
				'clear',
				/link\/.*/
			);
		surfaceModel.transact( tx );
		_this.context.closeInspector();
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
	}
};

es.LinkInspector.prototype.onClose = function() {
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
};

/* Inheritance */

es.extendClass( es.LinkInspector, es.Inspector );
