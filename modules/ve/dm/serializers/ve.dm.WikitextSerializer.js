/**
 * Serializes a WikiDom plain object into a Wikitext string.
 * 
 * @class
 * @constructor
 * @param options {Object} List of options for serialization
 */
ve.dm.WikitextSerializer = function( options ) {
	this.options = $.extend( {
		// defaults
	}, options || {} );
};

/* Static Members */

ve.dm.HtmlSerializer.headingSymbols = {
	'1': '=',
	'2': '==',
	'3': '===',
	'4': '====',
	'5': '=====',
	'6': '======'
};

ve.dm.HtmlSerializer.listSymbols = {
	'bullet': '*',
	'number': '#',
	'definition': ''
};

ve.dm.HtmlSerializer.listItemSymbols = {
	'item': '',
	'term': ':',
	'definition': ';'
};

ve.dm.HtmlSerializer.tableCellSymbols = {
	'tableHeading': '!',
	'tableCell': '|'
};

/* Static Methods */

/**
 * Get a serialized version of data.
 * 
 * @static
 * @method
 * @param {Object} data Data to serialize
 * @param {Object} options Options to use, @see {ve.dm.WikitextSerializer} for details
 * @returns {String} Serialized version of data
 */
ve.dm.WikitextSerializer.stringify = function( data, options ) {
	return ( new ve.dm.WikitextSerializer( options ) ).document( data );
};

ve.dm.WikitextSerializer.getHtmlAttributes = function( attributes ) {
	var htmlAttributes = {},
		count = 0;
	for ( var key in attributes ) {
		if ( key.indexOf( 'html/' ) === 0 ) {
			htmlAttributes[key.substr( 5 )] = attributes[key];
			count++;
		}
	}
	return count ? htmlAttributes : null;
};

/* Methods */

ve.dm.WikitextSerializer.prototype.document = function( node, rawFirstParagraph ) {
	var lines = [];
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		var childNode = node.children[i];
		if ( childNode.type in this ) {
			// Special case for paragraphs which have particular spacing needs
			if ( childNode.type === 'paragraph' ) {
				lines.push( this.paragraph( childNode, rawFirstParagraph && i === 0 ) );
				if ( i + 1 < length /* && node.children[i + 1].type === 'paragraph' */ ) {
					lines.push( '' );
				}
			} else {
				lines.push( this[childNode.type].call( this, childNode ) );
			}
		}
	}
	return lines.join( '\n' );
};

ve.dm.WikitextSerializer.prototype.comment = function( node ) {
	return '<!--' + node.text + '-->';
};

ve.dm.WikitextSerializer.prototype.horizontalRule = function( node ) {
	return '----';
};

ve.dm.WikitextSerializer.prototype.heading = function( node ) {
	var symbols = ve.repeatString( '=', node.attributes.level );
	return symbols + this.content( node.content ) + symbols;
};

ve.dm.WikitextSerializer.prototype.paragraph = function( node ) {
	return this.content( node.content );
};

ve.dm.WikitextSerializer.prototype.pre = function( node ) {
	return ' ' + this.content( node.content ).replace( '\n', '\n ' );
};

ve.dm.WikitextSerializer.prototype.list = function( node, lead ) {
	return '<!-- list item -->';
};

ve.dm.WikitextSerializer.prototype.listItem = function( node, lead ) {
	return '<!-- list item -->';
};

ve.dm.WikitextSerializer.prototype.table = function( node ) {
	var lines = [],
		attributes = ve.dm.WikitextSerializer.getHtmlAttributes( node.attributes );
	if ( attributes ) {
		attributes = ve.Html.makeAttributeList( attributes );
	}
	lines.push( '{|' + attributes );
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		lines.push( this.tableRow( node.children[i], i === 0 ) );
	}
	lines.push( '|}' );
	return lines.join( '\n' );
};

ve.dm.WikitextSerializer.prototype.tableRow = function( node, first ) {
	var lines = [],
		attributes = ve.dm.WikitextSerializer.getHtmlAttributes( node.attributes );
	if ( attributes ) {
		attributes = ve.Html.makeAttributeList( attributes );
	}
	if ( !first || attributes ) {
		lines.push( '|-' + attributes );
	}
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		lines.push( this.tableCell( node.children[i] ) );
	}
	return lines.join( '\n' );
};

ve.dm.WikitextSerializer.prototype.tableCell = function( node ) {
	var attributes = ve.dm.WikitextSerializer.getHtmlAttributes( node.attributes );
	if ( attributes ) {
		attributes = ve.Html.makeAttributeList( attributes ) + '|';
	}
	return ve.dm.HtmlSerializer.tableCellSymbols[node.type] + attributes +
		this.document( node, true );
};

ve.dm.WikitextSerializer.prototype.transclusion = function( node ) {
	var title = [];
	if ( node.namespace === 'Main' ) {
		title.push( '' );
	} else if ( node.namespace !== 'Template' ) {
		title.push( node.namespace );
	}
	title.push( node.title );
	return '{{' + title.join( ':' ) + '}}';
};

ve.dm.WikitextSerializer.prototype.parameter = function( node ) {
	return '{{{' + node.name + '}}}';
};

ve.dm.WikitextSerializer.prototype.content = function( node ) {
	if ( 'annotations' in node && node.annotations.length ) {
		var annotationSerializer = new ve.dm.AnnotationSerializer(),
			tagTable = {
				'textStyle/strong': 'strong',
				'textStyle/emphasize': 'em',
				'textStyle/big': 'big',
				'textStyle/small': 'small',
				'textStyle/superScript': 'sup',
				'textStyle/subScript': 'sub'
			},
			markupTable = {
				'textStyle/bold': "'''",
				'textStyle/italic': "''"
			};
		for ( var i = 0, length = node.annotations.length; i < length; i++ ) {
			var annotation = node.annotations[i];
			if ( annotation.type in tagTable ) {
				annotationSerializer.addTags( annotation.range, tagTable[annotation.type] );
			} else if ( annotation.type in markupTable ) {
				annotationSerializer.add(
					annotation.range, markupTable[annotation.type], markupTable[annotation.type]
				);
			} else {
				switch ( annotation.type ) {
					case 'link/external':
						annotationSerializer.add(
							annotation.range, '[' + annotation.data.href + ' ', ']'
						);
						break;
					case 'link/internal':
						annotationSerializer.add(
							annotation.range, '[[' + annotation.data.title + '|', ']]'
						);
						break;
				}
			}
		}
		return annotationSerializer.render( node.text );
	} else {
		return node.text;
	}
};
