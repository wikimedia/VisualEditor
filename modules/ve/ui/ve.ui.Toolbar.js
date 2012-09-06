/**
 * VisualEditor user interface Toolbar class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Editing toolbar.
 *
 * @class
 * @constructor
 * @extends {ve.EventEmitter}
 * @param {jQuery} $container
 * @param {ve.ce.Surface} surfaceView
 * @param {Array} config
 */
ve.ui.Toolbar = function VeUiToolbar( $container, surfaceView, config ) {
	// Parent constructor
	ve.EventEmitter.call( this );
	// TODO: Do we still need EventEmitter here?

	if ( !surfaceView ) {
		return;
	}

	// Properties
	this.surfaceView = surfaceView;
	this.$ = $container;
	this.$groups = $( '<div class="ve-ui-toolbarGroups"></div>' );
	this.tools = [];
	this.config = config || [
		{ 'name': 'history', 'items' : ['undo', 'redo'] },
		{ 'name': 'textStyle', 'items' : ['format'] },
		{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'link', 'clear'] },
		{ 'name': 'list', 'items' : ['number', 'bullet', 'outdent', 'indent'] }
	];

	// DOM Changes
	this.$.prepend( this.$groups );

	// Events
	this.surfaceView.model.on( 'change', ve.bind( this.updateTools, this ) );

	// Initialization
	this.setup();
};

/* Inheritance */

ve.inheritClass( ve.ui.Toolbar, ve.EventEmitter );

/* Methods */

/**
 * Triggers update events on all tools.
 *
 * @method
 */
ve.ui.Toolbar.prototype.updateTools = function () {
	var model = this.surfaceView.getModel(),
		doc = model.getDocument(),
		annotations,
		nodes = [],
		range = model.getSelection(),
		startNode,
		endNode,
		tool = this,
		i;

	if ( range !== null ) {
		if ( range.from === range.to ) {
			nodes.push( doc.getNodeFromOffset( range.from ) );
		} else {
			startNode = doc.getNodeFromOffset( range.from );
			endNode = doc.getNodeFromOffset ( range.end );

			if ( startNode.type === 'document' || endNode.type === 'document' ) {
				// Clear state
				for ( i = 0; i < this.tools.length; i++ ) {
					this.tools[i].clearState();
				}
				return;
			}

			// These should be different, alas just in case.
			if ( startNode === endNode ) {
				nodes.push( startNode );
			} else {
				model.getDocument().getDocumentNode().traverseLeafNodes( function ( node ) {
					nodes.push( node );
					if ( node === endNode ) {
						return false;
					}
				}, startNode );
			}
		}

		if ( range.getLength() > 0 ) {
			annotations = doc.getAnnotationsFromRange( range );
		} else {
			// Clear context
			tool.surfaceView.contextView.clear();
			annotations = doc.getAnnotationsFromOffset(
				doc.getNearestContentOffset( range.start - 1 )
			);
		}
		// Update state
		for ( i = 0; i < this.tools.length; i++ ) {
			this.tools[i].updateState( annotations, nodes );
		}
	} else {
		// Clear state
		for ( i = 0; i < this.tools.length; i++ ) {
			this.tools[i].clearState();
		}
	}
};

ve.ui.Toolbar.prototype.getSurfaceView = function () {
	return this.surfaceView;
};

ve.ui.Toolbar.prototype.setup = function () {
	var i, j, $group, tool, toolDefintion;
	for ( i = 0; i < this.config.length; i++ ) {
		$group = $( '<div class="ve-ui-toolbarGroup"></div>' )
			.addClass( 've-ui-toolbarGroup-' + this.config[i].name );
		if ( this.config[i].label ) {
			$group.append(
				$( '<div class="ve-ui-toolbarLabel"></div>' ).html( this.config[i].label )
			);
		}

		for ( j = 0; j < this.config[i].items.length; j++ ) {
			toolDefintion = ve.ui.Tool.tools[ this.config[i].items[j] ];
			if ( toolDefintion ) {
				tool = new toolDefintion.constructor(
					this, toolDefintion.name, toolDefintion.title, toolDefintion.data
				);
				this.tools.push( tool );
				$group.append( tool.$ );
			}
		}

		this.$groups.append( $group );
	}

};
