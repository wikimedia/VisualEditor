/*!
 * VisualEditor UserInterface data transfer handler class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Data transfer handler.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface
 * @param {DataTransferItem|ve.ui.DataTransferItem} item Data transfer item to handle
 */
ve.ui.DataTransferHandler = function VeUiDataTransferHandler( surface, item ) {
	// Properties
	this.surface = surface;
	this.item = item;

	this.insertableDataDeferred = $.Deferred();
};

/* Inheritance */

OO.initClass( ve.ui.DataTransferHandler );

/* Static properties */

/**
 * Symbolic name for this handler. Must be unique.
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.DataTransferHandler.static.name = null;

/**
 * List of transfer kinds supported by this handler
 *
 * Null means all kinds are supported.
 *
 * @static
 * @property {string[]|null}
 * @inheritable
 */
ve.ui.DataTransferHandler.static.kinds = null;

/**
 * List of mime types supported by this handler
 *
 * @static
 * @property {string[]}
 * @inheritable
 */
ve.ui.DataTransferHandler.static.types = [];

/* Methods */

/**
 * Process the file
 *
 * Implementations should aim to resolve this.insertableDataDeferred.
 */
ve.ui.DataTransferHandler.prototype.process = function () {
	throw new Error( 've.ui.DataTransferHandler subclass must implement process' );
};

/**
 * Insert the file at a specified fragment
 *
 * @return {jQuery.Promise} Promise which resolves with data to insert
 */
ve.ui.DataTransferHandler.prototype.getInsertableData = function () {
	this.process();

	return this.insertableDataDeferred.promise();
};

/**
 * Abort the data transfer handler
 */
ve.ui.DataTransferHandler.prototype.abort = function () {
	this.insertableDataDeferred.reject();
};
