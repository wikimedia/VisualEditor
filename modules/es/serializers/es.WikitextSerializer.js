/**
 * Serializes a WikiDom plain object into a Wikitext string.
 * 
 * @class
 * @constructor
 * @param options {Object} List of options for serialization
 */
es.WikitextSerializer = function( options ) {
	this.options = $.extend( {
		// defaults
	}, options || {} );
};

/* Static Methods */

/**
 * Get a serialized version of data.
 * 
 * @static
 * @method
 * @param {Object} data Data to serialize
 * @param {Object} options Options to use, @see {es.WikitextSerializer} for details
 * @returns {String} Serialized version of data
 */
es.WikitextSerializer.stringify = function( data, options ) {
	return ( new es.WikitextSerializer( options ) ).document( data );
};

/* Methods */

es.WikitextSerializer.prototype.document = function( node, rawFirstParagraph ) {
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

es.WikitextSerializer.prototype.comment = function( node ) {
	return '<!--' + node.text + '-->';
};

es.WikitextSerializer.prototype.horizontalRule = function( node ) {
	return '----';
};

es.WikitextSerializer.prototype.heading = function( node ) {
	var symbols = es.repeatString( '=', node.level );
	return symbols + this.serializeLine( node.line ) + symbols;
};

es.WikitextSerializer.prototype.paragraph = function( node ) {
	return this.content( node.content );
};

es.WikitextSerializer.prototype.list = function( node ) {
	var symbolTable = {
		'bullet': '*',
		'number': '#'
	};
	function convertStyles( styles ) {
		var symbols = '';
		for ( var i = 0, length = styles.length; i < length; i++ ) {
			symbols += styles[i] in symbolTable ? symbolTable[styles[i]] : '';
		}
		return symbols;
	}
	var lines = [];
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		var childNode = node.children[i];
		lines.push(
			convertStyles( childNode.styles ) + ' ' + this.content( childNode.content, path )
		);
	}
	return lines.join( '\n' );
};

es.WikitextSerializer.prototype.table = function( table ) {
	var lines = [];
	lines.push( '{|' + es.Document.Serializer.buildXmlAttributes( table.attributes ) );
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		lines.push( this.tableRow( node.children[i] ) );
	}
	lines.push( '|}' );
	return lines.join( '\n' );
};

es.WikitextSerializer.prototype.tableRow = function( node ) {
	var lines = [];
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		if ( i > 0 ) {
			lines.push( '|-' );
		}
		lines.push( this.tableCell( node.children[i] ) );
	}
	return lines.join( '\n' );
};

es.WikitextSerializer.prototype.tableCell = function( node ) {
	var symbolTable = {
		'tableHeading': '!',
		'tableData': '|'
	};
	return symbolTable[node.type] +
		(  node.attributes ? es.Html.makeAttributeList( cell.attributes ) + '|' : '' ) +
		this.document( node, true );
};

es.WikitextSerializer.prototype.transclusion = function( node ) {
	var title = [];
	if ( node.namespace === 'Main' ) {
		title.push( '' );
	} else if ( node.namespace !== 'Template' ) {
		title.push( node.namespace );
	}
	title.push( node.title );
	return '{{' + title.join( ':' ) + '}}';
};

es.WikitextSerializer.prototype.parameter = function( node ) {
	return '{{{' + node.name + '}}}';
};

es.WikitextSerializer.prototype.content = function( node ) {
	if ( 'annotations' in node && node.annotations.length ) {
		var annotationSerializer = new es.AnnotationSerializer(),
			tagTable = {
				'textStyle/strong': 'strong',
				'textStyle/emphasis': 'em',
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
