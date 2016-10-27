/*!
 * VisualEditor debugging methods.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-disable no-console */

/**
 * @property {boolean} debug
 * @member ve
 */
ve.debug = true;

/**
 * @class ve.debug
 * @override ve
 * @singleton
 */

/* Methods */

/**
 * Logs data to the console.
 *
 * @method
 * @param {...Mixed} [data] Data to log
 */
ve.log = function () {
	// Support: IE9
	// In IE9 console methods are not real functions and as such do not inherit
	// from Function.prototype, thus console.log.apply does not exist.
	// However it is function-like enough that passing it to Function#apply does work.
	Function.prototype.apply.call( console.log, console, arguments );
};

/**
 * Logs error to the console.
 *
 * @method
 * @param {...Mixed} [data] Data to log
 */
ve.error = function () {
	// Support: IE9
	// In IE9 console methods are not real functions and as such do not inherit
	// from Function.prototype, thus console.error.apply does not exist.
	// However it is function-like enough that passing it to Function#apply does work.
	Function.prototype.apply.call( console.error, console, arguments );
};

/**
 * Logs an object to the console.
 *
 * @method
 * @param {Object} obj Object to log
 */
ve.dir = function () {
	Function.prototype.apply.call( console.dir, console, arguments );
};

/**
 * Like outerHTML serialization, but wraps each text node in a fake tag. This
 * makes it obvious whether there are split text nodes present.
 *
 * @param {Node} domNode The node to serialize
 * @return {string} Serialization of the node and its contents
 */
ve.serializeNodeDebug = function ( domNode ) {
	var html = [];
	function add( node ) {
		var i, len, attr;

		if ( node.nodeType === Node.TEXT_NODE ) {
			html.push( '<#text>', ve.escapeHtml( node.textContent ), '</#text>' );
			return;
		} else if ( node.nodeType !== Node.ELEMENT_NODE ) {
			html.push( '<#unknown type=\'' + node.nodeType + '\'/>' );
			return;
		}
		// else node.nodeType === Node.ELEMENT_NODE

		html.push( '<', ve.escapeHtml( node.nodeName.toLowerCase() ) );
		for ( i = 0, len = node.attributes.length; i < len; i++ ) {
			attr = node.attributes[ i ];
			html.push(
				' ',
				ve.escapeHtml( attr.name ),
				// Single quotes are less annoying in JSON escaping
				'=\'',
				ve.escapeHtml( attr.value ),
				'\''
			);
		}
		html.push( '>' );
		for ( i = 0, len = node.childNodes.length; i < len; i++ ) {
			add( node.childNodes[ i ] );
		}
		html.push( '</', ve.escapeHtml( node.nodeName.toLowerCase() ), '>' );
	}
	add( domNode );
	return html.join( '' );
};

/**
 * Get a human-readable summary of a transaction
 *
 * @param {ve.dm.Transaction} tx A transaction
 * @return {string} Human-readable summary
 */
ve.summarizeTransaction = function ( tx ) {
	var annotations = 0;
	function summarizeItems( items ) {
		return '\'' + items.map( function ( item ) {
			if ( item.type ) {
				return '<' + item.type + '>';
			} else if ( Array.isArray( item ) ) {
				return item[ 0 ];
			} else if ( typeof item === 'string' ) {
				return item;
			} else {
				throw new Error( 'Unknown item type: ' + item );
			}
		} ).join( '' ) + '\'';
	}
	return '(' + tx.author + ' ' + tx.operations.map( function ( op ) {
		if ( op.type === 'retain' ) {
			return ( annotations ? 'annotate ' : 'retain ' ) + op.length;
		} else if ( op.type === 'replace' ) {
			if ( op.remove.length === 0 ) {
				return 'insert ' + summarizeItems( op.insert );
			} else if ( op.insert.length === 0 ) {
				return 'remove ' + summarizeItems( op.remove );
			} else {
				return 'replace ' + summarizeItems( op.remove ) +
					' -> ' + summarizeItems( op.insert );
			}
		} else if ( op.type === 'attribute' ) {
			return 'attribute';
		} else if ( op.type === 'annotate' ) {
			annotations += op.bias === 'start' ? 1 : -1;
			return 'annotate';
		} else if ( op.type.endsWith( 'Metadata' ) ) {
			// We don't care much because we're deprecating metadata ops
			return 'metadata';
		} else {
			throw new Error( 'Unknown op type: ' + op.type );
		}
	} ).join( ', ' ) + ')';
};
