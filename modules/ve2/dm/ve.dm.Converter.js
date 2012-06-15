/**
 * Converter between HTML DOM and VisualEditor linear data.
 *
 * @class
 * @constructor
 * @param {Object} options Conversion options
 */
ve.dm.Converter = function( nodeFactory, annotationFactory ) {
	// Properties
	this.nodeFactory = nodeFactory;
	this.annotationFactory = annotationFactory;
	this.elements = { 'toDomElement': {}, 'toDataElement': {}, 'dataElementTypes': {} };
	this.annotations = { 'toDomElement': {}, 'toDataAnnotation': {} };

	// Events
	this.nodeFactory.addListenerMethod( this, 'register', 'onNodeRegister' );
	this.annotationFactory.addListenerMethod( this, 'register', 'onAnnotationRegister' );
};

/* Static Methods */

/**
 * Get linear model data from a string optionally applying annotations
 *
 * @param {String} text Plain text to convert
 * @param {Array} [annotations] Array of annotation objects to apply
 * @returns {Array} Linear model data, one element per character
 */
ve.dm.Converter.getDataContentFromText = function( text, annotations ) {
	var characters = text.split( '' ),
		annotationMap = {},
		i;
	if ( !annotations || annotations.length === 0 ) {
		return characters;
	}
	// Build annotation map
	for ( i = 0; i < annotations.length; i++ ) {
		if ( annotations[i].data && ve.isEmptyObject( annotations[i].data ) ) {
			// Cleanup empty data property
			delete annotations[i].data;
		}
		annotationMap[ve.getHash( annotations[i] )] = annotations[i];
	}
	// Apply annotations to characters
	for ( i = 0; i < characters.length; i++ ) {
		// Make a shallow copy of the annotationMap object, otherwise adding an annotation to one
		// character automatically adds it to all of others as well, annotations should be treated
		// as immutable, so it's OK to share references, but annotation maps are not immutable, so
		// it's not safe to share references - each annotated character needs it's own map
		characters[i] = [characters[i], ve.extendObject( {}, annotationMap )];
	}
	return characters;
};

/* Methods */

/**
 * Responds to register events from the node factory.
 *
 * If a node is special; such as document, alienInline, alienBlock and text; it's converters data
 * should be set to null, as to distinguish it from a new node type that someone has simply
 * forgotten to implement converters for.
 *
 * @method
 * @param {String} type Node type
 * @param {Function} constructor Node constructor
 * @throws 'Missing conversion data in node implementation of {type}'
 */
ve.dm.Converter.prototype.onNodeRegister = function( dataElementType, constructor ) {
	if ( constructor.converters === undefined ) {
		throw 'Missing conversion data in node implementation of ' + dataElementType;
	} else if ( constructor.converters !== null ) {
		var domElementTypes = constructor.converters.domElementTypes,
			toDomElement = constructor.converters.toDomElement,
			toDataElement = constructor.converters.toDataElement;
		// Registration
		this.elements.toDomElement[dataElementType] = toDomElement;
		for ( var i = 0; i < domElementTypes.length; i++ ) {
			this.elements.toDataElement[domElementTypes[i]] = toDataElement;
			this.elements.dataElementTypes[domElementTypes[i]] = dataElementType;
		}
	}
};

/**
 * Responds to register events from the annotation factory.
 *
 * @method
 * @param {String} type Base annotation type
 * @param {Function} constructor Annotation constructor
 * @throws 'Missing conversion data in annotation implementation of {type}'
 */
ve.dm.Converter.prototype.onAnnotationRegister = function( dataElementType, constructor ) {
	if ( constructor.converters === undefined ) {
		throw 'Missing conversion data in annotation implementation of ' + dataElementType;
	} else if ( constructor.converters !== null ) {
		var domElementTypes = constructor.converters.domElementTypes,
			toDomElement = constructor.converters.toDomElement,
			toDataAnnotation = constructor.converters.toDataAnnotation;
		// Registration
		this.annotations.toDomElement[dataElementType] = toDomElement;
		for ( var i = 0; i < domElementTypes.length; i++ ) {
			this.annotations.toDataAnnotation[domElementTypes[i]] = toDataAnnotation;
		}
	}
};

/**
 * Get the DOM element for a given linear model element.
 *
 * This invokes the toDomElement function registered for the element type.
 * NOTE: alienBlock and alienInline elements are not supported, if you pass them this function
 * will return false. (Opposite of District 9: no aliens allowed.)
 *
 * @method
 * @param {Object} dataElement Linear model element
 * @returns {HTMLElement|false} DOM element, or false if this element cannot be converted
 */
ve.dm.Converter.prototype.getDomElementFromDataElement = function( dataElement ) {
	var dataElementType = dataElement.type;
	if (
		// Aliens
		dataElementType === 'alienInline' || dataElementType === 'alienBlock' ||
		// Unsupported elements
		!( dataElementType in this.elements.toDomElement)
	) {
		return false;
	}
	var	domElement = this.elements.toDomElement[dataElementType]( dataElementType, dataElement ),
		dataElementAttributes = dataElement.attributes;
	if ( dataElementAttributes ) {
		for ( var key in dataElementAttributes ) {
			// Only include 'html/*' attributes and strip the 'html/' from the beginning of the name
			if ( key.indexOf( 'html/' ) === 0 ) {
				domElement.setAttribute( key.substr( 5 ), dataElementAttributes[key] );
			}
		}
	}
	return domElement;
};

/**
 * Get the linear model data element for a given DOM element.
 *
 * This invokes the toDataElement function registered for the element type, after checking that
 * there is no data-mw-gc attribute.
 *
 * @method
 * @param {HTMLElement} domElement DOM element
 * @returns {Object|false} Linear model element, or false if this node cannot be converted
 */
ve.dm.Converter.prototype.getDataElementFromDomElement = function( domElement ) {
	var domElementType = domElement.nodeName.toLowerCase();
	if (
		// Generated elements
		domElement.hasAttribute( 'data-mw-gc' ) ||
		// Unsupported elements
		!( domElementType in this.elements.toDataElement )
	) {
		return false;
	}
	var dataElement = this.elements.toDataElement[domElementType]( domElementType, domElement ),
		domElementAttributes = domElement.attributes;
	if ( domElementAttributes.length ) {
		var dataElementAttributes = dataElement.attributes = dataElement.attributes || {};
		// Inlcude all attributes and prepend 'html/' to each attribute name
		for ( var i = 0; i < domElementAttributes.length; i++ ) {
			var domElementAttribute = domElementAttributes[i];
			dataElementAttributes['html/' + domElementAttribute.name] = domElementAttribute.value;
		}
	}
	return dataElement;
};

/**
 * Check if an HTML DOM node represents an annotation, and if so, build an annotation object for it.
 *
 * @example Annotation Object
 *    { 'type': 'type', data: { 'key': 'value', ... } }
 *
 * @param {HTMLElement} domElement HTML DOM node
 * @returns {Object|false} Annotation object, or false if this node is not an annotation
 */
ve.dm.Converter.prototype.getDataAnnotationFromDomElement = function( domElement ) {
	var	domElementType = domElement.nodeName.toLowerCase(),
		toDataAnnotation = this.annotations.toDataAnnotation[domElementType];
	if ( typeof toDataAnnotation === 'function' ) {
		return toDataAnnotation( domElementType, domElement );
	}
	return false;
};

/**
 * Build an HTML DOM node for a linear model annotation.
 *
 * @method
 * @param {Object} dataAnnotation Annotation object
 * @returns {HTMLElement|false} HTML DOM node, or false if this annotation is not known
 */
ve.dm.Converter.prototype.getDomElementFromDataAnnotation = function( dataAnnotation ) {
	var	split = dataAnnotation.type.split( '/', 2 ),
		baseType = split[0],
		subType = split.slice( 1 ).join( '/' ),
		toDomElement = this.annotations.toDomElement[baseType];
	if ( typeof toDomElement === 'function' ) {
		return toDomElement( subType, dataAnnotation );
	}
	return false;
};

/**
 * Convert an HTML DOM tree to a linear model.
 *
 * Do not use the annotations, dataElement and path parameters, they're used for internal
 * recursion only.
 *
 * @method
 * @param {HTMLElement} domElement Wrapper div containing the HTML to convert
 * @param {Array} [annotations] Array of annotations (objects) to apply to the generated data
 * @param {Object} [dataElement] Data element to wrap the returned data in
 * @param {Array} [path] Array of linear model element types
 * @returns {Array} Linear model data
 */
ve.dm.Converter.prototype.getDataFromDom = function( domElement, annotations, dataElement, path, alreadyWrapped ) {
	function createAlien( domElement, isInline ) {
		var type = isInline ? 'alienInline' : 'alienBlock';
		return [
			{
				'type': type,
				'attributes': {
					'html': $( '<div>' ).append( $( domElement ).clone() ).html()
				}
			},
			{ 'type': '/' + type }
		];
	}

	// Fallback to defaults
	annotations = annotations || [];
	path = path || ['document'];
	var data = [],
		branchType = path[path.length - 1],
		branchIsContent = ve.dm.nodeFactory.canNodeContainContent( branchType ),
		wrapping = false;
	// Open element
	if ( dataElement ) {
		data.push( dataElement );
	}
	// Add contents
	for ( var i = 0; i < domElement.childNodes.length; i++ ) {
		var childDomElement = domElement.childNodes[i];
		switch ( childDomElement.nodeType ) {
			case Node.ELEMENT_NODE:
				// Detect generated content and wrap it in an alien node
				if ( childDomElement.hasAttribute( 'data-mw-gc' ) ) {
					data = data.concat( createAlien( childDomElement, branchIsContent ) );
					break;
				}
				// Detect and handle annotated content
				var annotation = this.getDataAnnotationFromDomElement( childDomElement );
				if ( annotation ) {
					// Start auto-wrapping of bare content
					if ( !wrapping && !alreadyWrapped && !branchIsContent ) {
						data.push( { 'type': 'paragraph' } );
						wrapping = true;
					}
					// Append child element data
					data = data.concat(
						this.getDataFromDom(
							childDomElement, annotations.concat( annotation ), undefined, path, wrapping || alreadyWrapped
						)
					);
					break;
				}
				// End auto-wrapping of bare content
				if ( wrapping ) {
					data.push( { 'type': '/paragraph' } );
					wrapping = false;
				}
				// Append child element data
				var childDataElement = this.getDataElementFromDomElement( childDomElement );
				if ( childDataElement ) {
					data = data.concat(
						this.getDataFromDom(
							childDomElement,
							[],
							childDataElement,
							path.concat( childDataElement.type ),
							wrapping || alreadyWrapped
						)
					);
					break;
				}
				// We don't know what this is, fall back to alien
				data = data.concat( createAlien( childDomElement, branchIsContent ) );
				break;
			case Node.TEXT_NODE:
				// HACK: strip trailing newlines in <li> tags. Workaround for a Parsoid bug
				var text = childDomElement.data;
				if ( domElement.nodeName.toLowerCase() === 'li' ) {
					text = text.replace( /\n+$/, '' );
				}
				if ( text === '' ) {
					// Don't produce an empty text node or an empty paragraph
					break;
				}
				// HACK: strip implied leading and trailing newlines in <p> tags
				// Workaround for a Parsoid bug
				/*
				 * Leading newlines:
				 * If the previous sibling is a paragraph, do not strip leading newlines
				 * If there is no previous sibling, do not strip leading newlines
				 * Otherwise, strip 1 leading newline
				 *
				 * Trailing newlines:
				 * If the next sibling is a paragraph, strip 2 trailing newlines
				 * If there is no next sibling, do not strip trailing newlines
				 * Otherwise, strip 1 trailing newline
				 */
				var contentNode = childDomElement.parentNode;
				if ( contentNode.nodeName.toLowerCase() === 'p' ) {
					if (
						contentNode.previousSibling &&
						contentNode.previousSibling.nodeName.toLowerCase() !== 'p' &&
						text.charAt( 0 ) === '\n'
					) {
						text = text.substr( 1 );
					}
					if ( contentNode.nextSibling ) {
						// Strip one trailing newline
						if ( text.charAt( text.length - 1 ) === "\n" ) {
							text = text.substr( 0, text.length - 1 );
						}
						if ( contentNode.nextSibling.nodeName.toLowerCase() === 'p' ) {
							// Strip another one
							if ( text.charAt( text.length - 1 ) === "\n" ) {
								text = text.substr( 0, text.length - 1 );
							}
						}
					}
				}

				if ( !branchIsContent ) {
					// If it's bare content, strip leading and trailing newlines
					text = text.replace( /^\n+/, '' ).replace( /\n+$/, '' );
					if ( text === '' ) {
						// Don't produce an empty text node
						break;
					}
				}

				// Start auto-wrapping of bare content
				if ( !wrapping && !alreadyWrapped && !branchIsContent ) {
					data.push( { 'type': 'paragraph' } );
					wrapping = true;
				}

				// Annotate the text and output it
				data = data.concat(
					ve.dm.Converter.getDataContentFromText( text, annotations )
				);
				break;
			case Node.COMMENT_NODE:
				// TODO: Preserve comments by inserting them into the linear model too
				break;
		}
	}
	// End auto-wrapping of bare content
	if ( wrapping ) {
		data.push( { 'type': '/paragraph' } );
	}
	// Close element
	if ( dataElement ) {
		data.push( { 'type': '/' + dataElement.type } );
	}
	return data;
};

/**
 * Convert linear model data to an HTML DOM
 *
 * @method
 * @param {Array} data Linear model data
 * @returns {HTMLElement} Wrapper div containing the resulting HTML
 */
ve.dm.Converter.prototype.getDomFromData = function( data ) {
	function fixupText( text, node ) {
		// HACK reintroduce newlines needed to make Parsoid not freak out
		// This reverses the newline stripping done in getDataFromDom()
		/*
		 * Leading newlines:
		 * If the previous sibling is a heading, add 1 leading newline
		 * Otherwise, do not add any leading newlines
		 *
		 * Trailing newlines:
		 * If the next sibling is a paragraph, add 2 trailing newlines
		 * If there is no next sibling, do not add any trailing newlines
		 * Otherwise, add 1 trailing newline
		 */
		if ( node.nodeName.toLowerCase() === 'p' ) {
			if (
				node.previousSibling &&
				node.previousSibling.nodeName.toLowerCase().match( /h\d/ )
			) {
				text = "\n" + text;
			}
			if ( node.nextSibling ) {
				// Add one trailing newline
				text += "\n";
				if ( node.nextSibling.nodeName.toLowerCase() === 'p' ) {
					// Add another one
					text += "\n";
				}
			}
		}
		return text;
	}

	var container = document.createElement( 'div' ),
		domElement = container,
		text;
	for ( var i = 0; i < data.length; i++ ) {
		if ( typeof data[i] === 'string' ) {
			// Text
			text = '';
			// Continue forward as far as the plain text goes
			while ( typeof data[i] === 'string' ) {
				text += data[i];
				i++;
			}
			// i points to the first non-text thing, go back one so we don't skip this later
			i--;
			// Add text
			domElement.appendChild( document.createTextNode( text ) );
		} else if (
			ve.isArray( data[i] ) ||
			(
				data[i].annotations !== undefined &&
				ve.dm.nodeFactory.isNodeContent( data[i].type )
			)
		) {
			// Annotated text
			var annotations,
				annotationStack = {}, // { hash: DOMnode }
				hash,
				annotationElement,
				done;
			text = '';
			while (
				ve.isArray( data[i] ) ||
				(
					data[i].annotations !== undefined &&
					ve.dm.nodeFactory.isNodeContent( data[i].type )
				)
			) {
				annotations = data[i].annotations || data[i][1];
				// Check for closed annotations
				for ( hash in annotationStack ) {
					if ( !( hash in annotations ) ) {
						// It's closed
						// Traverse up until we hit the node we need to close, and then
						// traverse up one more time to close that node
						done = false;
						while ( !done ) {
							done = domElement === annotationStack[hash];
							// Remove the annotation from the stack
							delete annotationStack[domElement.veAnnotationHash];
							// Remove the temporary veAnnotationHash property
							delete domElement.veAnnotationHash;
							// Add text if needed
							if ( text.length > 0 ) {
								domElement.appendChild( document.createTextNode( text ) );
								text = '';
							}
							// Traverse up
							domElement = domElement.parentNode;
						}
					}
				}
				// Check for opened annotations
				for ( hash in annotations ) {
					if ( !( hash in annotationStack ) ) {
						// It's opened
						annotationElement = this.getDomElementFromDataAnnotation( annotations[hash] );
						// Temporary property, will remove this when closing the annotation
						annotationElement.veAnnotationHash = hash;
						// Add to the annotation stack
						annotationStack[hash] = annotationElement;
						// Add text if needed
						if ( text.length > 0 ) {
							domElement.appendChild( document.createTextNode( text ) );
							text = '';
						}
						// Attach new node and descend into it
						domElement.appendChild( annotationElement );
						domElement = annotationElement;
					}
				}
				if ( data[i].annotations === undefined ) {
					text += data[i][0];
				} else {
					// Add text if needed
					if ( text.length > 0 ) {
						domElement.appendChild( document.createTextNode( text ) );
						text = '';
					}
					// Insert the element
					domElement.appendChild( this.getDomElementFromDataElement( data[i] ) );
					// Increment i once more so we skip over the closing as well
					i++;
				}
				i++;
			}
			// We're now at the first non-annotated thing, go back one so we don't skip this later
			i--;

			// Add any gathered text
			if ( text.length > 0 ) {
				domElement.appendChild( document.createTextNode( text ) );
				text = '';
			}
			// Close any remaining annotation nodes
			while ( domElement.veAnnotationHash !== undefined ) {
				delete domElement.veAnnotationHash;
				domElement = domElement.parentNode;
			}
		} else if ( data[i].type !== undefined ) {
			var dataElement = data[i];
			// Element
			if ( dataElement.type === 'alienBlock' || dataElement.type === 'alienInline' ) {
				// Create nodes from source
				var wrapper = document.createElement( 'div' );
				wrapper.innerHTML = dataElement.attributes.html;
				// Add element - adds all child elements, but there really should only be 1
				while ( wrapper.firstChild ) {
					domElement.appendChild( wrapper.firstChild );
				}
				// Make sure the alien closing is skipped
				i++;
			} else if ( dataElement.type.charAt( 0 ) === '/' ) {
				// Ascend to parent node
				domElement = domElement.parentNode;
			} else {
				// Create node from data
				var childDomElement = this.getDomElementFromDataElement( dataElement );
				// Add element
				domElement.appendChild( childDomElement );
				// Descend into child node
				domElement = childDomElement;
			}
		}
	}

	// HACK: do postprocessing on the data to work around bugs in Parsoid concerning paragraphs
	// inside list items
	$( container ).find( 'li, dd, dt' ).each( function() {
		var $sublists = $(this).children( 'ul, ol' ),
			$firstChild = $(this.firstChild);
		if ( $firstChild.is( 'p' ) ) {
			// Unwrap the first paragraph, unless it has stx=html
			var datamw = $.parseJSON( $firstChild.attr( 'data-mw' ) ) || {};
			if ( datamw.stx !== 'html' ) {
				$firstChild.replaceWith( $firstChild.contents() );
			}
		}

		// Append a newline to the end of the <li> , provided its last child is not a list
		var lastChildNodeName = this.lastChild.nodeName.toLowerCase();
		if ( lastChildNodeName !== 'ul' && lastChildNodeName !== 'ol' ) {
			$(this).append( "\n" );
		}
		// Append a newline before every sublist that is preceded by something
		$sublists.each( function() {
			if ( this.previousSibling ) {
				if ( this.previousSibling.nodeName.toLowerCase() === 'text' ) {
					this.previousSibling.data += "\n";
				} else {
					this.parentNode.insertBefore( document.createTextNode( "\n" ), this );
				}
			}
		});
	});

	// HACK more postprocessing, this time to add newlines to paragraphs so Parsoid doesn't freak out
	$( container )
		// Get all text nodes
		.find( '*' )
		.contents()
		.filter( function() {
			return this.nodeType == 3;
		} )
		.each( function() {
			this.data = fixupText( this.data, this.parentNode );
		} );
	// And add newlines after headings too
	$( container ).find( 'h1, h2, h3, h4, h5, h6' ).each( function() {
		// If there is no next sibling, we don't need to add a newline
		// If the next sibling is a paragraph, fixupText() has taken care of it
		// Otherwise, add a newline after the heading
		if ( this.nextSibling && this.nextSibling.nodeName.toLowerCase() !== 'p' ) {
			this.parentNode.insertBefore( document.createTextNode( "\n" ), this.nextSibling );
		}
		// If the previous sibling exists and is a pre, we need to add a newline before
		if ( this.previousSibling && this.previousSibling.nodeName.toLowerCase() === 'pre' ) {
			this.parentNode.insertBefore( document.createTextNode( "\n" ), this );
		}
	} );
	return container;
};

/* Initialization */

ve.dm.converter = new ve.dm.Converter( ve.dm.nodeFactory, ve.dm.annotationFactory );
