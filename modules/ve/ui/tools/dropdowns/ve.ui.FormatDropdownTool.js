/*!
 * VisualEditor UserInterface FormatDropdownTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface format dropdown tool.
 *
 * @class
 * @extends ve.ui.DropdownTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.FormatDropdownTool = function VeUiFormatDropdownTool( toolbar, config ) {
	var i, len, item,
		items = this.constructor.static.items.slice( 0 );

	// Parent constructor
	ve.ui.DropdownTool.call( this, toolbar, config );

	// Initialization
	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		items[i] = new ve.ui.MenuItemWidget( ve.msg( item.label ), item.data, item.options );
	}
	this.menu.addItems( items );
};

/* Inheritance */

ve.inheritClass( ve.ui.FormatDropdownTool, ve.ui.DropdownTool );

/* Static Properties */

ve.ui.FormatDropdownTool.static.name = 'format';

ve.ui.FormatDropdownTool.static.titleMessage = 'visualeditor-formatdropdown-title';

/**
 * Options given to ve.ui.DropdownTool.
 *
 * @static
 * @property
 * @type {Object[]}
 */
ve.ui.FormatDropdownTool.static.items = [
	{
		'label': 'visualeditor-formatdropdown-format-paragraph',
		'data': {
			'type' : 'paragraph'
		},
		'options': {
			'rel': 'paragraph'
		}
	},
	{
		'label': 'visualeditor-formatdropdown-format-heading1',
		'data': {
			'type' : 'heading',
			'attributes': { 'level': 1 }
		},
		'options': {
			'rel': 'heading-1'
		}
	},
	{
		'label': 'visualeditor-formatdropdown-format-heading2',
		'data': {
			'type' : 'heading',
			'attributes': { 'level': 2 }
		},
		'options': {
			'rel': 'heading-2'
		}
	},
	{
		'label': 'visualeditor-formatdropdown-format-heading3',
		'data': {
			'type' : 'heading',
			'attributes': { 'level': 3 }
		},
		'options': {
			'rel': 'heading-3'
		}
	},
	{
		'label': 'visualeditor-formatdropdown-format-heading4',
		'data': {
			'type' : 'heading',
			'attributes': { 'level': 4 }
		},
		'options': {
			'rel': 'heading-4'
		}
	},
	{
		'label': 'visualeditor-formatdropdown-format-heading5',
		'data': {
			'type' : 'heading',
			'attributes': { 'level': 5 }
		},
		'options': {
			'rel': 'heading-5'
		}
	},
	{
		'label': 'visualeditor-formatdropdown-format-heading6',
		'data': {
			'type' : 'heading',
			'attributes': { 'level': 6 }
		},
		'options': {
			'rel': 'heading-6'
		}
	},
	{
		'label': 'visualeditor-formatdropdown-format-preformatted',
		'data': {
			'type' : 'preformatted'
		},
		'options': {
			'rel': 'preformatted'
		}
	}
];

/* Methods */

/**
 * Handle dropdown option being selected.
 *
 * @method
 * @param {ve.ui.MenuItemWidget} item Menu item
 */
ve.ui.FormatDropdownTool.prototype.onSelect = function ( item ) {
	var data;

	if ( item ) {
		data = item.getData();
		this.toolbar.getSurface().execute( 'format', 'convert', data.type, data.attributes );
	}
};

/**
 * Handle the toolbar state being updated.
 *
 * @method
 * @param {ve.dm.Node[]} nodes List of nodes covered by the current selection
 * @param {ve.AnnotationSet} full Annotations that cover all of the current selection
 * @param {ve.AnnotationSet} partial Annotations that cover some or all of the current selection
 */
ve.ui.FormatDropdownTool.prototype.onUpdateState = function ( nodes ) {
	var i, nodesLength, node, j, itemsLength, item, match,
		items = this.menu.getItems();

	nodeLoop:
	for ( i = 0, nodesLength = nodes.length; i < nodesLength; i++ ) {
		node = nodes[i];
		if ( !node.canHaveChildren() ) {
			node = node.getParent();
		}
		if ( node ) {
			for ( j = 0, itemsLength = items.length; j < itemsLength; j++ ) {
				item = items[j];
				if ( item.data.type === node.getType() ) {
					if ( item.data.attributes && !node.hasAttributes( item.data.attributes ) ) {
						continue;
					}
					if ( match ) {
						match = null;
						break nodeLoop;
					}
					match = item;
				}
			}
		}
	}
	if ( match ) {
		this.setLabel( match.label );
		this.menu.setSelectedItem( match );
	} else {
		this.setLabel();
		this.menu.setSelectedItem( null );
	}
};

/* Registration */

ve.ui.toolFactory.register( 'format', ve.ui.FormatDropdownTool );
