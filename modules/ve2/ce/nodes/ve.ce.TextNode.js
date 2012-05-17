/**
 * ContentEditable node for text.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.TextNode} Model to observe
 */
ve.ce.TextNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, 'text', model, $( document.createTextNode('') ) );
	
	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );

	// Intialization
	this.onUpdate();
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.TextNode.rules = {
	'canBeSplit': true
};

/**
 * Mapping of character and HTML entities or renderings.
 *
 * @static
 * @member
 */
ve.ce.TextNode.htmlCharacters = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'\'': '&#039;',
	'"': '&quot;',
	'\n': '<span class="ve-ce-content-whitespace">&#182;</span>',
	'\t': '<span class="ve-ce-content-whitespace">&#8702;</span>'
};

/**
 * List of annotation rendering implementations.
 *
 * Each supported annotation renderer must have an open and close property, each either a string or
 * a function which accepts a data argument.
 *
 * @static
 * @member
 */
ve.ce.TextNode.annotationRenderers = {
	'object/hook': {
		'open': function( data ) {
			return '<span class="ve-ce-content-format-object">' + data.html;
		},
		'close': '</span>'
	},
	'textStyle/bold': {
		'open': '<b>',
		'close': '</b>'
	},
	'textStyle/italic': {
		'open': '<i>',
		'close': '</i>'
	},
	'textStyle/underline': {
		'open': '<u>',
		'close': '</u>'
	},
	'textStyle/strong': {
		'open': '<span class="ve-ce-content-format-textStyle-strong">',
		'close': '</span>'
	},
	'textStyle/emphasize': {
		'open': '<span class="ve-ce-content-format-textStyle-emphasize">',
		'close': '</span>'
	},
	'textStyle/big': {
		'open': '<span class="ve-ce-content-format-textStyle-big">',
		'close': '</span>'
	},
	'textStyle/small': {
		'open': '<span class="ve-ce-content-format-textStyle-small">',
		'close': '</span>'
	},
	'textStyle/superScript': {
		'open': '<span class="ve-ce-content-format-textStyle-superScript">',
		'close': '</span>'
	},
	'textStyle/subScript': {
		'open': '<span class="ve-ce-content-format-textStyle-subScript">',
		'close': '</span>'
	},
	'link/external': {
		'open': function( data ) {
			return '<span class="ve-ce-content-format-link" data-href="' + data.href + '">';
		},
		'close': '</span>'
	},
	'link/internal': {
		'open': function( data ) {
			return '<span class="ve-ce-content-format-link" data-title="wiki/' + data.title + '">';
		},
		'close': '</span>'
	}
};

/* Methods */

/**
 * Responds to model update events.
 *
 * If the source changed since last update the image's src attribute will be updated accordingly.
 *
 * @method
 */
ve.ce.TextNode.prototype.onUpdate = function() {
	var $new = $( $( '<span>' + this.getHtml() + '</span>' ).contents() );
	this.$.replaceWith( $new );
	this.$ = $new;
};

/**
 * Gets an HTML rendering of data within content model.
 *
 * @method
 * @param {String} Rendered HTML of data within content model
 */
ve.ce.TextNode.prototype.getHtml = function() {
	var data = this.model.getDocument().getDataFromNode( this.model ),
		htmlChars = ve.ce.TextNode.htmlCharacters,
		renderers = ve.ce.TextNode.annotationRenderers,
		out = '',
		left = '',
		right,
		leftPlain,
		rightPlain,
		hashStack = [],
		annotationStack = {};

	var openAnnotations = function( annotations ) {
		var out = '',
			annotation;

		for ( var hash in annotations ) {
			annotation = annotations[hash];
			out += typeof renderers[annotation.type].open === 'function'
				? renderers[annotation.type].open( annotation.data )
				: renderers[annotation.type].open;
			hashStack.push( hash );
			annotationStack[hash] = annotation;
		}
		return out;
	};

	var closeAnnotations = function( annotations ) {
		var out = '',
			annotation;

		for ( var hash in annotations ) {
			annotation = annotations[hash];
			out += typeof renderers[annotation.type].close === 'function'
				? renderers[annotation.type].close( annotation.data )
				: renderers[annotation.type].close;

			// new version
			hashStack.pop();
			delete annotationStack[hash];

			// old version
			/*
			var depth = hashStack.indexOf( hash );
			if ( depth !== -1 ) {
				console.log(depth, hashStack.length);
				hashStack.splice( depth, 1 );
				delete annotationStack[hash];
			}
			*/
		}
		return out;
	};

	for ( var i = 0; i < data.length; i++ ) {
		right = data[i];
		leftPlain = typeof left === 'string';
		rightPlain = typeof right === 'string';
		
		if ( !leftPlain && rightPlain ) {
			// [formatted][plain]
			var close = {};
			for ( var j = hashStack.length - 1; j >= 0; j-- ) {
				close[hashStack[j]] = annotationStack[hashStack[j]];
			}
			out += closeAnnotations( close );	
		} else if ( leftPlain && !rightPlain ) {
			// [plain][formatted]
			out += openAnnotations( right[1] );
		} else if ( !leftPlain && !rightPlain ) {
			// [formatted][formatted]

			// setting index to undefined is is necessary to it does not use value from
			// the previous iteration
			var	open = {},
				index = undefined;

			for ( var hash in left[1] ) {
				if ( !( hash in right[1] ) ) {
					index = ( index === undefined )
						? hashStack.indexOf( hash )
						: Math.min( index, hashStack.indexOf( hash ) );
				}
			}

			if ( index !== undefined ) {
				var close = {};
				for ( var j = hashStack.length - 1; j >= index; j-- ) {
					close[hashStack[j]] = annotationStack[hashStack[j]];
				}

				for ( var j = index; j < hashStack.length; j++ ) {
					if ( hashStack[j] in right[1] && hashStack[j] in left[1] ) {
						open[hashStack[j]] = annotationStack[hashStack[j]];
					}
				}
				out += closeAnnotations( close );
			}

			for ( var hash in right[1] ) {
				if ( !( hash in left[1] ) ) {
					open[hash] = right[1][hash];
				}
			}

			out += openAnnotations( open );
		}

		var chr = rightPlain ? right : right[0];
		out += chr in htmlChars ? htmlChars[chr] : chr;
		left = right;
	}

	var close = {};
	for ( var j = hashStack.length - 1; j >= 0; j-- ) {
		close[hashStack[j]] = annotationStack[hashStack[j]];
	}
	out += closeAnnotations( close );	

	return out;
};

/* Registration */

ve.ce.factory.register( 'text', ve.ce.TextNode );

/* Inheritance */

ve.extendClass( ve.ce.TextNode, ve.ce.LeafNode );