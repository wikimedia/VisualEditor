/*!
 * VisualEditor ModelRegistry class.
 *
 * @copyright See AUTHORS.txt
 */
( function () {

	/**
	 * Registry for models.
	 *
	 * To register a new model type, call #register.
	 *
	 * @extends OO.Registry
	 * @constructor
	 */
	ve.dm.ModelRegistry = function VeDmModelRegistry() {
		// Parent constructor
		OO.Registry.call( this );
		// Map of func presence and tag names to model names
		// [ Map( tagName => [modelNamesWithoutFunc] ), Map( tagName => [modelNamesWithFunc] ) ]
		this.modelsByTag = [ new Map(), new Map() ];
		// Map of func presence and rdfaTypes to model names; only rdfaTypes specified as strings are in here
		// { matchFunctionPresence: { rdfaType: { tagName: [modelNames] } } }
		// [ Map( rdfaType => Map( tagName => [modelNamesWithoutFunc] ) ), Map( rdfaType => Map( tagName => [modelNamesWithFunc] ) ) ]
		this.modelsByTypeAndTag = [ new Map(), new Map() ];
		// Map of func presence to array of model names with rdfaType regexps
		// [ [modelNamesWithoutFunc], [modelNamesWithFunc] ]
		this.modelsWithTypeRegExps = [ [], [] ];
		// Map tracking registration order
		// Map( nameA => 0, nameB => 1, … )
		this.registrationOrder = new Map();
		this.nextNumber = 0;
		this.extSpecificTypes = [];
	};

	/* Inheritance */

	OO.inheritClass( ve.dm.ModelRegistry, OO.Registry );

	/* Private helper functions */

	/**
	 * Get a child of an Array or Map
	 *
	 * @private
	 * @param {Array|Map} container
	 * @param {number|string} key
	 * @return {any}
	 */
	function getChild( container, key ) {
		return container instanceof Map ? container.get( key ) : container[ key ];
	}

	/**
	 * Get a value from nested Arrays/Maps, or undefined if any level is missing
	 *
	 * @private
	 * @param {Array|Map} container
	 * @param {...(number|string)} keys
	 * @return {any}
	 */
	function getNested( container, ...keys ) {
		for ( const key of keys ) {
			if ( container === undefined ) {
				return undefined;
			}
			container = getChild( container, key );
		}
		return container;
	}

	/**
	 * Helper function for register(). Adds a value to the front of an array in nested Arrays/Maps.
	 * Maps and arrays are created if needed. You can specify one or more keys and a value.
	 *
	 * Specifically:
	 *
	 * - `addType( obj, keyA, value )` does `obj[keyA].unshift( value );`
	 * - `addType( obj, keyA, keyB, value )` does `obj[keyA].get(keyB).unshift( value )`;
	 * - etc.
	 *
	 * @private
	 * @param {Array|Map} obj Container the array resides in
	 * @param {...(number|string)} keys
	 * @param {any} value
	 */
	function addType( obj, ...keys ) {
		const value = keys.pop();
		const lastKey = keys.pop();
		let o = obj;

		for ( const key of keys ) {
			if ( getChild( o, key ) === undefined ) {
				o.set( key, new Map() );
			}
			o = getChild( o, key );
		}
		let arr = getChild( o, lastKey );
		if ( !arr ) {
			arr = [];
			if ( o instanceof Map ) {
				o.set( lastKey, arr );
			} else {
				o[ lastKey ] = arr;
			}
		}
		arr.unshift( value );
	}

	/**
	 * Helper function for unregister().
	 *
	 * Same arguments as addType, except removes the type from the list.
	 *
	 * @private
	 * @param {Array|Map} obj Container the array resides in
	 * @param {...(number|string)} keys
	 * @param {any} value to remove
	 */
	function removeType( obj, ...keys ) {
		const value = keys.pop(),
			arr = getNested( obj, ...keys );

		if ( arr ) {
			const index = arr.indexOf( value );
			if ( index !== -1 ) {
				arr.splice( index, 1 );
			}
			// TODO: Prune empty array and empty containing objects
		}
	}

	/* Public methods */

	/**
	 * Register a model type.
	 *
	 * @param {ve.dm.Model} constructor Subclass of ve.dm.Model
	 * @throws {Error} Model names must be strings and must not be empty
	 * @throws {Error} Models must be subclasses of ve.dm.Model
	 * @throws {Error} No factory associated with this ve.dm.Model subclass
	 */
	ve.dm.ModelRegistry.prototype.register = function ( constructor ) {
		const name = constructor.static && constructor.static.name;

		if ( typeof name !== 'string' || name === '' ) {
			throw new Error( 'Model names must be strings and must not be empty' );
		}
		if ( !( constructor.prototype instanceof ve.dm.Model ) ) {
			throw new Error( 'Models must be subclasses of ve.dm.Model' );
		}
		if ( this.lookup( name ) === constructor ) {
			// Don't allow double registration as it would create duplicate
			// entries in various caches.
			return;
		}

		// Register the model with the right factory
		if ( constructor.prototype instanceof ve.dm.Annotation ) {
			ve.dm.annotationFactory.register( constructor );
		} else if ( constructor.prototype instanceof ve.dm.Node ) {
			ve.dm.nodeFactory.register( constructor );
		} else {
			throw new Error( 'No factory associated with this ve.dm.Model subclass' );
		}

		// Parent method
		ve.dm.ModelRegistry.super.prototype.register.call( this, name, constructor );

		const tags = constructor.static.matchTagNames === null ?
			[ '' ] :
			constructor.static.matchTagNames;
		const types = constructor.static.getMatchRdfaTypes() === null ?
			[ '' ] :
			constructor.static.getMatchRdfaTypes();

		tags.forEach( ( tag ) => {
			// +!!foo is a shorter equivalent of Number( Boolean( foo ) ) or foo ? 1 : 0
			addType( this.modelsByTag, +!!constructor.static.matchFunction,
				tag, name
			);
		} );
		types.forEach( ( type ) => {
			if ( type instanceof RegExp ) {
				// TODO: Guard against running this again during subsequent
				// iterations of the for loop
				addType( this.modelsWithTypeRegExps, +!!constructor.static.matchFunction, name );
			} else {
				tags.forEach( ( tag ) => {
					addType( this.modelsByTypeAndTag,
						+!!constructor.static.matchFunction, type, tag, name
					);
				} );
			}
		} );

		this.registrationOrder.set( name, this.nextNumber++ );
	};

	/**
	 * Unregister a model type.
	 *
	 * @param {ve.dm.Model} constructor Subclass of ve.dm.Model
	 * @throws {Error} Model names must be strings and must not be empty
	 * @throws {Error} Models must be subclasses of ve.dm.Model
	 * @throws {Error} No factory associated with this ve.dm.Model subclass
	 */
	ve.dm.ModelRegistry.prototype.unregister = function ( constructor ) {
		const name = constructor.static && constructor.static.name;

		if ( typeof name !== 'string' || name === '' ) {
			throw new Error( 'Model names must be strings and must not be empty' );
		}
		if ( !( constructor.prototype instanceof ve.dm.Model ) ) {
			throw new Error( 'Models must be subclasses of ve.dm.Model' );
		}

		// Unregister the model from the right factory
		if ( constructor.prototype instanceof ve.dm.Annotation ) {
			ve.dm.annotationFactory.unregister( constructor );
		} else if ( constructor.prototype instanceof ve.dm.Node ) {
			ve.dm.nodeFactory.unregister( constructor );
		} else {
			throw new Error( 'No factory associated with this ve.dm.Model subclass' );
		}

		// Parent method
		ve.dm.ModelRegistry.super.prototype.unregister.call( this, name );

		const tags = constructor.static.matchTagNames === null ?
			[ '' ] :
			constructor.static.matchTagNames;
		const types = constructor.static.getMatchRdfaTypes() === null ?
			[ '' ] :
			constructor.static.getMatchRdfaTypes();

		tags.forEach( ( tag ) => {
			// +!!foo is a shorter equivalent of Number( Boolean( foo ) ) or foo ? 1 : 0
			removeType( this.modelsByTag, +!!constructor.static.matchFunction,
				tag, name
			);
		} );
		types.forEach( ( type ) => {
			if ( type instanceof RegExp ) {
				// TODO: Guard against running this again during subsequent
				// iterations of the for loop
				removeType( this.modelsWithTypeRegExps, +!!constructor.static.matchFunction, name );
			} else {
				tags.forEach( ( tag ) => {
					removeType( this.modelsByTypeAndTag,
						+!!constructor.static.matchFunction, type, tag, name
					);
				} );
			}
		} );

		this.registrationOrder.delete( name );
	};

	/**
	 * Determine which model best matches the given node
	 *
	 * Model matching works as follows:
	 *
	 * Get all models whose tag and rdfaType rules match
	 *
	 * Rank them in order of specificity:
	 *
	 * - tag, rdfaType and func specified
	 * - rdfaType and func specified
	 * - tag and func specified
	 * - func specified
	 * - tag and rdfaType specified
	 * - rdfaType specified
	 * - tag specified
	 * - nothing specified
	 *
	 * If there are multiple candidates with the same specificity, exact matches of strings take precedence over
	 * matches of regular expressions. If there are still multiple candidates, they are ranked in reverse
	 * order of registration (i.e. if A was registered before B, B will rank above A).
	 * The highest-ranking model whose test function does not return false, wins.
	 *
	 * @param {Node} node Node to match (usually an HTMLElement but can also be a Comment node)
	 * @param {Node[]} [aboutGroup] If present and containing more than just node, only match models with about grouping enabled; will be passed to matchFunction
	 * @param {string[]} [excludeTypes] Model names to exclude when matching
	 * @return {string|null} Model type, or null if none found
	 */
	ve.dm.ModelRegistry.prototype.matchElement = function ( node, aboutGroup, excludeTypes ) {
		const nodeName = node.nodeName.toLowerCase();
		const types = [];
		if ( !aboutGroup ) {
			aboutGroup = [ node ];
		}
		const forceAboutGrouping = aboutGroup.length > 1;

		const byRegistrationOrderDesc = ( a, b ) => this.registrationOrder.get( b ) - this.registrationOrder.get( a );

		const matchTypeRegExps = ( type, tag, withFunc ) => {
			const matchedModels = [],
				models = this.modelsWithTypeRegExps[ +withFunc ];
			models.forEach( ( name ) => {
				if ( excludeTypes && excludeTypes.includes( name ) ) {
					return;
				}
				const matchTypes = this.registry[ name ].static.getMatchRdfaTypes();
				matchTypes.forEach( ( matchType ) => {
					if (
						matchType instanceof RegExp &&
						matchType.test( type ) &&
						(
							( tag === '' && this.registry[ name ].static.matchTagNames === null ) ||
							( this.registry[ name ].static.matchTagNames || [] ).includes( tag )
						)
					) {
						matchedModels.push( name );
					}
				} );
			} );
			return matchedModels;
		};

		const allTypesAllowed = ( model ) => {
			let allowedTypes = model.static.getAllowedRdfaTypes();
			const matchTypes = model.static.getMatchRdfaTypes();

			// All types allowed
			if ( allowedTypes === null ) {
				return true;
			}

			if ( matchTypes !== null ) {
				// Don't modify allowedTypes as it is a pointer to the original array
				allowedTypes = allowedTypes.concat( matchTypes );
			}

			function checkType( rule, type ) {
				return rule instanceof RegExp ? rule.test( type ) : rule === type;
			}

			return types.every(
				( type ) => allowedTypes.some(
					( allowedType ) => checkType( allowedType, type )
				)
			);
		};

		const matchWithFunc = ( tag ) => {
			let queue = [],
				queue2 = [];
			types.forEach( ( type ) => {
				// Queue string matches and regexp matches separately
				ve.batchPush( queue, getNested( this.modelsByTypeAndTag, 1, type, tag ) || [] );
				if ( excludeTypes ) {
					queue = OO.simpleArrayDifference( queue, excludeTypes );
				}
				ve.batchPush( queue2, matchTypeRegExps( type, tag, true ) );
			} );
			// Filter out matches which contain types which aren't allowed
			queue = queue.filter( ( name ) => allTypesAllowed( this.lookup( name ) ) );
			queue2 = queue2.filter( ( name ) => allTypesAllowed( this.lookup( name ) ) );
			if ( forceAboutGrouping ) {
				// Filter out matches that don't support about grouping
				queue = queue.filter( ( name ) => this.registry[ name ].static.enableAboutGrouping );
				queue2 = queue2.filter( ( name ) => this.registry[ name ].static.enableAboutGrouping );
			}
			// Try string matches first, then regexp matches
			queue.sort( byRegistrationOrderDesc );
			queue2.sort( byRegistrationOrderDesc );
			ve.batchPush( queue, queue2 );

			return queue.find( ( name ) => this.registry[ name ].static.matchFunction( node, aboutGroup ) ) || null;
		};

		const matchWithoutFunc = ( tag ) => {
			let queue = [],
				queue2 = [],
				winningName = null;
			types.forEach( ( type ) => {
				// Queue string and regexp matches separately
				ve.batchPush( queue, getNested( this.modelsByTypeAndTag, 0, type, tag ) || [] );
				if ( excludeTypes ) {
					queue = OO.simpleArrayDifference( queue, excludeTypes );
				}
				ve.batchPush( queue2, matchTypeRegExps( type, tag, false ) );
			} );
			// Filter out matches which contain types which aren't allowed
			queue = queue.filter( ( name ) => allTypesAllowed( this.lookup( name ) ) );
			queue2 = queue2.filter( ( name ) => allTypesAllowed( this.lookup( name ) ) );
			if ( forceAboutGrouping ) {
				// Filter out matches that don't support about grouping
				queue = queue.filter( ( name ) => this.registry[ name ].static.enableAboutGrouping );
				queue2 = queue2.filter( ( name ) => this.registry[ name ].static.enableAboutGrouping );
			}
			// Only try regexp matches if there are no string matches
			queue = queue.length > 0 ? queue : queue2;
			// Find most recently registered
			queue.forEach( ( name ) => {
				if (
					winningName === null ||
					this.registrationOrder.get( winningName ) < this.registrationOrder.get( name )
				) {
					winningName = name;
				}
			} );
			return winningName;
		};

		if ( node.getAttribute ) {
			if ( node.getAttribute( 'rel' ) ) {
				types.push( ...node.getAttribute( 'rel' ).trim().split( /\s+/ ) );
			}
			if ( node.getAttribute( 'typeof' ) ) {
				types.push( ...node.getAttribute( 'typeof' ).trim().split( /\s+/ ) );
			}
			if ( node.getAttribute( 'property' ) ) {
				types.push( ...node.getAttribute( 'property' ).trim().split( /\s+/ ) );
			}
		}

		let winner;
		if ( types.length ) {
			// func+tag+type match
			winner = matchWithFunc( nodeName );
			if ( winner !== null ) {
				return winner;
			}

			// func+type match
			// Only look at rules with no tag specified; if a rule does specify a tag, we've
			// either already processed it above, or the tag doesn't match
			winner = matchWithFunc( '' );
			if ( winner !== null ) {
				return winner;
			}
		}

		// func+tag match
		const funcAndTagMatches = getNested( this.modelsByTag, 1, nodeName ) || [];
		// No need to sort because individual arrays in modelsByTag are already sorted
		// correctly
		const funcAndTagMatched = funcAndTagMatches.find( ( match ) => {
			const model = this.registry[ match ];
			// Only process this one if it doesn't specify types
			// If it does specify types, then we've either already processed it in the
			// func+tag+type step above, or its type rule doesn't match
			return model.static.getMatchRdfaTypes() === null && model.static.matchFunction( node, aboutGroup ) && allTypesAllowed( model );
		} );
		if ( funcAndTagMatched ) {
			return funcAndTagMatched;
		}

		// func only
		// We only need to get the [''][''] array because the other arrays were either
		// already processed during the steps above, or have a type or tag rule that doesn't
		// match this node.
		// No need to sort because individual arrays in modelsByTypeAndTag are already sorted
		// correctly
		const typeAndTagMatches = getNested( this.modelsByTypeAndTag, 1, '', '' ) || [];
		const typeAndTagMatched = typeAndTagMatches.find( ( name ) => {
			const model = this.registry[ name ];
			return model.static.matchFunction( node, aboutGroup ) && allTypesAllowed( model );
		} );
		if ( typeAndTagMatched ) {
			return typeAndTagMatched;
		}

		// tag+type
		winner = matchWithoutFunc( nodeName );
		if ( winner !== null ) {
			return winner;
		}

		// type only
		// Only look at rules with no tag specified; if a rule does specify a tag, we've
		// either already processed it above, or the tag doesn't match
		winner = matchWithoutFunc( '' );
		if ( winner !== null ) {
			return winner;
		}

		// tag only
		const tagOnlyMatches = getNested( this.modelsByTag, 0, nodeName ) || [];
		// No need to track winningName because the individual arrays in modelsByTag are
		// already sorted correctly
		const tagOnlyMatched = tagOnlyMatches.find( ( name ) => {
			const model = this.registry[ name ];
			// Only process this one if it doesn't specify types
			// If it does specify types, then we've either already processed it in the
			// tag+type step above, or its type rule doesn't match
			return model.static.getMatchRdfaTypes() === null && allTypesAllowed( model );
		} );
		if ( tagOnlyMatched ) {
			return tagOnlyMatched;
		}

		// Rules with no type or tag specified
		// These are the only rules that can still qualify at this point, the others we've either
		// already processed or have a type or tag rule that disqualifies them
		const otherMatches = getNested( this.modelsByTypeAndTag, 0, '', '' ) || [];
		const otherMatched = otherMatches.find( ( name ) => {
			const model = this.registry[ name ];
			return allTypesAllowed( model );
		} );
		if ( otherMatched ) {
			return otherMatched;
		}

		// We didn't find anything, give up
		return null;
	};

	/**
	 * Tests whether a node will be modelled as an annotation
	 *
	 * @param {Node} node The node
	 * @return {boolean} Whether the element will be modelled as an annotation
	 */
	ve.dm.ModelRegistry.prototype.isAnnotation = function ( node ) {
		const modelClass = this.lookup( this.matchElement( node ) );
		return ( modelClass && modelClass.prototype ) instanceof ve.dm.Annotation;
	};

	/* Initialization */

	ve.dm.modelRegistry = new ve.dm.ModelRegistry();

}() );
