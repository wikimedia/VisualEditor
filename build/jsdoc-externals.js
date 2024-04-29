'use strict';

// eslint-disable-next-line n/no-missing-require
const helper = require( 'jsdoc/util/templateHelper' );
// eslint-disable-next-line n/no-missing-require
const conf = require( 'jsdoc/env' ).conf;
const wmfConf = ( conf.templates && conf.templates.wmf ) || {};
const prefixMap = wmfConf.prefixMap || {};
const prefixMapIgnore = wmfConf.prefixMapIgnore || [];
const linkMap = wmfConf.linkMap || {};

// eslint-disable-next-line n/no-missing-require
const parseType = require( 'jsdoc/tag/type' ).parse;

function extractNames( parsedType, names = [] ) {
	if ( parsedType.type === 'NameExpression' ) {
		names.push( parsedType.name );
	} else if ( parsedType.type === 'TypeApplication' ) {
		parsedType.applications.forEach( ( p ) => extractNames( p, names ) );
	}
	return names;
}

/**
 * Automatically register links to known external types when they are encountered
 */
exports.handlers = {
	newDoclet: function ( e ) {
		let types = [];

		if ( e.doclet.kind === 'class' ) {
			if ( e.doclet.augments ) {
				types.push.apply( types, e.doclet.augments );
			}

			if ( e.doclet.implements ) {
				types.push.apply( types, e.doclet.implements );
			}

			if ( e.doclet.mixes ) {
				types.push.apply( types, e.doclet.mixes );
			}

			if ( e.doclet.params ) {
				e.doclet.params.forEach( function ( param ) {
					if ( param.type && param.type.names ) {
						types.push.apply( types, param.type.names );
					}
				} );
			}

			// Check if the class returns the target class type
			if ( e.doclet.returns ) {
				e.doclet.returns.forEach( function ( returnType ) {
					if ( returnType.type && returnType.type.names ) {
						types.push.apply( types, returnType.type.names );
					}
				} );
			}
		} else if ( e.doclet.kind === 'function' ) { // Check if this is a function/method
			// Check if the function/method has parameters with the target class type
			if ( e.doclet.params ) {
				e.doclet.params.forEach( function ( param ) {
					if ( param.type && param.type.names ) {
						types.push.apply( types, param.type.names );
					}
				} );
			}

			// Check if the function/method returns the target class type
			if ( e.doclet.returns ) {
				e.doclet.returns.forEach( function ( returnType ) {
					if ( returnType.type && returnType.type.names ) {
						types.push.apply( types, returnType.type.names );
					}
				} );
			}
		}

		types = types.reduce( ( acc, val ) => {
			if ( /^[a-z0-9.]+$/i.test( val ) ) {
				// Optimisation: If the type is (namespaced) alphanumeric, then
				// the value itself is the type, e.g. 'foo.bar.Baz1'
				acc.push( val );
			} else {
				// A more complex type, parse and extract types recursively,
				// e.g. 'Object.<string,Foo[]>'
				const parsedType = parseType( '{' + val + '}', false, true ).parsedType;
				acc.push.apply( acc, extractNames( parsedType ) );
			}
			return acc;
		}, [] );

		types.forEach( ( type ) => {
			Object.keys( prefixMap ).some( ( prefix ) => {
				if (
					// Ignore anything explicitly defined in the linkMap
					!linkMap[ type ] &&
					type.startsWith( prefix ) &&
					prefixMapIgnore.every( ( ignore ) => !type.startsWith( ignore ) )
				) {
					helper.registerLink( type, prefixMap[ prefix ].replace( /\{type\}/g, type ) );
					// Break, so we don't match a shorter prefix
					return true;
				}
				return false;
			} );
		} );
	}
};
