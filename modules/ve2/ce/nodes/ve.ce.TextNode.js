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
	ve.ce.LeafNode.call( this, model, $( document.createTextNode('') ) );
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
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'canBeSplit': true
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
	'object/template': {
		'open': function( data ) {
			return '<span class="ve-ce-content-format-object">' + data.html;
		},
		'close': '</span>'
	},
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

/* Static Methods */

/**
 * Gets a rendered opening or closing of an annotation.
 * 
 * Tag nesting is handled using a stack, which keeps track of what is currently open. A common stack
 * argument should be used while rendering content.
 * 
 * @static
 * @method
 * @param {String} bias Which side of the annotation to render, either "open" or "close"
 * @param {Object} annotation Annotation to render
 * @param {Array} stack List of currently open annotations
 * @returns {String} Rendered annotation
 */
ve.ce.TextNode.renderAnnotation = function( bias, hash, annotation, stack, annotations ) {
	var renderers = ve.ce.TextNode.annotationRenderers,
		type = annotation.type,
		out = '';
	if ( type in renderers ) {
		if ( bias === 'open' ) {
			// Add annotation to the top of the stack
			stack.push( hash );
			annotations[hash] = annotation;
			// Open annotation
			out += typeof renderers[type].open === 'function' ?
				renderers[type].open( annotation.data ) : renderers[type].open;
		} else {
			if ( annotations[stack[stack.length - 1]] === annotation ) {
				// Remove annotation from top of the stack
				delete annotations[stack[stack.length - 1]];
				stack.pop();
				// Close annotation
				out += typeof renderers[type].close === 'function' ?
					renderers[type].close( annotation.data ) : renderers[type].close;
			} else {
				// Find the annotation in the stack
				var depth = ve.inArray( hash, stack ),
					i;
				if ( depth === -1 ) {
					throw 'Invalid stack error. An element is missing from the stack.';
				}
				// Close each already opened annotation
				for ( i = stack.length - 1; i >= depth + 1; i-- ) {
					out += typeof renderers[annotations[stack[i]].type].close === 'function' ?
						renderers[annotations[stack[i]].type].close( annotations[stack[i]].data ) :
							renderers[annotations[stack[i]].type].close;
				}
				// Close the buried annotation
				out += typeof renderers[type].close === 'function' ?
					renderers[type].close( annotation.data ) : renderers[type].close;
				// Re-open each previously opened annotation
				for ( i = depth + 1; i < stack.length; i++ ) {
					var aaa = typeof renderers[annotations[stack[i]].type].open === 'function' ?
						renderers[annotations[stack[i]].type].open( annotations[stack[i]].data ) :
							renderers[annotations[stack[i]].type].open;
					console.log("X: " + aaa , hash);
					out += aaa;
				}
				// Remove the annotation from the middle of the stack
				stack.splice( depth, 1 );
				delete annotations[hash];
			}
		}
	}
	return out;
};

/* Methods */

/**
 * Gets the outer length, which for a text node is the same as the inner length.
 * 
 * @method
 * @returns {Integer} Length of the entire node
 */
ve.ce.TextNode.prototype.getOuterLength = function() {
	return this.length;
};

/**
 * Render content.
 * 
 * @method
 */
ve.ce.TextNode.prototype.render = function() {
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
		i,
		out = '',
		left = '',
		right,
		leftPlain,
		rightPlain;

	var openedArray = [];
	var openedCollection = [];

	var X_close = function( annotations, reverse ) {
		if ( reverse === true ) {
			var annArray = [];
			for( var hash in annotations ) {
				annArray.push( annotations[hash] );
			}

			var annCollection = {};
			for ( var i = annArray.length - 1; i >= 0; i-- ) {
				annCollection[JSON.stringify(annArray[i])] = annArray[i];
			}

			return X_close(annCollection)
		}

		var o = '';
		for ( var hash in annotations ) {
			if ( hash === '{"type":"textStyle/underline"}' ) {
				o += '</u>';
			}
			if ( hash === '{"type":"textStyle/bold"}' ) {
				o += '</b>';
			}
			if ( hash === '{"type":"textStyle/italic"}' ) {
				o += '</i>';
			}

			if ( hash in openedCollection ) {
				var depth = ve.inArray( hash, openedArray );
				if ( depth !== -1 ) {
					openedArray.splice( depth, 1 );
					delete openedCollection[hash];
				}				
			}
		}
		return o;
	};

	var X_open = function( annotations ) {
		var o = '';
		for ( var hash in annotations ) {
			if ( hash === '{"type":"textStyle/underline"}' ) {
				openedArray.push(hash);
				openedCollection[hash] = annotations[hash];
				o += '<u>';
			}
			if ( hash === '{"type":"textStyle/bold"}' ) {
				openedArray.push(hash);
				openedCollection[hash] = annotations[hash];
				o += '<b>';
			}
			if ( hash === '{"type":"textStyle/italic"}' ) {
				openedArray.push(hash);
				openedCollection[hash] = annotations[hash];
				o += '<i>';
			}
		}
		return o;
	};

	for ( i = 0; i < data.length; i++ ) {
		right = data[i];
		leftPlain = typeof left === 'string';
		rightPlain = typeof right === 'string';
		
		if ( !leftPlain && rightPlain ) {
			var toclose = {};
			for ( var j = openedArray.length - 1; j >= 0; j-- ) {
				toclose[openedArray[j]] = openedCollection[openedArray[j]];
			}
			out += X_close( toclose );
		} else if ( leftPlain && !rightPlain ) {
			out += X_open( right[1] );
		} else if ( !leftPlain && !rightPlain ) {

			var moreOnLeft = {};
			for ( var hash in left[1] ) {
				if ( ! ( hash in right[1] ) ) {
					moreOnLeft[hash] = left[1][hash];
				}
			}

			var moreOnRight = {};
			for ( var hash in right[1] ) {
				if ( ! ( hash in left[1] ) ) {
					moreOnRight[hash] = right[1][hash];
				}
			}

			var toopen = {};

			var idx = 1000;
			for ( var hash in moreOnLeft ) {
				idx = Math.min( idx, openedArray.indexOf( hash ) );
			}
			var toclose = {};
			if ( idx !== 1000 ) {
				for ( var j = openedArray.length - 1; j >= idx; j-- ) {
					toclose[openedArray[j]] = openedCollection[openedArray[j]];
					if ( openedArray[j] in right[1] ) {
						if ( ! ( openedArray[j] in moreOnRight)) {
							//toopen[openedArray[j]] = openedCollection[openedArray[j]];
						}
					}
				}

				for ( var j = idx; j < openedArray.length; j++ ) {
					if ( openedArray[j] in right[1] ) {
						if ( ! ( openedArray[j] in moreOnRight)) {
							toopen[openedArray[j]] = openedCollection[openedArray[j]];
						}
					}
				}

			}
			out += X_close( toclose );

			for ( var hash in moreOnRight ) {
				toopen[hash] = moreOnRight[hash];
			}

			out += X_open( toopen );
			

			/*
			var toopen = {};

			var idx = -1;
			for ( var hash in right[1] ) {
				idx = Math.max( idx, openedArray.indexOf( hash ) );
			}

			var toclose = {};
			for ( var j = idx; j >= 0; j-- ) {
				//if ( ! ( openedArray[j] in right[1] ) ) {
					toclose[openedArray[j]] = openedCollection[openedArray[j]];
					toopen[openedArray[j]] = openedCollection[openedArray[j]];
				//}
			}
			out += X_close( toclose );


			for ( var hash in right[1] ) {
				if ( ! ( hash in left[1] ) && ! ( hash in openedArray ) ) {
					toopen[hash] = right[1][hash];
				}
			}
			out += X_open( toopen );
			*/

			/*
			var toclose = {};
			for ( var hash in left[1] ) {
				if ( ! ( hash in right[1] ) ) {
					toclose[hash] = left[1][hash];
				}
			}
			out += X_close( toclose, true );
			
			var toopen = {};
			for ( var hash in right[1] ) {
				if ( ! ( hash in left[1] ) ) {
					toopen[hash] = right[1][hash];
				}
			}
			out += X_open( toopen );
			console.log(toclose, toopen);
			*/
		}

		chr = rightPlain ? right : right[0];
		out += chr in htmlChars ? htmlChars[chr] : chr;
		left = right;
	}
	var toclose = {};
	for ( var j = openedArray.length - 1; j >= 0; j-- ) {
		toclose[openedArray[j]] = openedCollection[openedArray[j]];
	}
	out += X_close( toclose );
	return out;




	var data = this.model.getDocument().getDataFromNode( this.model ),
		render = ve.ce.TextNode.renderAnnotation,
		htmlChars = ve.ce.TextNode.htmlCharacters;
	var out = '',
		left = '',
		right,
		leftPlain,
		rightPlain,
		stack = [],
		annotations = {},
		chr,
		i,
		j;
	for ( i = 0; i < data.length; i++ ) {
		right = data[i];
		leftPlain = typeof left === 'string';
		rightPlain = typeof right === 'string';
		if ( !leftPlain && rightPlain ) {
			// [formatted][plain] pair, close any annotations for left
			for ( var hash in left[1] ) {
				console.log("close (1): " + hash);
				out += render(
					'close',
					hash,
					left[1][hash],
					stack,
					annotations
				);
			}
		} else if ( leftPlain && !rightPlain ) {
			// [plain][formatted] pair, open any annotations for right
			for ( var hash in right[1] ) {
				console.log("open (1): " + hash);
				out += render(
					'open',
					hash,
					right[1][hash],
					stack,
					annotations
				);
			}
		} else if ( !leftPlain && !rightPlain ) {
			// [formatted][formatted] pair, open/close any differences
			for ( var hash in left[1] ) {
				if ( ! ( hash in right[1] ) ) {
					console.log("close (2): " + hash);
					out += render(
						'close',
						hash,
						left[1][hash],
						stack,
						annotations
					);
				}
			}
			for ( var hash in right[1] ) {
				if ( ! ( hash in left[1] ) ) {
					console.log("open (2): " + hash);
					out += render(
						'open',
						hash,
						right[1][hash],
						stack,
						annotations
					);
				}
			}
		}
		chr = rightPlain ? right : right[0];
		out += chr in htmlChars ? htmlChars[chr] : chr;
		left = right;
	}
	// Close all remaining tags at the end of the content
	if ( !rightPlain && right ) {
		for ( var hash in right[1] ) {
			console.log("close (3): " + hash);
			out += render(
				'close',
				hash,
				right[1][hash],
				stack,
				annotations
			);
		}
	}
	return out;
};

/* Registration */

ve.ce.factory.register( 'text', ve.ce.TextNode );

/* Inheritance */

ve.extendClass( ve.ce.TextNode, ve.ce.LeafNode );
