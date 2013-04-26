/*!
 * VisualEditor UserInterface PendingInputWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.PendingInputWidget object.
 *
 * @class
 * @abstract
 *
 * @constructor
 */
ve.ui.PendingInputWidget = function VeUiPendingInputWidget () {
	this.pending = 0;
};

/* Methods */

/**
 * Adds a pending marker
 */
ve.ui.PendingInputWidget.prototype.pushPending = function () {
	this.pending++;
	this.$.addClass( 've-ui-pendingInputWidget' );
	return this;
};

/**
 * Removes a pending marker
 */
ve.ui.PendingInputWidget.prototype.popPending = function () {
	this.pending--;
	this.$.removeClass( 've-ui-pendingInputWidget' );
	return this;
};
