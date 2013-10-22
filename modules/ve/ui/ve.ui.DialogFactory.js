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
 * @extends OO.Factory
 * @constructor
 */
ve.ui.DialogFactory = function VeUiDialogFactory() {
	// Parent constructor
	OO.Factory.call( this );
};

/* Inheritance */

OO.inheritClass( ve.ui.DialogFactory, OO.Factory );

/* Initialization */

ve.ui.dialogFactory = new ve.ui.DialogFactory();
