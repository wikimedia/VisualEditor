// ToolbarView
ve.ui.Toolbar = function( $container, surfaceView, config ) {
	// Inheritance TODO: Do we still need it?
	ve.EventEmitter.call( this );
	if ( !surfaceView ) {
		return;
	}

	// References for use in closures
	var	_this = this,
		$window = $( window );

	// Properties
	this.surfaceView = surfaceView;
	this.$ = $container;
	this.$groups = $( '<div class="es-toolbarGroups"></div>' ).prependTo( this.$ );
	this.tools = [];

	// Update tools on selection and all transactions.
	this.surfaceView.model.on( 'select', ve.proxy( this.updateTools, this ) );
	this.surfaceView.model.on( 'transact', ve.proxy( this.updateTools, this ) );

	this.config = config || [
		{ 'name': 'history', 'items' : ['undo', 'redo'] },
		{ 'name': 'textStyle', 'items' : ['format'] },
		{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'link', 'clear'] },
		{ 'name': 'list', 'items' : ['number', 'bullet', 'outdent', 'indent'] }
	];
	this.setup();

};

/* Methods */

ve.ui.Toolbar.prototype.updateTools = function( e ) {
	var _this = this,
		model = _this.surfaceView.getModel(),
		doc = model.getDocument(),
		annotations,
		nodes = [],
		startNode,
		endNode;

	// On transact: set e, and redraw selection
	if ( e.from === undefined ) {
		e = model.getSelection();
		this.surfaceView.showSelection( e );
	}

	if( e !== null ) {
		if ( e.from === e.to ){
			nodes.push( doc.getNodeFromOffset( e.from ) );
		} else {
			startNode = doc.getNodeFromOffset( e.from );
			endNode = doc.getNodeFromOffset ( e.end );
			// These should be different, alas just in case.
			if ( startNode === endNode ) {
				nodes.push( startNode );

			} else {
				model.getDocument().getDocumentNode().traverseLeafNodes( function( node ) {
					nodes.push( node );
					if( node === endNode ) {
						return false;
					}
				}, startNode );
			}
		}
		// Update Context
		if ( e.getLength() > 0 ) {
			_this.surfaceView.contextView.set();
		} else {
			_this.surfaceView.contextView.clear();
		}

		annotations = doc.getAnnotationsFromRange( e );
		// Update state
		for ( i = 0; i < _this.tools.length; i++ ) {
			_this.tools[i].updateState( annotations, nodes );
		}
	} else {
		// Clear state
		_this.surfaceView.contextView.clear();
		for ( i = 0; i < _this.tools.length; i++ ) {
			_this.tools[i].clearState();
		}
	}
};

ve.ui.Toolbar.prototype.getSurfaceView = function() {
	return this.surfaceView;
};

ve.ui.Toolbar.prototype.setup = function() {
	for ( var i = 0; i < this.config.length; i++ ) {
		var	$group = $( '<div>' )
			.addClass( 'es-toolbarGroup' )
			.addClass( 'es-toolbarGroup-' + this.config[i].name );
		if ( this.config[i].label ) {
			$group.append(
				$( '<div>' ).addClass( 'es-toolbarLabel' ).html( this.config[i].label )
			);
		}

		for ( var j = 0; j < this.config[i].items.length; j++ ) {
			var toolDefintion = ve.ui.Tool.tools[ this.config[i].items[j] ];
			if ( toolDefintion ) {
				var tool = new toolDefintion.constructor(
					this, toolDefintion.name, toolDefintion.title, toolDefintion.data
				);
				this.tools.push( tool );
				$group.append( tool.$ );
			}
		}

		this.$groups.append( $group );
	}

};

ve.extendClass( ve.ui.Toolbar, ve.EventEmitter );
