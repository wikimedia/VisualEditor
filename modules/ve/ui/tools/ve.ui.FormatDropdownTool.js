/**
 * Creates an ve.FormatDropdownTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.DropdownTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 * @param {Object[]} items
 */
ve.FormatDropdownTool = function( toolbar, name, title ) {
	// Inheritance
	ve.ui.DropdownTool.call( this, toolbar, name, title, [
		{
			'name': 'paragraph',
			'label': ve.msg( 'visualeditor-formatdropdown-format-paragraph' ),
			'type' : 'paragraph'
		},
		{
			'name': 'heading-1',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading1' ),
			'type' : 'heading',
			'attributes': { 'level': 1 }
		},
		{
			'name': 'heading-2',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading2' ),
			'type' : 'heading',
			'attributes': { 'level': 2 }
		},
		{
			'name': 'heading-3',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading3' ),
			'type' : 'heading',
			'attributes': { 'level': 3 }
		},
		{
			'name': 'heading-4',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading4' ),
			'type' : 'heading',
			'attributes': { 'level': 4 }
		},
		{
			'name': 'heading-5',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading5' ),
			'type' : 'heading',
			'attributes': { 'level': 5 }
		},
		{
			'name': 'heading-6',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading6' ),
			'type' : 'heading',
			'attributes': { 'level': 6 }
		},
		{
			'name': 'preformatted',
			'label': ve.msg( 'visualeditor-formatdropdown-format-preformatted' ),
			'type' : 'preformatted'
		}
	] );
};

/* Methods */

ve.FormatDropdownTool.prototype.onSelect = function( item ) {
	var		surfaceView = this.toolbar.surfaceView,
			model = surfaceView.getModel();
			selection = model.getSelection(),
			doc = model.getDocument();

	var txs = ve.dm.Transaction.newFromContentBranchConversion(
		doc,
		selection,
		item.type,
		item.attributes
	);
	model.change( txs );
	surfaceView.showSelection( selection );
};

ve.FormatDropdownTool.prototype.updateState = function( annotations, nodes ) {
	// Get type and attributes of the first node
	var i,
		format = {
			'type': nodes[0].type,
			'attributes': nodes[0].attributes
		};
	// Look for mismatches, in which case format should be null
	for ( i = 1; i < nodes.length; i++ ) {
		if ( format.type != nodes[i].getType() ||
			!ve.compareObjects( format.attributes || {}, nodes[i].attributes || {} ) ) {
			format = null;
			break;
		}
	}
	
	if ( format === null ) {
		this.$label.html( '&nbsp;' );
	} else {
		var items = this.menuView.getItems();
		for ( i = 0; i < items.length; i++ ) {
			if (
				format.type === items[i].type &&
				ve.compareObjects( format.attributes || {}, items[i].attributes || {} )
			) {
				this.$label.text( items[i].label );
				break;
			}
		}
	}
};

/* Registration */

ve.ui.Tool.tools.format = {
	'constructor': ve.FormatDropdownTool,
	'name': 'format',
	'title': ve.msg( 'visualeditor-formatdropdown-tooltip' )
};

/* Inheritance */

ve.extendClass( ve.FormatDropdownTool, ve.ui.DropdownTool );
