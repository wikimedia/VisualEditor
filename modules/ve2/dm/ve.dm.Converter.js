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
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getDomElementFromDataElement = function( dataElement ) {
	var dataElementType = dataElement.type;
	if ( dataElementType === 'alienBlock' ) {
		// Alien nodes convert back to their original HTML
		return $( dataElement.attributes.html )[0];
	}
	var domElement = this.elements.toDomElement[dataElementType]( dataElementType, dataElement ),
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
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getDataElementFromDomElement = function( domElement ) {
	var domElementType = domElement.nodeName.toLowerCase();
	if (
		// Generated elements
		domElement.hasAttribute( 'data-mw-gc' ) ||
		// Unsupported elements
		!( domElementType in this.elements.toDataElement )
	) {
		return {
			'type': 'alienBlock',
			'attributes': {
				'html': $( '<div></div>' ).append( $( domElement ).clone() ).html()
			}
		};
	}
	var dataElement = this.elements.toDataElement[domElementType]( domElementType, domElement ),
		domElementAttributes = domElement.attributes;
	if ( domElementAttributes.length ) {
		var dataElementAttributes = dataElement.attributes = {};
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
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getDomElementFromDataAnnotation = function( dataAnnotation ) {
	// TODO: Implement
};

/**
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getDataFromDom = function( domElement, annotations, dataElement, path ) {
	// Fallback to defaults
	annotations = annotations || [];
	path = path || ['document'];
	var data = [],
		wrapping = false,
		branchType = path[path.length - 1];
	// Open element
	if ( dataElement ) {
		data.push( dataElement );
	}
	// Add contents
	for ( var i = 0; i < domElement.childNodes.length; i++ ) {
		var childDomElement = domElement.childNodes[i];
		switch ( childDomElement.nodeType ) {
			case Node.ELEMENT_NODE:
				var annotation = this.getDataAnnotationFromDomElement( childDomElement );
				if ( annotation ) {
					// Start auto-wrapping of bare content
					if ( !wrapping && !ve.dm.nodeFactory.canNodeContainContent( branchType ) ) {
						data.push( { 'type': 'paragraph' } );
						wrapping = true;
					}
					// Append child element data
					data = data.concat(
						this.getDataFromDom(
							childDomElement, annotations.concat( annotation ), undefined, path
						)
					);
				} else {
					// End auto-wrapping of bare content
					if ( wrapping ) {
						data.push( { 'type': '/paragraph' } );
						wrapping = false;
					}
					// Append child element data
					var childDataElement = this.getDataElementFromDomElement( childDomElement );
					data = data.concat(
						this.getDataFromDom(
							childDomElement,
							[],
							childDataElement,
							path.concat( childDataElement.type )
						)
					);
				}
				break;
			case Node.TEXT_NODE:
				// Start auto-wrapping of bare content
				if ( !wrapping && !ve.dm.nodeFactory.canNodeContainContent( branchType ) ) {
					data.push( { 'type': 'paragraph' } );
					wrapping = true;
				}
				// Annotate the text and output it
				data = data.concat(
					ve.dm.HTMLConverter.generateAnnotatedContent( childDomElement.data, annotations )
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
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getDomFromData = function( data ) {
	var dom = ve.createDomElement( 'div' );
	for ( var i = 0; i < data.length; i++ ) {
		// TODO: Implement
	}
	return dom;
};

/* Initialization */

ve.dm.converter = new ve.dm.Converter( ve.dm.nodeFactory, ve.dm.annotationFactory );
