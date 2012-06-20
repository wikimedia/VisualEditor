/**
 * Creates an ve.ui.ListButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
 ve.ui.ListButtonTool = function( toolbar, name, title, data ) {
	// Inheritance
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.data = data;
	this.nodes = [];
};

/* Methods */

ve.ui.ListButtonTool.prototype.list = function( nodes, style ) {
	var surfaceModel = this.toolbar.getSurfaceView().getModel(),
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection(),
		groups = documentModel.getCoveredSiblingGroups( selection ),
		previousList,
		groupRange,
		group,
		tx;
	for ( var i = 0; i < groups.length; i++ ) {
		group = groups[i];
		if ( group.grandparent && group.grandparent.getType() === 'list' ) {
			if ( group.grandparent !== previousList ) {
				// Change the list style
				surfaceModel.change(
					ve.dm.Transaction.newFromAttributeChange(
						documentModel, group.grandparent.getOffset(), 'style', style
					),
					selection
				);
				// Skip this one next time
				previousList = group.grandparent;
			}
		} else {
			// Get a range that covers the whole group
			groupRange = new ve.Range(
				group.nodes[0].getOuterRange().start,
				group.nodes[group.nodes.length - 1].getOuterRange().end
			);
			// Convert everything to paragraphs first
			surfaceModel.change(
				ve.dm.Transaction.newFromContentBranchConversion(
					documentModel, groupRange, 'paragraph'
				),
				selection
			);
			// Wrap everything in a list and each content branch in a listItem
			tx = ve.dm.Transaction.newFromWrap(
				documentModel,
				groupRange,
				[],
				[{ 'type': 'list', 'attributes': { 'style': style } }],
				[],
				[{ 'type': 'listItem' }]
			);
			surfaceModel.change( tx, tx.translateRange( selection ) );
		}
	}
};

ve.ui.ListButtonTool.prototype.unlist = function( node ) {
	var surfaceModel = this.toolbar.getSurfaceView().getModel(),
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection(),
		groups = documentModel.getCoveredSiblingGroups( selection ),
		previousList,
		group,
		tx;
	for ( var i = 0; i < groups.length; i++ ) {
		group = groups[i];
		if ( group.grandparent && group.grandparent.getType() === 'list' ) {
			if ( group.grandparent !== previousList ) {
				// Unwrap the parent list
				tx = ve.dm.Transaction.newFromWrap(
					documentModel,
					group.grandparent.getRange(),
					[ { 'type': 'list' } ],
					[],
					[ { 'type': 'listItem' } ],
					[]
				);
				surfaceModel.change( tx, tx.translateRange( selection ) );
				// Skip this one next time
				previousList = group.grandparent;
			}
		}
	}
};

ve.ui.ListButtonTool.prototype.onClick = function() {
	this.toolbar.surfaceView.model.breakpoint();
	if ( !this.$.hasClass( 'es-toolbarButtonTool-down' ) ) {
		this.list( this.nodes, this.name );
	} else {
		this.unlist( this.nodes );
	}
	this.toolbar.surfaceView.model.breakpoint();
};

ve.ui.ListButtonTool.prototype.updateState = function( annotations, nodes ) {
	var	surfaceView = this.toolbar.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		doc = surfaceView.getDocument(),
		selection = surfaceModel.getSelection(),
		leaves = doc.selectNodes( selection, 'leaves' );

	function areListItemsOfStyle( leaves, style ){
		var listNode = null;

		for ( var i=0; i < leaves.length; i++ ) {
			listNode = leaves[i].node;
			// Get the list node
			while( listNode && listNode.getType() !== 'list' ) {
				listNode = listNode.getParent();
				if ( listNode === null ) {
					return false;
				}
			}
			if( listNode.getModel().getAttribute('style') !== style ) {
				return false;
			}
		}
		return true;
	}

	if ( areListItemsOfStyle( leaves, this.name ) ) {
		this.$.addClass( 'es-toolbarButtonTool-down' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-down' );
	}
};

/* Registration */

ve.ui.Tool.tools.number = {
	'constructor': ve.ui.ListButtonTool,
	'name': 'number',
	'title': ve.msg( 'visualeditor-listbutton-number-tooltip' )
};

ve.ui.Tool.tools.bullet = {
	'constructor': ve.ui.ListButtonTool,
	'name': 'bullet',
	'title': ve.msg( 'visualeditor-listbutton-bullet-tooltip' )
};

/* Inheritance */

ve.extendClass( ve.ui.ListButtonTool, ve.ui.ButtonTool );
