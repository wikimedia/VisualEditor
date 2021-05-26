/*!
 * VisualEditor UserInterface ModeledFactory class.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Mixin for factories whose items associate with specific models.
 *
 * Classes registered with the factory should have a static method named `isCompatibleWith` that
 * accepts a model and returns a boolean.
 *
 * @class
 *
 * @constructor
 */
ve.ui.ModeledFactory = function VeUiModeledFactory() {};

/* Inheritance */

OO.initClass( ve.ui.ModeledFactory );

/* Methods */

/**
 * Get a list of symbolic names for classes related to a list of models.
 *
 * The lowest compatible item in each inheritance chain will be used.
 *
 * @param {Object[]} models Models to find relationships with
 * @return {Object[]} List of objects containing `name` and `model` properties, representing
 *   each compatible class's symbolic name and the model it is compatible with
 */
ve.ui.ModeledFactory.prototype.getRelatedItems = function ( models ) {
	var registry = this.registry;

	/**
	 * Collect the most specific compatible classes for a model.
	 *
	 * @private
	 * @param {Object} m Model to find compatibility with
	 * @return {Function[]} List of compatible classes
	 */
	function collect( m ) {
		var candidates = [];

		for ( var n in registry ) {
			var candidate = registry[ n ];
			if ( candidate.static.isCompatibleWith( m ) ) {
				var add = true;
				for ( var k = 0, kLen = candidates.length; k < kLen; k++ ) {
					if ( candidate.prototype instanceof candidates[ k ] ) {
						candidates.splice( k, 1, candidate );
						add = false;
						break;
					} else if ( candidates[ k ].prototype instanceof candidate ) {
						add = false;
						break;
					}
				}
				if ( add ) {
					candidates.push( candidate );
				}
			}
		}

		return candidates;
	}

	var names = {};
	var matches = [];
	// Collect compatible classes and the models they are specifically compatible with,
	// discarding class's with duplicate symbolic names
	for ( var i = 0, iLen = models.length; i < iLen; i++ ) {
		var model = models[ i ];
		var classes = collect( model );
		for ( var j = 0, jLen = classes.length; j < jLen; j++ ) {
			var name = classes[ j ].static.name;
			if ( !names[ name ] ) {
				matches.push( { name: name, model: model } );
			}
			names[ name ] = true;
		}
	}

	return matches;
};
