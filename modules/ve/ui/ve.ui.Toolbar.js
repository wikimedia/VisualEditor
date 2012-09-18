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
 * Triggers updateState & clearState events on all tools.
 * on updateState, annotations and nodes are passed as params to tools.
 * @method
 */
ve.ui.Toolbar.prototype.updateTools = function () {
	var model = this.surfaceView.getModel(),
		range = model.getSelection(),
		doc = model.getDocument(),
		selectNodes = [],
		annotations,
		nodes = [],
		startNode,
		endNode,
		i;

	if ( range !== null ) {
		// Cursor
		if ( range.from === range.to ) {
			selectNodes = doc.selectNodes( range, 'leaves' );
			// Get the parent node.
			if ( selectNodes[0].node.parent ) {
				nodes.push( selectNodes[0].node.getParent() );
			}
		} else {
			startNode = doc.getNodeFromOffset( range.from );
			endNode = doc.getNodeFromOffset ( range.end );
			// Bail if selection contains document node.
			if ( startNode.type === 'document' || endNode.type === 'document' ) {
				// Clear state
				this.emit( 'clearState' );
				return;
			}
			// Text selection inside the same node.
			if ( startNode === endNode ) {
				nodes.push( startNode );
			// Select nodes.
			} else {
				selectNodes = doc.selectNodes( range, 'leaves' );
			}
		}
		// If selection.
		if ( range.getLength() > 0 ) {
			annotations = doc.getAnnotationsFromRange( range );
		// Cursor only, get annotations from the left.
		} else {
			// Clear context
			this.surfaceView.contextView.clear();
			annotations = doc.getAnnotationsFromOffset(
				doc.getNearestContentOffset( range.start - 1 )
			);
		}
		// Normalize nodes returned from selectNodes and add to nodes list.
		// Fire toolbar update state to update tools.
		for( i = 0; i < selectNodes.length; i++ ) {
			nodes.push( selectNodes[i].node );
		}
		this.emit( 'updateState', annotations, nodes );
	} else {
		// Clear state
		this.emit( 'clearState' );
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
