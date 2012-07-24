/**
 * HTML DOM -> linear model converter
 *
 * @author Roan Kattouw
 */

/**
 * Convert an HTML DOM to a linear model
 * @param {Object} Root node of the HTML DOM
 * @returns {Array} Linear model
 */
function ConvertDOMToLM( node ) {
	return convertHTMLNode( node );
}

if ( typeof module == 'object' ) {
	module.exports.ConvertDOMToLM = ConvertDOMToLM;
}

/*** Private functions and variables ***/

// Quick HACK: define Node constants locally
// https://developer.mozilla.org/en/nodeType
var Node = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	ENTITY_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12
};

/**
 * Object mapping HTML DOM node names to linear model element names.
 * 
 * leafNode: If true, the linear model element is a leaf node (can have children but no content)
 *           if false, it is a branch node (can contain content but no children),
 * type:       Element type
 * attributes: Additional attributes to set for this element (optional)
 * 
 */
var elementTypes = {
	'p': { leafNode: true, type: 'paragraph' },
	'h1': { leafNode: true, type: 'heading', attributes: { level: 1 } },
	'h2': { leafNode: true, type: 'heading', attributes: { level: 2 } },
	'h3': { leafNode: true, type: 'heading', attributes: { level: 3 } },
	'h4': { leafNode: true, type: 'heading', attributes: { level: 4 } },
	'h5': { leafNode: true, type: 'heading', attributes: { level: 5 } },
	'h6': { leafNode: true, type: 'heading', attributes: { level: 6 } },
	'li': { leafNode: false, type: 'listItem' },
	'dt': { leafNode: false, type: 'listItem' },
	'dd': { leafNode: false, type: 'listItem' },
	'pre': { leafNode: true, type: 'pre' },
	'table': { leafNode: false, type: 'table' },
	'tbody': { leafNode: false, type: 'tbody' }, // not in linear model!
	'tr': { leafNode: false, type: 'tableRow' },
	'th': { leafNode: false, type: 'tableHeading' },
	'td': { leafNode: false, type: 'tableCell' },
	'caption': { leafNode: false, type: 'caption' },
	'hr': { leafNode: true, type: 'horizontalRule' },
	'ul': { leafNode: false, type: 'list' }, // TODO add attribute for 'bullet'
	'ol': { leafNode: false, type: 'list' }, // TODO add attribute for 'number'
	'dl': { leafNode: false, type: 'list' }, // TODO add attribute for ???
	//XXX: center is block-level in HTML, not sure what it should be in the linear model...
	'center': { leafNode: false, type: 'center' },
	//XXX: blockquote is block-level in HTML, not sure what it should be in the linear model...
	'blockquote': { leafNode: false, type: 'blockquote' },
	//XXX: what should 'div' be in the linear model?
	'div': { leafNode: false, type: 'div' }
	// Missing types:
	// br
	// img
};

/**
 * Object mapping HTML DOM node names to linear model annotation types.
 * The value can either be a string, or a function that takes the relevant
 * HTML DOM node and returns a string.
 */
var annotationTypes = {
	'i': 'textStyle/italic',
	'b': 'textStyle/bold',
	'small': 'textStyle/small',
	'span': 'textStyle/span',
	'a': function( node ) {
		// FIXME the parser currently doesn't output this data this way
		// Internal links get linkType:'internal' in the data-parsoid attrib,
		// external links get nothing
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
 * List of HTML DOM attributes that should be passed through verbatim
 * by convertAttributes() rather than being prefixed with 'html/'
 */
var attributeWhitelist = [ 'title' ]; //XXX: add href?

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
function convertAttributes( node ) {
	var	attribs = node.attributes, retval = {},
		i, attrib, name;
	if ( !attribs ) {
		return {};
	}
	for ( i = 0; i < attribs.length; i++ ) {
		attrib = attribs.item( i );
		name = attrib.name;
		if ( name.substr( 0, 10 ) == 'data-json-' ) {
			// Strip data-json- prefix and decode
			retval[name.substr( 10 )] = JSON.parse( attrib.value );
		} else if ( name.substr( 0, 5 ) == 'data-' ) {
			// Strip data- prefix
			retval[name.substr( 5 )] = attrib.value;
		} else if ( attributeWhitelist.indexOf( name ) != -1 ) {
			// Pass through a few whitelisted keys
			retval[name] = attrib.value;
		} else {
			// Prefix key with 'html/'
			retval['html/' + name] = attrib.value;
		}
	}
	return retval;
}

/**
 * Check if an HTML DOM node represents an annotation, and if so, build an
 * annotation object for it.
 * 
 * The annotation object looks like {type: 'type', data: {'attrKey': 'attrValue', ...}}
 * 
 * @param {node} HTML DOM node
 * @returns {Object|false} Annotation object, or false if this node is not an annotation
 */
function getAnnotation( node ) {
	var	name = node.nodeName.toLowerCase(),
		type = annotationTypes[name],
		annotation = {};
	if ( !type ) {
		// Not an annotation
		return false;
	}
	if ( typeof type == 'function' ) {
		type = type( node );
	}
	annotation.type = type;
	annotation.data = convertAttributes( node );
	return annotation;
}

/**
 * Convert a string to (possibly annotated) linear model data
 * 
 * @param {String} content String to convert
 * @param {Array} annotations Array of annotation objects to apply
 * @returns {Array} Linear model data, one element per character
 */
function generateAnnotatedContent( content, annotations ) {
	var	i, result = [],
		split = content.split( '' );
	if ( !annotations || annotations.length == 0 ) {
		return split;
	}
	for ( i = 0; i < split.length; i++ ) {
		result.push( [ split[i] ].concat( annotations ) );
	}
	return result;
}

/**
 * Recursively convert an HTML DOM node to a linear model array. This is the
 * main function.
 * 
 * @param {Object} node HTML DOM node
 * @param {Array} [annotations] Annotations to apply. Only used for recursion.
 * @param {Object} [typeData] Information about the linear model element type corresponding to this node.
 *        Only used for recursion. This data usually comes from elementTypes. All keys are optional. Keys are:
 *                type: If set, add an opening and a closing element with this type and with the DOM node's attributes
 *                attributes: If set and type is set, these attributes will be added to the element's attributes
 *                leafNode: If set and set to true, this element is supposed to be a leaf node in the linear model.
 *                          This means that any content in this node will be put in the output directly rather than
 *                          being wrapped in paragraphs, and that any child nodes that are elements will not be
 *                          descended into.
 * @returns {Array} Linear model data
 */
function convertHTMLNode( node, annotations, typeData ) {
	var 	data = [], i, child, annotation,
		paragraphOpened = false, element,
		attributes, typeData, childTypeData;
	annotations = annotations || [];
	typeData = typeData || {};
	
	if ( typeData.type ) {
		element = { 'type': typeData.type };
		attributes = convertAttributes( node.attributes );
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
				annotation = getAnnotation( child );
				if ( annotation ) {
					// If we have annotated text within a branch node, open a paragraph
					// Leaf nodes don't need this because they're allowed to contain content
					if ( !paragraphOpened && !typeData.leafNode ) {
						data.push( { 'type': 'paragraph' } );
						paragraphOpened = true;
					}
					// Recurse into this node
					data = data.concat( convertHTMLNode( child,
						annotations.concat( [ annotation ] ),
						{ leafNode: true }
					) );
				} else {
					if ( typeData.leafNode ) {
						// We've found an element node *inside* a leaf node.
						// This is illegal, so warn and skip it
						console.warn( 'HTML DOM to linear model conversion error: ' +
							'found element node (' + child.nodeName + ') inside ' +
							'leaf node (' + node.nodeName + ')' );
						break;
					}
					
					// Close the last paragraph, if still open
					if ( paragraphOpened ) {
						data.push( { 'type': '/paragraph' } );
						paragraphOpened = false;
					}
					
					// Get the typeData for this node
					childTypeData = elementTypes[child.nodeName.toLowerCase()];
					if ( childTypeData ) {
						// Recurse into this node
						// Don't pass annotations through; we should never have those here
						// anyway because only leaves can have them.
						data = data.concat( convertHTMLNode( child, [], childTypeData ) );
					} else {
						console.warn( 'HTML DOM to linear model conversion error: unknown node with name ' +
							child.nodeName + ' and content ' + child.innerHTML );
					}
				}
				break;
			case Node.TEXT_NODE:
				// If we have annotated text within a branch node, open a paragraph
				// Leaf nodes don't need this because they're allowed to contain content
				if ( !paragraphOpened && typeData && !typeData.leafNode ) {
					data.push( { 'type': 'paragraph' } );
					paragraphOpened = true;
				}
				// Annotate the text and output it
				data = data.concat( generateAnnotatedContent( child.data, annotations ) );
				break;
			case Node.COMMENT_NODE:
				// Comment, do nothing
				break;
			default:
				console.warn( 'HTML DOM to linear model conversion error: unknown node of type ' +
					child.nodeType + ' with content ' + child.innerHTML );
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
}
