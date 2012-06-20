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
	var surfaceView = this.toolbar.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		selection = surfaceModel.getSelection(),
		doc = surfaceModel.getDocument(),
		leaves = doc.selectNodes( selection, 'leaves' ),
		wrapGap = null,
		prevList,
		firstCoveredSibling,
		lastCoveredSibling,
		node,
		parentNode,
		grandparentNode,
		thisNode,
		convertRange,
		lastOffset = selection.to;
	// Iterate through covered leaf nodes and process either a conversion or wrapping for groups of
	// consecutive covered siblings - for conversion, the entire list will be changed
	for ( var i = 0; i < leaves.length; i++ ) {
		node = leaves[i].node;
		if ( node.isContent() ) {
			node = node.getParent();
		}
		parentNode = node.getParent();
		if ( parentNode.getType() === 'listItem' ) {
			// Convert it
			grandparentNode = parentNode.getParent();
			if ( grandparentNode !== prevList && grandparentNode.getType() === 'list' ) {
				// Change the list style
				surfaceModel.change(
					ve.dm.Transaction.newFromAttributeChange(
						doc, grandparentNode.getOffset(), 'style', style
					),
					selection
				);
				// Skip this one next time
				prevList = grandparentNode;
			}
		} else {
			// Wrap it and it's covered siblings
			firstCoveredSibling = node;
			// Seek forward to the last covered sibling
			thisNode = firstCoveredSibling;
			do {
				lastCoveredSibling = thisNode;
				i++;
				if ( leaves[i] === undefined ) {
					break;
				}
				thisNode = leaves[i].node;
				if ( thisNode.isContent() ) {
					thisNode = thisNode.getParent();
				}
			} while ( thisNode.getParent() === parentNode );
			convertRange = new ve.Range(
				firstCoveredSibling.getOuterRange().start, lastCoveredSibling.getOuterRange().end
			);
			// Convert everything to paragraphs first
			surfaceModel.change(
				ve.dm.Transaction.newFromContentBranchConversion( doc, convertRange, 'paragraph' ),
				selection
			);
			// Wrap everything in a list and each content branch in a listItem
			surfaceModel.change(
				ve.dm.Transaction.newFromWrap(
					doc,
					convertRange,
					[],
					[{ 'type': 'list', 'attributes': { 'style': style } }],
					[],
					[{ 'type': 'listItem' }]
				)
				// TODO: Come up with a proper range object and use it here
			);
		}
	}
};

ve.ui.ListButtonTool.prototype.unlist = function( node ){
	var surface = this.toolbar.surfaceView,
		model = surface.getModel(),
		doc = model.getDocument(),
		selection = model.getSelection(),
		siblings = doc.selectNodes( selection, 'siblings'),
		listNode,
		tx;

	if ( siblings.length === 0 ) {
		return ;
	}
	
	listNode = siblings[0].node;
	// Get the parent list node
	while( listNode && listNode.getType() !== 'list' ) {
		listNode = listNode.getParent();
	}

	tx = ve.dm.Transaction.newFromWrap(
		doc,
		listNode.getRange(),
		[ { 'type': 'list' } ],
		[],
		[ { 'type': 'listItem' } ],
		[]
	);

	model.change( tx );
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
