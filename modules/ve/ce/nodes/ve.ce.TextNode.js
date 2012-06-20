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
	this.onUpdate( true );
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
	'\n': '&crarr;',
	'\t': '&#10142;'
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
		'open': '<strong>',
		'close': '</strong>'
	},
	'textStyle/emphasize': {
		'open': '<em>',
		'close': '<em>'
	},
	'textStyle/big': {
		'open': '<big>',
		'close': '</big>'
	},
	'textStyle/small': {
		'open': '<small>',
		'close': '</small>'
	},
	'textStyle/superScript': {
		'open': '<sup>',
		'close': '</sup>'
	},
	'textStyle/subScript': {
		'open': '<sub>',
		'close': '</sub>'
	},
	'link/extLink': {
		'open': function( data ) {
			return '<a href="' + data.href + '">';
		},
		'close': '</a>'
	},
	'link/wikiLink': {
		'open': function( data ) {
			return '<a href="' + data.href + '">';
		},
		'close': '</a>'
	},
	'link/unknown': {
		'open': function( data ) {
			return '<a href="#">';
		},
		'close': '</a>'
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
ve.ce.TextNode.prototype.onUpdate = function( force ) {
	if ( force === true || this.getSurface().render === true ) {
		var $new = $( $( '<span>' + this.getHtml() + '</span>' ).contents() );
		if ( $new.length === 0 ) {
			$new = $new.add( document.createTextNode( '' ) );
		}
		this.$.replaceWith( $new );
		this.$ = $new;
		if ( this.parent ) {
			this.parent.clean();
			if ( ve.debug ) {
				this.parent.$.css('background-color', '#F6F6F6');
				setTimeout( ve.proxy( function() {
					this.parent.$.css('background-color', 'transparent');
				}, this ), 350 );
			}
		}
	}
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
		i,
		j,
		hash,
		left = '',
		right,
		open,
		close,
		index,
		leftPlain,
		rightPlain,
		hashStack = [],
		annotationStack = {};

	var replaceWithNonBreakingSpace = function( index, data ) {
		if ( ve.isArray( data[index] ) ) {
			data[index][0] = '&nbsp;';
		} else {
			data[index] = '&nbsp;';
		}
	};
	if ( data.length > 0 ) {
		if ( data[0] === ' ') {
			replaceWithNonBreakingSpace( 0, data );
		}
	}
	if ( data.length > 1 ) {
		if ( data[ data.length - 1 ] === ' ') {
			replaceWithNonBreakingSpace( data.length - 1, data );
		}
	}
	if ( data.length > 2 ) {
		for ( var i = 1; i < data.length - 1; i++ ) {
			if ( data[i] === ' ' && data[i + 1] === ' ') {
				replaceWithNonBreakingSpace( i + 1, data );
				i++;
			}
		}
	}

	var openAnnotations = function( annotations ) {
		var out = '',
			annotation;

		for ( var hash in annotations ) {
			annotation = annotations[hash];
			out += typeof renderers[annotation.type].open === 'function' ?
				renderers[annotation.type].open( annotation.data ) :
				renderers[annotation.type].open;
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
			out += typeof renderers[annotation.type].close === 'function' ?
				renderers[annotation.type].close( annotation.data ) :
				renderers[annotation.type].close;

			// new version
			hashStack.pop();
			delete annotationStack[hash];

			// old version
			/*
			var depth = hashStack.indexOf( hash );
			if ( depth !== -1 ) {
				ve.log(depth, hashStack.length);
				hashStack.splice( depth, 1 );
				delete annotationStack[hash];
			}
			*/
		}
		return out;
	};

	for ( i = 0; i < data.length; i++ ) {
		right = data[i];
		leftPlain = typeof left === 'string';
		rightPlain = typeof right === 'string';
		
		if ( !leftPlain && rightPlain ) {
			// [formatted][plain]
			close = {};
			for ( j = hashStack.length - 1; j >= 0; j-- ) {
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
			open = {},
			index = undefined;

			for ( hash in left[1] ) {
				if ( !( hash in right[1] ) ) {
					index = ( index === undefined ) ?
						hashStack.indexOf( hash ) :
						Math.min( index, hashStack.indexOf( hash ) );
				}
			}

			if ( index !== undefined ) {
				close = {};
				for ( j = hashStack.length - 1; j >= index; j-- ) {
					close[hashStack[j]] = annotationStack[hashStack[j]];
				}

				for ( j = index; j < hashStack.length; j++ ) {
					if ( hashStack[j] in right[1] && hashStack[j] in left[1] ) {
						open[hashStack[j]] = annotationStack[hashStack[j]];
					}
				}
				out += closeAnnotations( close );
			}

			for ( hash in right[1] ) {
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

	close = {};
	for ( j = hashStack.length - 1; j >= 0; j-- ) {
		close[hashStack[j]] = annotationStack[hashStack[j]];
	}
	out += closeAnnotations( close );

	return out;
};

ve.ce.TextNode.prototype.getSurface = function() {
	var view = this;
	while( !view.surface ) {
		view = view.parent;
	}
	return view.surface;
};

/* Registration */

ve.ce.nodeFactory.register( 'text', ve.ce.TextNode );

/* Inheritance */

ve.extendClass( ve.ce.TextNode, ve.ce.LeafNode );
