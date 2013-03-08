/*!
 * VisualEditor NodeFactory class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic node factory.
 *
 * @abstract
 * @extends ve.Factory
 * @constructor
 */
ve.NodeFactory = function VeNodeFactory() {
	// Parent constructor
	ve.Factory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.NodeFactory, ve.Factory );

/* Methods */

/**
 * Register a constructor with the factory.
 *
 * @method
 * @param {Function} constructor Constructor to use when creating object
 * @throws {Error} Node names must be strings and must not be empty
 */
ve.NodeFactory.prototype.register = function ( constructor ) {
	var name = constructor.static && constructor.static.name;
	if ( typeof name !== 'string' || name === '' ) {
		throw new Error( 'Node names must be strings and must not be empty' );
	}
	ve.Factory.prototype.register.call( this, name, constructor );
};
