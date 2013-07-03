/*!
 * VisualEditor UserInterface MWDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface MediaWiki dialog.
 *
 * @class
 * @abstract
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.MWDialog = function VeUiMWDialog( surface, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWDialog, ve.ui.Dialog );


/* Initialization */

ve.ui.MWDialog.static.addLocalStylesheets( [
	've-mw/ui/styles/ve.ui.MWDialog.css',
	've-mw/ui/styles/ve.ui.Widget.css',
	( document.createElementNS && document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ).createSVGRect ?
		've-mw/ui/styles/ve.ui.Icons-vector.css' :
		've-mw/ui/styles/ve.ui.Icons-raster.css' )
] );
