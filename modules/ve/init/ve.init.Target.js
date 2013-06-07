/*!
 * VisualEditor Initialization Target class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic Initialization target.
 *
 * @class
 * @abstract
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {jQuery} $container Conainter to render target into
 */
ve.init.Target = function VeInitTarget( $container ) {
	// Mixin constructors
	ve.EventEmitter.call( this );

	// Properties
	this.$ = $container;
};

/* Inheritance */

ve.mixinClass( ve.init.Target, ve.EventEmitter );

/* Static Properties */

ve.init.Target.static.toolbarTools = [
	{ 'items': ['undo', 'redo'] },
	{ 'items': ['format'] },
	{ 'items': ['bold', 'italic', 'link', 'clear'] },
	{ 'items': ['number', 'bullet', 'outdent', 'indent'] }
];

ve.init.Target.static.surfaceCommands = [
	'bold', 'italic', 'link', 'undo', 'redo', 'indent', 'outdent'
];

/* Static Methods */

/**
 * Get a subset of toolbarTools excluding certain tools.
 *
 * @param {string[]} exclude List of tools to exclude
 * @returns {Object} Toolbar tools object
 */
ve.init.Target.static.getToolbarSubset = function ( exclude ) {
	var i, iLen, items, group, toolbarSubset = [];
	for ( i = 0, iLen = this.toolbarTools.length; i < iLen; i++ ) {
		items = ve.simpleArrayDifference( this.toolbarTools[i].items, exclude );
		if ( items.length ) {
			group = ve.copyObject( this.toolbarTools[i] );
			group.items = items;
			toolbarSubset.push( group );
		}
	}
	return toolbarSubset;
};
