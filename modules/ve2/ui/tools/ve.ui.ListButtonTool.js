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
	var surface = this.toolbar.surfaceView,
		model = surface.getModel(),
		doc = model.getDocument(),
		selection = model.getSelection(),
		siblings = doc.selectNodes( selection, 'siblings'),
		outerRange = null,
		tx;

	if ( siblings.length > 1 ){
		outerRange = new ve.Range(
			siblings[0].nodeOuterRange.from,
			siblings[siblings.length-1].nodeOuterRange.to
		);
	} else if( siblings[0].node['parent'] !== null ) {
		outerRange = ( siblings[0].node['parent'].getOuterRange() );
	}

	if( outerRange instanceof ve.Range ) {
		// Convert everything to paragraphs first
		tx = ve.dm.Transaction.newFromContentBranchConversion( doc, outerRange, 'paragraph' );
		model.change( tx );

		tx = ve.dm.Transaction.newFromWrap(
			doc,
			outerRange,
			[],
			[ { 'type': 'list', 'attributes': { 'style': style } } ],
			[],
			[ { 'type': 'listItem' } ]
		);
		model.change ( tx );
		// Modify selection
		siblings = doc.selectNodes( selection, 'siblings'),
		outerRange = new ve.Range(
			siblings[0].nodeRange.from,
			siblings[siblings.length-1].nodeRange.to
		);
		model.change (null, outerRange);
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

	function areListItemsOfStyle( nodes, style ){
		var listNode = null;
		for ( var i=0; i < nodes.length; i++ ) {
			listNode = nodes[i];
			// Get the list node
			while( listNode && listNode.getType() !== 'list' ) {
				listNode = listNode.getParent();
			}
			if( listNode && listNode.getAttribute('style') === style ) {
				return true;
			}
		}
		return false;
	}


	if ( areListItemsOfStyle( nodes, this.name ) ) {
		this.$.addClass( 'es-toolbarButtonTool-down' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-down' );
	}
};

/* Registration */

ve.ui.Tool.tools.number = {
	'constructor': ve.ui.ListButtonTool,
	'name': 'number',
	'title': ve.msg( 'visualeditor-listbutton-number-tooltip' ),
};

ve.ui.Tool.tools.bullet = {
	'constructor': ve.ui.ListButtonTool,
	'name': 'bullet',
	'title': ve.msg( 'visualeditor-listbutton-bullet-tooltip' ),
};

/* Inheritance */

ve.extendClass( ve.ui.ListButtonTool, ve.ui.ButtonTool );
