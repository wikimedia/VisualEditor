/*!
 * VisualEditor UserInterface InsertionInspector class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Inspector for inserting special characters.
 *
 * @abstract
 * @class
 * @extends ve.ui.FragmentInspector
 *
 * @constructor
 * @param {OO.ui.WindowManager} manager Manager of window
 * @param {Object} [config] Configuration options
 */
ve.ui.InsertionInspector = function VeUiInsertionInspector( manager, config ) {
	// Parent constructor
	ve.ui.FragmentInspector.call( this, manager, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.InsertionInspector, ve.ui.FragmentInspector );

/* Static properties */

ve.ui.InsertionInspector.static.actions = [
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		flags: 'safe'
	}
];
