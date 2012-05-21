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


	this.surfaceView.on( 'rangeChange', function( e ) {
		if ( e.new !== null ) {
			var	annotations = _this.surfaceView.getAnnotations(),
				nodes = [],
				model = _this.surfaceView.documentView.model;

			if ( e.new.from === e.new.to ) {
				nodes.push( model.getNodeFromOffset( e.new.from ) );
			} else {
				var	startNode = model.getNodeFromOffset( e.new.start ),
					endNode = model.getNodeFromOffset( e.new.end );
				if ( startNode === endNode ) {
					nodes.push( startNode );
				} else {
					model.traverseLeafNodes( function( node ) {
						nodes.push( node );
						if( node === endNode ) {
							return false;
						}
					}, startNode );
				}
			}

			for ( i = 0; i < _this.tools.length; i++ ) {
				_this.tools[i].updateState( annotations, nodes );
			}
		} else {
			for ( i = 0; i < _this.tools.length; i++ ) {
				_this.tools[i].clearState();
			}
		}
	} );

	this.config = config || [
		{ 'name': 'history', 'items' : ['undo', 'redo'] },
		{ 'name': 'textStyle', 'items' : ['format'] },
		{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'link', 'clear'] },
		{ 'name': 'list', 'items' : ['number', 'bullet', 'outdent', 'indent'] }
	];
	this.setup();
};

/* Methods */

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
