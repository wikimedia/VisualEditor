/*!
 * VisualEditor UserInterface DialogFactory class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface Dialog factory.
 *
 * @class
 * @extends ve.Factory
 * @constructor
 */
ve.ui.DialogFactory = function VeUiDialogFactory() {
	// Parent constructor
	ve.Factory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.ui.DialogFactory, ve.Factory );

/* Methods */

/**
 * Get a list of dialogs for a node.
 *
 * @method
 * @param {ve.dm.Node} node Node to be edited
 * @returns {string[]} Symbolic names of dialogs that can be used to edit node
 */
ve.ui.DialogFactory.prototype.getDialogsForNode = function ( node ) {
	var i, len, dialog, j, nodeClasses,
		matches = [];

	for ( i = 0, len = this.entries.length; i < len; i++ ) {
		dialog = this.entries[i];
		nodeClasses = this.registry[dialog].static && this.registry[dialog].static.nodeClasses;
		if ( nodeClasses ) {
			j = nodeClasses.length;
			while ( nodeClasses[--j] ) {
				if ( node instanceof nodeClasses[j] ) {
					matches.push( dialog );
					break;
				}
			}
		}
	}
	return matches;
};

/* Initialization */

ve.ui.dialogFactory = new ve.ui.DialogFactory();
