/*!
 * VisualEditor UserInterface Dialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface dialog.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 */
ve.ui.Dialog = function VeUiDialog( surface ) {
	// Properties
	this.surface = surface;
	this.visible = false;
	this.$ = $( '<div class="ve-ui-dialog"></div>' );
};

/* Methods */

ve.ui.Dialog.prototype.isVisible = function () {
	return this.visible;
};

ve.ui.Dialog.prototype.show = function () {
	this.$.show();
	this.visible = true;
};

ve.ui.Dialog.prototype.hide = function () {
	this.$.hide();
	this.visible = false;
};
