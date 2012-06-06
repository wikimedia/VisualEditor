/**
 * Converter between HTML DOM and VisualEditor linear data.
 *
 * @author Gabriel Wicke
 * @author Roan Kattouw
 * @author Christian Williams
 * @author Inez Korczynski
 * @author Trevor Parscal
 *
 * @class
 * @constructor
 * @param {Object} options Conversion options
 */
ve.dm.HTMLConverter = function( options ) {
	this.options = options || {};
};

/* Static Members */

/**
 * Object mapping HTML DOM node names to linear model element names.
 *
 *     'leafNode': Type of model tree node used to represent this element
 *         - If true, it's a leaf node (can not contain children)
 *         - If false, it's a branch node (can contain children)
 *     'type': Symbolic name of element in VisualEditor linear data.
 *     'attributes': Additional attributes to set for this element (optional)
 */
ve.dm.HTMLConverter.elementTypes = {
	'p': { 'leafNode': false, 'canContainContent': true, 'type': 'paragraph' },
	'h1': { 'leafNode': false, 'canContainContent': true, 'type': 'heading', 'attributes': { 'level': 1 } },
	'h2': { 'leafNode': false, 'canContainContent': true, 'type': 'heading', 'attributes': { 'level': 2 } },
	'h3': { 'leafNode': false, 'canContainContent': true, 'type': 'heading', 'attributes': { 'level': 3 } },
	'h4': { 'leafNode': false, 'canContainContent': true, 'type': 'heading', 'attributes': { 'level': 4 } },
	'h5': { 'leafNode': false, 'canContainContent': true, 'type': 'heading', 'attributes': { 'level': 5 } },
	'h6': { 'leafNode': false, 'canContainContent': true, 'type': 'heading', 'attributes': { 'level': 6 } },
	'img': { 'leafnode': true, 'canContainContent': false, 'type': 'image' },
	'li': { 'leafNode': false, 'canContainContent': false, 'type': 'listItem' },
	'dt': { 'leafNode': false, 'canContainContent': false, 'type': 'listItem', 'attributes': { 'style': 'term' } },
	'dd': { 'leafNode': false, 'canContainContent': false, 'type': 'listItem', 'attributes': { 'style': 'definition' } },
	'pre': { 'leafNode': false, 'canContainContent': true, 'type': 'preformatted' },
	'table': { 'leafNode': false, 'canContainContent': false, 'type': 'table' },
	'tbody': { }, // Ignore tbody for now, we might want it later for header/footer support though
	'tr': { 'leafNode': false, 'canContainContent': false, 'type': 'tableRow' },
	'th': { 'leafNode': false, 'canContainContent': false, 'type': 'tableHeading' },
	'td': { 'leafNode': false, 'canContainContent': false, 'type': 'tableCell' },
	'ul': { 'leafNode': false, 'canContainContent': false, 'type': 'list', 'attributes': { 'style': 'bullet' } },
	'ol': { 'leafNode': false, 'canContainContent': false, 'type': 'list', 'attributes': { 'style': 'number' } },
	'dl': { 'leafNode': false, 'canContainContent': false, 'type': 'definitionList' }

	// Missing types that will end up being alien nodes (not a complete list):
	// div, center, blockquote, caption, tbody, thead, tfoot, horizontalRule, br, img, video, audio
};

/**
 * Object mapping HTML DOM node names to linear model annotation types.
 *
 * The value can either be a string, or a function that takes the relevant HTML DOM node and returns
 * a string.
 */
ve.dm.HTMLConverter.annotationTypes = {
	'i': 'textStyle/italic',
	'b': 'textStyle/bold',
	'u': 'textStyle/underline',
	'small': 'textStyle/small',
	'span': 'textStyle/span',
	'a': function( node ) {
		// FIXME: the parser currently doesn't output this data this way
		// Internal links get 'linkType': 'internal' in the data-mw-rt attrib, while external links
		// currently get nothing
		var atype = node.getAttribute( 'data-type' );
		if ( atype ) {
			return 'link/' + atype;
		} else {
			return 'link/unknown';
		}
	},
	'template': 'object/template',
	'ref': 'object/hook',
	'includeonly': 'object/includeonly'
};

/**
 * List of HTML DOM attributes that should be passed through verbatim by convertAttributes() rather
 * than being prefixed with 'html/'
 *
 * TODO: Add href to this list?
 */
ve.dm.HTMLConverter.attributeWhitelist = [ 'title' ];

/* Static Methods */

/**
 * Convert the attributes of an HTML DOM node to linear model attributes.
 *
 * - Attributes prefixed with data-json- will have the prefix removed and their
 *   value JSON-decoded.
 * - Attributes prefixed with data- will have the prefix removed.
 * - Attributes in attributeWhitelist are passed through unchanged
 * - All other attribuetes are prefixed with html/
 *
 * @param {Object} node HTML DOM node
 * @returns {Object} Converted attribute map
 */
ve.dm.HTMLConverter.convertAttributes = function( node ) {
	var converted = {},
		attrib,
		name,
		value,
		i;
	if ( !node.length ) {
		return {};
	}
	for ( i = 0; i < node.length; i++ ) {
		attrib = node[i];
		name = attrib.name;
		value = attrib.value;
		if ( name.substr( 0, 10 ) == 'data-json-' ) {
			// Strip data-json- prefix and decode
			converted[name.substr( 10 )] = JSON.parse( value );
		} else if ( node[i].name.substr( 0, 5 ) == 'data-' ) {
			// Strip data- prefix
			converted[name.substr( 5 )] = value;
		} else if ( ve.dm.HTMLConverter.attributeWhitelist.indexOf( name ) != -1 ) {
			// Pass through a few whitelisted keys
			converted[name] = value;
		} else {
			// Prefix key with 'html/'
			converted['html/' + name] = value;
		}
	}
	return converted;
};

/**
 * Check if an HTML DOM node represents an annotation, and if so, build an
 * annotation object for it.
 *
 * The annotation object looks like {'type': 'type', data: {'attrKey': 'attrValue', ...}}
 *
 * @param {node} HTML DOM node
 * @returns {Object|false} Annotation object, or false if this node is not an annotation
 */
ve.dm.HTMLConverter.getAnnotation = function( node ) {
	var	name = node.nodeName.toLowerCase(),
		type = ve.dm.HTMLConverter.annotationTypes[name];
	if ( !type ) {
		// Not an annotation
		return false;
	}
	if ( typeof type == 'function' ) {
		type = type( node );
	}
	return {
		'type': type,
		'data': ve.dm.HTMLConverter.convertAttributes( node )
	};
};

/**
 * Convert a string to (possibly annotated) linear model data
 *
 * @param {String} content String to convert
 * @param {Array} annotations Array of annotation objects to apply
 * @returns {Array} Linear model data, one element per character
 */
ve.dm.HTMLConverter.generateAnnotatedContent = function( content, annotations ) {
	var characters = content.split( '' ),
		annotationMap = {},
		i;
	if ( !annotations || annotations.length === 0 ) {
		return characters;
	}
	for ( i = 0; i < annotations.length; i++ ) {
		if ( annotations[i].data !== undefined && Object.keys(annotations[i].data).length === 0 ) {
			delete annotations[i].data;
		}
		annotationMap[ve.getHash( annotations[i] )] = annotations[i];
	}
	for ( i = 0; i < characters.length; i++ ) {
		characters[i] = [characters[i], annotationMap];
	}
	return characters;
};

/**
 * Get linear model from HTML DOM
 *
 * @static
 * @method
 * @param {Object} node HTML node to recursively convert
 * @param {Object} options Options to use
 * @returns {Array} Linear model data
 */
ve.dm.HTMLConverter.getLinearModel = function( node, options ) {
	return ( new ve.dm.HTMLConverter( options ) ).convert( node );
};


/**
 * Recursively convert an HTML DOM node to a linear model array.
 *
 * This is the main function.
 *
 * @param {Object} node HTML DOM node
 * @param {Array} [annotations] Annotations to apply. Only used for recursion.
 * @param {Object} [typeData] Information about the linear model element type corresponding to this
 * node. Only used for recursion. This data usually comes from elementTypes. All keys are optional.
 *     Keys are:
 *         'type': If set, add an opening and a closing element with this type and with the DOM
 *             node's attributes.
 *         'attributes': If set and type is set, these attributes will be added to the element's
 *             attributes.
 *         'leafNode': If set and set to true, this element is supposed to be a leaf node in the
 *             linear model. This means that any content in this node will be put in the output
 *             directly rather than being wrapped in paragraphs, and that any child nodes that are
 *             elements will not be descended into.
 *         'canContainContent': If set and set to true, this element is allowed to contain annotated
 *             text and inline elements.
 * @returns {Array} Linear model data
 */
ve.dm.HTMLConverter.prototype.convert = function( node, annotations, typeData ) {
	var	data = [],
		i,
		child,
		annotation,
		paragraphOpened = false,
		element,
		attributes,
		childTypeData;

	annotations = annotations || [];
	typeData = typeData || {};
	
	if ( typeData.type ) {
		element = { 'type': typeData.type };
		attributes = ve.dm.HTMLConverter.convertAttributes( node.attributes );
		if ( typeData.attributes ) {
			attributes = $.extend( attributes, typeData.attributes );
		}
		if ( !$.isEmptyObject( attributes ) ) {
			element.attributes = attributes;
		}
		data.push( element );
	}

	for ( i = 0; i < node.childNodes.length; i++ ) {
		child = node.childNodes[i];
		switch ( child.nodeType ) {
			case Node.ELEMENT_NODE:
				// Check if this is an annotation
				annotation = ve.dm.HTMLConverter.getAnnotation( child );
				if ( annotation ) {
					// If we have annotated text within a branch node, open a paragraph
					// Leaf nodes don't need this because they're allowed to contain content
					if ( !paragraphOpened && typeData && !typeData.canContainContent ) {
						data.push( { 'type': 'paragraph' } );
						paragraphOpened = true;
					}
					// Recurse into this node
					data = data.concat( ve.dm.HTMLConverter.prototype.convert( child,
						annotations.concat( [ annotation ] ),
						{ 'leafNode': true, 'canContainContent': true }
					) );
				} else {
					// Skip over unknown nodes, keeping their innerHTML as an attribute
					if ( !( child.nodeName.toLowerCase() in ve.dm.HTMLConverter.elementTypes ) ) {
						// Use inline or block depending on parent's ability to contain content
						var type = typeData.canContainContent ? 'alienInline' : 'alienBlock';
						data.push( { 'type': type, 'attributes': { 'html': child.innerHTML } } );
						data.push( { 'type': '/' + type } );
						continue;
					}
					/*
					if ( typeData.canContainContent ) {
						// We've found an element node *inside* a leaf node.
						// This is illegal, so warn and skip it
						console.warn( 'HTML DOM to linear model conversion error: ' +
							'found element that can contain content (' + child.nodeName +
								') inside another element that can contain content node (' +
								node.nodeName + ')' );
						break;
					}
					*/
					// Close the last paragraph, if still open
					if ( paragraphOpened ) {
						data.push( { 'type': '/paragraph' } );
						paragraphOpened = false;
					}
					
					// Get the typeData for this node
					childTypeData = ve.dm.HTMLConverter.elementTypes[child.nodeName.toLowerCase()];

					if ( childTypeData ) {
						// Recurse into this node
						// Don't pass annotations through; we should never have those here
						// anyway because only leaves can have them.
						data = data.concat(
							ve.dm.HTMLConverter.prototype.convert( child, [], childTypeData )
						);
					} else {
						console.warn(
							'HTML DOM to linear model conversion error: unknown node with name ' +
							child.nodeName + ' and content ' + child.innerHTML
						);
					}
				}
				break;
			case Node.TEXT_NODE:
				// If we have annotated text within a branch node, open a paragraph
				if ( !paragraphOpened && typeData && !typeData.canContainContent ) {
					data.push( { 'type': 'paragraph' } );
					paragraphOpened = true;
				}
				// Annotate the text and output it
				data = data.concat(
					ve.dm.HTMLConverter.generateAnnotatedContent( child.data, annotations )
				);
				break;
			case Node.COMMENT_NODE:
				// Comment, do nothing
				break;
			default:
				console.warn(
					'HTML DOM to linear model conversion error: unknown node of type ' +
					child.nodeType + ' with content ' + child.innerHTML
				);
		}
	}
	// Close the last paragraph, if still open
	if ( paragraphOpened ) {
		data.push( { 'type': '/paragraph' } );
	}
	
	if ( typeData && typeData.type ) {
		data.push( { 'type': '/' + typeData.type } );
	}
	return data;
};

/**
 * Recursively convert a linear model array to HTML DOM.
 * This function is not yet written.
 */
ve.dm.HTMLConverter.prototype.unconvert = function() {
	// TODO: Implement
};
