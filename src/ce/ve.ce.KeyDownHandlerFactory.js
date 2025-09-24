/*!
 * VisualEditor KeyDownHandlerFactory class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Key down handler factory.
 *
 * @class
 * @extends OO.Factory
 * @constructor
 */
ve.ce.KeyDownHandlerFactory = function VeCeKeyDownHandlerFactory() {
	// Parent constructor
	ve.ce.KeyDownHandlerFactory.super.apply( this, arguments );

	// Handlers which match all kinds and a specific type
	this.handlerNamesByKeys = new Map();
};

/* Inheritance */

OO.inheritClass( ve.ce.KeyDownHandlerFactory, OO.Factory );

/* Methods */

/**
 * Register a constructor with the factory.
 *
 *     function MyClass() {};
 *     OO.initClass( MyClass );
 *     MyClass.static.name = 'hello';
 *     // Register class with the factory, available via the symbolic name "hello"
 *     factory.register( MyClass );
 *
 * See https://doc.wikimedia.org/oojs/master/OO.Factory.html
 *
 * @param {Function} constructor Constructor to use when creating object
 * @throws {Error} If a parameter is invalid
 */
ve.ce.KeyDownHandlerFactory.prototype.register = function ( constructor ) {
	// Parent method
	ve.ce.KeyDownHandlerFactory.super.prototype.register.call( this, constructor );

	const keys = constructor.static.keys;
	const name = constructor.static.name;

	// TODO: Clean up handlerNamesByKeys in unregister
	keys.forEach( ( key ) => {
		this.handlerNamesByKeys.set( key, this.handlerNamesByKeys.get( key ) || new Set() );
		this.handlerNamesByKeys.get( key ).add( name );
	} );
};

/**
 * Get the handler for a specific key
 *
 * @param {number} key Key code
 * @param {string} selectionName Selection type name
 * @return {Function[]} Matched handlers
 */
ve.ce.KeyDownHandlerFactory.prototype.lookupHandlersForKey = function ( key, selectionName ) {
	if ( !this.handlerNamesByKeys.has( key ) ) {
		return [];
	}
	const constructors = [];

	// Length is likely to be 1 or 0 so don't cache
	this.handlerNamesByKeys.get( key ).forEach( ( name ) => {
		const constructor = this.registry[ name ];
		const supportedSelections = constructor.static.supportedSelections;
		if ( !supportedSelections || supportedSelections.includes( selectionName ) ) {
			constructors.push( constructor );
		}
	} );

	return constructors;
};

/**
 * Execute the handlers for a specific key
 *
 * @param {number} key Key code
 * @param {string} selectionName Selection type name
 * @param {ve.ce.Surface} surface
 * @param {jQuery.Event} e Key down event
 * @return {boolean} Some handlers acted
 */
ve.ce.KeyDownHandlerFactory.prototype.executeHandlersForKey = function ( key, selectionName, surface, e ) {
	const handlers = this.lookupHandlersForKey( key, selectionName );

	let acted = false;
	// Length is likely to be 1 or 0 so don't cache
	handlers.forEach( ( handler ) => {
		if ( handler.static.execute( surface, e ) ) {
			acted = true;
		}
	} );

	return acted;
};

/* Initialization */

ve.ce.keyDownHandlerFactory = new ve.ce.KeyDownHandlerFactory();
