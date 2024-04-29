'use strict';

// eslint-disable-next-line n/no-missing-require
const helper = require( 'jsdoc/util/templateHelper' );
// eslint-disable-next-line n/no-missing-require
const conf = require( 'jsdoc/env' ).conf;
const wmfConf = ( conf.templates && conf.templates.wmf ) || {};
const prefixMap = wmfConf.prefixMap || {};
const linkMap = wmfConf.linkMap || {};

/**
 * Automatically register links to known external types when they are encountered
 */
exports.handlers = {
	newDoclet: function ( e ) {
		const types = [];

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

		types.forEach( ( type ) => {
			Object.keys( prefixMap ).some( ( prefix ) => {
				if (
					// Ignore anything explicitly defined in the linkMap
					!linkMap[ type ] &&
					type.startsWith( prefix )
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
