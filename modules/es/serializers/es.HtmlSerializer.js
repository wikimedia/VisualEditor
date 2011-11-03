/**
 * Serializes a WikiDom plain object into an HTML string.
 * 
 * @class
 * @constructor
 * @param {Object} options List of options for serialization
 */
es.HtmlSerializer = function( options ) {
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
es.HtmlSerializer.stringify = function( data, options ) {
	return ( new es.HtmlSerializer( options ) ).document( data );
};

es.HtmlSerializer.getHtmlAttributes = function( attributes ) {
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

es.HtmlSerializer.getExpandedListItems = function( node ) {
	var styles,
		levels = [];
	for ( var i = 0; i < this.children.length; i++ ) {
		styles = this.children[i].model.getElementAttribute( 'styles' );
		levels = levels.slice( 0, styles.length );
		if ( styles[styles.length - 1] === 'number' ) {
			if ( !levels[styles.length - 1] ) {
				levels[styles.length - 1] = 0;
			}
			this.children[i].setNumber( ++levels[styles.length - 1] );
		}
	}
};

/* Methods */

es.HtmlSerializer.prototype.document = function( node, rawFirstParagraph ) {
	var lines = [];
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		var childNode = node.children[i];
		if ( childNode.type in this ) {
			// Special case for paragraphs which have particular wrapping needs
			if ( childNode.type === 'paragraph' ) {
				lines.push( this.paragraph( childNode, rawFirstParagraph && i === 0 ) );
			} else {
				lines.push( this[childNode.type].call( this, childNode ) );
			}
		}
	}
	return lines.join( '\n' );
};

es.HtmlSerializer.prototype.comment = function( node ) {
	return '<!--' + node.text + '-->';
};

es.HtmlSerializer.prototype.horizontalRule = function( node ) {
	return es.Html.makeTag( 'hr', {}, false );
};

es.HtmlSerializer.prototype.heading = function( node ) {
	return es.Html.makeTag(
		'h' + node.attributes.level, {}, this.content( node.content )
	);
};

es.HtmlSerializer.prototype.paragraph = function( node, raw ) {
	if ( raw ) {
		return this.content( node.content );
	} else {
		return es.Html.makeTag( 'p', {}, this.content( node.content ) );
	}
};

es.HtmlSerializer.prototype.list = function( node ) {
	// TODO: Convert list from flat to structured format and output it as HTML
	return '<!-- TODO: Support list and listItem nodes -->';
};

es.HtmlSerializer.prototype.table = function( node ) {
	var lines = [],
		attributes = es.HtmlSerializer.getHtmlAttributes( node.attributes );
	lines.push( es.Html.makeOpeningTag( 'table', attributes ) );
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		lines.push( this.tableRow( node.children[i] ) );
	}
	lines.push( es.Html.makeClosingTag( 'table' ) );
	return lines.join( '\n' );
};

es.HtmlSerializer.prototype.tableRow = function( node ) {
	var lines = [],
		attributes = es.HtmlSerializer.getHtmlAttributes( node.attributes );
	lines.push( es.Html.makeOpeningTag( 'tr', attributes ) );
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		lines.push( this.tableCell( node.children[i] ) );
	}
	lines.push( es.Html.makeClosingTag( 'tr' ) );
	return lines.join( '\n' );
};

es.HtmlSerializer.prototype.tableCell = function( node ) {
	var symbolTable = {
			'tableHeading': 'th',
			'tableCell': 'td'
		},
		attributes = es.HtmlSerializer.getHtmlAttributes( node.attributes );
	return es.Html.makeTag( symbolTable[node.type], attributes, this.document( node, true ) );
};

es.HtmlSerializer.prototype.transclusion = function( node ) {
	var title = [];
	if ( node.namespace !== 'Main' ) {
		title.push( node.namespace );
	}
	title.push( node.title );
	title = title.join( ':' );
	return es.Html.makeTag( 'a', { 'href': '/wiki/' + title }, title );
};

es.HtmlSerializer.prototype.parameter = function( node ) {
	return '{{{' + node.name + '}}}';
};

es.HtmlSerializer.prototype.content = function( node ) {
	if ( 'annotations' in node && node.annotations.length ) {
		var annotationSerializer = new es.AnnotationSerializer(),
			tagTable = {
				'textStyle/bold': 'b',
				'textStyle/italic': 'i',
				'textStyle/strong': 'strong',
				'textStyle/emphasis': 'em',
				'textStyle/big': 'big',
				'textStyle/small': 'small',
				'textStyle/superScript': 'sup',
				'textStyle/subScript': 'sub'
			};
		for ( var i = 0, length = node.annotations.length; i < length; i++ ) {
			var annotation = node.annotations[i];
			if ( annotation.type in tagTable ) {
				annotationSerializer.addTags( annotation.range, tagTable[annotation.type] );
			} else {
				switch ( annotation.type ) {
					case 'link/external':
						annotationSerializer.addTags(
							annotation.range, 'a', { 'href': annotation.data.url }
						);
						break;
					case 'link/internal':
						annotationSerializer.addTags(
							annotation.range, 'a', { 'href': '/wiki/' + annotation.data.title }
						);
						break;
					case 'object/template':
					case 'object/hook':
						annotationSerializer.add( annotation.range, annotation.data.html, '' );
						break;
				}
			}
		}
		return annotationSerializer.render( node.text );
	} else {
		return node.text;
	}
};
