/*!
 * VisualEditor DataTransferHandlerFactory class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Drop handler Factory.
 *
 * @class
 * @extends OO.Factory
 * @constructor
 */
ve.ui.DataTransferHandlerFactory = function VeUiDataTransferHandlerFactory() {
	// Parent constructor
	ve.ui.DataTransferHandlerFactory.super.apply( this, arguments );

	this.handlerNamesByType = {};
};

/* Inheritance */

OO.inheritClass( ve.ui.DataTransferHandlerFactory, OO.Factory );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DataTransferHandlerFactory.prototype.register = function ( constructor ) {
	// Parent method
	ve.ui.DataTransferHandlerFactory.super.prototype.register.call( this, constructor );

	var i, l, types = constructor.static.types;
	for ( i = 0, l = types.length; i < l; i++ ) {
		this.handlerNamesByType[types[i]] = constructor.static.name;
	}
};

/**
 * Returns the primary command for for node.
 *
 * @param {string} type File type
 * @returns {string|undefined} Handler name, or undefined if not found
 */
ve.ui.DataTransferHandlerFactory.prototype.getHandlerNameForType = function ( type ) {
	return this.handlerNamesByType[type];
};

/* Initialization */

ve.ui.dataTransferHandlerFactory = new ve.ui.DataTransferHandlerFactory();
