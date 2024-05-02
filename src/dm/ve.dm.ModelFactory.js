/*!
 * VisualEditor DataModel ModelFactory class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel meta item factory.
 *
 * @class
 * @abstract
 * @extends OO.Factory
 * @constructor
 */
ve.dm.ModelFactory = function VeDmModelFactory() {
	// Parent constructor
	ve.dm.ModelFactory.super.call( this );
};

/* Inheritance */

OO.inheritClass( ve.dm.ModelFactory, OO.Factory );

/* Methods */

/**
 * Create a new item from a model element
 *
 * @param {Object} element Model element
 * @param {...any} [args] Arguments to pass to the constructor
 * @return {ve.dm.Model} Model constructed from element
 * @throws {Error} Element must have a .type property
 */
ve.dm.ModelFactory.prototype.createFromElement = function ( element, ...args ) {
	if ( element && element.type ) {
		return this.create( element.type, element, ...args );
	}
	throw new Error( 'Element must have a .type property' );
};
