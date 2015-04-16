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

	// Handlers which match all kinds and a specific type
	this.handlerNamesByType = {};
	// Handlers which match a specific kind and type
	this.handlerNamesByKindAndType = {};
	// Handlers which match a specific file extension as a fallback
	this.handlerNamesByExtension = {};
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

	var i, j, ilen, jlen,
		kinds = constructor.static.kinds,
		types = constructor.static.types,
		extensions = constructor.static.extensions;

	if ( !kinds ) {
		for ( j = 0, jlen = types.length; j < jlen; j++ ) {
			this.handlerNamesByType[types[j]] = constructor.static.name;
		}
	} else {
		for ( i = 0, ilen = kinds.length; i < ilen; i++ ) {
			for ( j = 0, jlen = types.length; j < jlen; j++ ) {
				this.handlerNamesByKindAndType[kinds[i]] = this.handlerNamesByKindAndType[kinds[i]] || {};
				this.handlerNamesByKindAndType[kinds[i]][types[j]] = constructor.static.name;
			}
		}
	}
	if ( constructor.prototype instanceof ve.ui.FileTransferHandler ) {
		for ( i = 0, ilen = extensions.length; i < ilen; i++ ) {
			this.handlerNamesByExtension[extensions[i]] = constructor.static.name;
		}
	}
};

/**
 * Returns the primary command for for node.
 *
 * @param {ve.ui.DataTransferItem} item Data transfer item
 * @param {boolean} isPaste Handler being used for paste
 * @returns {string|undefined} Handler name, or undefined if not found
 */
ve.ui.DataTransferHandlerFactory.prototype.getHandlerNameForItem = function ( item, isPaste ) {
	var constructor,
		name =
			// 1. Match by kind + type (e.g. 'file' + 'text/html')
			( this.handlerNamesByKindAndType[item.kind] && this.handlerNamesByKindAndType[item.kind][item.type] ) ||
			// 2. Match by just type (e.g. 'image/jpeg')
			this.handlerNamesByType[item.type] ||
			// 3. Match by file extension (e.g. 'csv')
			this.handlerNamesByExtension[item.getExtension()];

	if ( !name ) {
		return;
	}

	constructor = this.registry[name];

	if ( isPaste && !constructor.static.handlesPaste ) {
		return;
	}

	if ( constructor.static.matchFunction && !constructor.static.matchFunction( item ) ) {
		return;
	}

	return name;
};

/* Initialization */

ve.ui.dataTransferHandlerFactory = new ve.ui.DataTransferHandlerFactory();
