'use strict';

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow setting href on DOM nodes without sanitizing.',
			category: 'Security'
		},
		schema: [],
		messages: {
			noHref: 'Don\'t set \'href\' without sanitizing; use ve.setAttributeSafe.'
		}
	},
	create( context ) {
		return {
			// element.href = ...
			AssignmentExpression( node ) {
				if (
					node.left.type === 'MemberExpression' &&
					!node.left.computed &&
					node.left.property.type === 'Identifier' &&
					node.left.property.name === 'href' &&
					node.right.type !== 'Literal'
				) {
					// Allow location.href
					if (
						node.left.object &&
						node.left.object.type === 'Identifier' &&
						node.left.object.name === 'location'
					) {
						return;
					}
					context.report( { node, messageId: 'noHref' } );
				}
			},

			// $element.attr( ... )
			CallExpression( node ) {
				if (
					node.callee.type === 'MemberExpression' &&
					!node.callee.computed &&
					node.callee.property.type === 'Identifier' &&
					node.callee.property.name === 'attr'
				) {
					// $element.attr( 'href', ... )
					if (
						node.arguments.length >= 2 &&
						node.arguments[ 0 ].type === 'Literal' &&
						node.arguments[ 0 ].value === 'href' &&
						node.arguments[ 1 ].type !== 'Literal'
					) {
						context.report( { node, messageId: 'noHref' } );
					}
					// $element.attr( { href: ... } )
					if (
						node.arguments.length >= 1 &&
						node.arguments[ 0 ].type === 'ObjectExpression'
					) {
						for ( const prop of node.arguments[ 0 ].properties ) {
							if (
								prop.type === 'Property' &&
								!prop.computed &&
								prop.key.type === 'Identifier' &&
								prop.key.name === 'href' &&
								prop.value.type !== 'Literal'
							) {
								context.report( { node: prop, messageId: 'noHref' } );
							}
						}
					}
				}

				// element.setAttribute('href', ...)
				// element.setAttributeNS('href', ...)
				if (
					node.callee.type === 'MemberExpression' &&
					!node.callee.computed &&
					node.callee.property.type === 'Identifier' &&
					node.arguments.length >= 2 &&
					node.arguments[ 0 ].type === 'Literal' && (
						(
							node.callee.property.name === 'setAttribute' &&
							node.arguments[ 0 ].value === 'href' &&
							node.arguments[ 1 ].type !== 'Literal'
						) || (
							node.callee.property.name === 'setAttributeNS' &&
							node.arguments[ 1 ].value === 'href' &&
							node.arguments[ 2 ].type !== 'Literal'
						)
					)
				) {
					context.report( { node, messageId: 'noHref' } );
				}
			}
		};
	}
};
