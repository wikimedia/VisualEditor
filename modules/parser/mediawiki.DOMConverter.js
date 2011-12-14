/**
 * Conversions between HTML DOM and WikiDom
 * 
 * @class
 * @constructor
 */
function DOMConverter () {
}

// Quick HACK: define Node constants
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

DOMConverter.prototype.getHTMLHandlerInfo = function ( nodeName ) {
	switch ( nodeName.toLowerCase() ) {
		case 'p':
			return {
				handler: this._convertHTMLLeaf, 
				type: 'paragraph'
			};
		case 'li':
		case 'dl':
		case 'dd':
			return {
				handler: this._convertHTMLLeaf, 
				type: 'listItem'
			};
		case 'pre':
			return {
				handler: this._convertHTMLLeaf, 
				type: 'pre'
			};
		case 'ul':
		case 'ol':
		case 'dl':
			return {
				handler: this._convertHTMLBranch, 
				type: 'list'
			};
		default:
			console.log( 'HTML to Wiki DOM conversion error. Unsupported node name ' +
					nodeName );
			return {
				handler: this._convertHTMLBranch, 
				type: nodeName.toLowerCase()
			};
			break;
	}
};

DOMConverter.prototype.getHTMLAnnotationType = function ( nodeName ) {
	switch ( nodeName.toLowerCase() ) {
		case 'i':
			return 'textStyle/italic';
		case 'b':
			return 'textStyle/bold';
		case 'span':
			return 'textStyle/span';
		case 'a':
			return 'link/unknown'; // XXX: distinguish internal / external etc
		default:
			console.log( 'HTML to Wiki DOM conversion error. Unsupported html annotation ' +
					nodeName );
			return undefined;
			break;
	}
};

/**
 * Convert a HTML DOM to WikiDom
 *
 * @method
 * @param {Object} root of HTML DOM (usually the body element)
 * @returns {Object} WikiDom version
 */
DOMConverter.prototype.HTMLtoWiki = function ( node ) {
	var children = node.childNodes,
		out = {
			type: 'document',
			children: []
		};
	for ( var i = 0, l = children.length; i < l; i++ ) {
		var cnode = children[i];
		switch ( cnode.nodeType ) {
			case Node.ELEMENT_NODE:
				// Call a handler for the particular node type
				var hi = this.getHTMLHandlerInfo( cnode.nodeName );
				var res = hi.handler.call(this, cnode, 0, hi.type );
				out.children.push( res.node );
				break;
			case Node.TEXT_NODE:
				// Add text as content, and increment offset
				// BUT: Should not appear at toplevel!
				break;
			case Node.COMMENT_NODE:
				// Add a comment annotation to which text? Not clear how this
				// can be represented in WikiDom.
				break;
			default:
				console.log( "HTML to Wiki DOM conversion error. Unhandled node type " + 
						cnode.innerHTML );
				break;
		}
	}
	return out;
};

/**
 * Private HTML branch node handler
 *
 * @param {Object} HTML DOM element
 * @param {Int} WikiDom offset within a block
 * @returns {Object} WikiDom object
 */
DOMConverter.prototype._convertHTMLBranch = function ( node, offset, type ) {
	var children = node.childNodes,
		wnode = {
			type: type,
			attributes: this._HTMLPropertiesToWikiAttributes( node ),
			children: [] 
		};
	for ( var i = 0, l = children.length; i < l; i++ ) {
		var cnode = children[i];
		switch ( cnode.nodeType ) {
			case Node.ELEMENT_NODE:
				// Call a handler for the particular node type
				var hi = this.getHTMLHandlerInfo( cnode.nodeName );
				var res = hi.handler.call(this, cnode, offset + 1, hi.type );
				wnode.children.push( res.node );
				offset = res.offset;
				break;
			case Node.TEXT_NODE:
				// Create a paragraph and add it to children?
				break;
			case Node.COMMENT_NODE:
				// add a comment node.
				break;
			default:
				console.log( "HTML to Wiki DOM conversion error. Unhandled node " + 
						cnode.innerHTML );
				break;
		}
	}
	return {
		offset: offset,
		node: wnode
	};
};

/**
 * Private HTML leaf node handler
 *
 * @param {Object} HTML DOM element
 * @param {Int} WikiDom offset within a block
 * @returns {Object} WikiDom object
 */
DOMConverter.prototype._convertHTMLLeaf = function ( node, offset, type ) {
	var children = node.childNodes,
		wnode = {
			type: type,
			attributes: this._HTMLPropertiesToWikiAttributes( node ),
			content: { 
				text: '',
				annotations: []
			}
		};
	//console.log( 'res wnode: ' + JSON.stringify(wnode, null, 2));
	for ( var i = 0, l = children.length; i < l; i++ ) {
		var cnode = children[i];
		switch ( cnode.nodeType ) {
			case Node.ELEMENT_NODE:
				// Call a handler for the particular annotation node type
				var annotationtype = this.getHTMLAnnotationType( cnode.nodeName );
				if ( annotationtype ) {
					var res = this._convertHTMLAnnotation( cnode, offset, annotationtype );
					//console.log( 'res leaf: ' + JSON.stringify(res, null, 2));
					offset += res.text.length;
					wnode.content.text += res.text;
					//console.log( 'res annotations: ' + JSON.stringify(res, null, 2));
					wnode.content.annotations = wnode.content.annotations
														.concat( res.annotations );
				}
				break;
			case Node.TEXT_NODE:
				// Add text as content, and increment offset
				wnode.content.text += cnode.data;
				offset += cnode.data.length;
				break;
			case Node.COMMENT_NODE:
				// add a comment annotation?
				break;
			default:
				console.log( "HTML to Wiki DOM conversion error. Unhandled node " + 
						cnode.innerHTML );
				break;
		}
	}
	return {
		offset: offset,
		node: wnode
	};
};

DOMConverter.prototype._convertHTMLAnnotation = function ( node, offset, type ) {
	var children = node.childNodes,
		text = '',
		annotations = [
				{
					type: type,
					data: this._HTMLPropertiesToWikiData( node ),
					range: {
						start: offset,
						end: offset
					}
				}
		];
	for ( var i = 0, l = children.length; i < l; i++ ) {
		var cnode = children[i];
		switch ( cnode.nodeType ) {
			case Node.ELEMENT_NODE:
				// Call a handler for the particular annotation node type
				var annotationtype = this.getHTMLAnnotationType(cnode.nodeName);
				if ( annotationtype ) {
					var res = this._convertHTMLAnnotation( cnode, offset, annotationtype );
					//console.log( 'res annotations 2: ' + JSON.stringify(res, null, 2));
					text += res.text;
					offset += res.text.length;
					annotations = annotations.concat( res.annotations );
				}
				break;
			case Node.TEXT_NODE:
				// Add text as content, and increment offset
				text += cnode.data;
				offset += cnode.data.length;
				break;
			case Node.COMMENT_NODE:
				// add a comment annotation?
				break;
			default:
				console.log( "HTML to Wiki DOM conversion error. Unhandled node " + 
						cnode.innerHTML );
				break;
		}
	}
	annotations[0].range.end = offset;
	return	{
		text: text,
		annotations: annotations
	};
};

DOMConverter.prototype._HTMLPropertiesToWikiAttributes = function ( elem ) {
	var attribs = elem.attributes,
		out = {};
	for ( var i = 0, l = attribs.length; i < l; i++ ) {
		var attrib = attribs.item(i),
			key = attrib.name;
		console.log('key: ' + key);
		if ( key.match( /^data-/ ) ) {
			// strip data- prefix from data-*
			out[key.replace( /^data-/, '' )] = attrib.value;
		} else {
			// prefix html properties with html/
			out['html/' + key] = attrib.value;
		}
	}
	return out;
};

DOMConverter.prototype._HTMLPropertiesToWikiData = function ( elem ) {
	var attribs = elem.attributes,
		out = {};
	for ( var i = 0, l = attribs.length; i < l; i++ ) {
		var attrib = attribs.item(i),
			key = attrib.name;
		if ( key.match( /^data-/ ) ) {
			// strip data- prefix from data-*
			out[key.replace( /^data-/, '' )] = attrib.value;
		} else {
			// pass through a few whitelisted keys
			// XXX: This subsets html DOM
			if ( ['title'].indexOf(key) != -1 ) {
				out[key] = attrib.value;
			}
		}
	}
	return out;
};


if (typeof module == "object") {
	module.exports.DOMConverter = DOMConverter;
}
