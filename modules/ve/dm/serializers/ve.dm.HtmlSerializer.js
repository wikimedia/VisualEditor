/**
 * Serializes a WikiDom plain object into an HTML string.
 * 
 * @class
 * @constructor
 * @param {Object} options List of options for serialization
 */
ve.dm.HtmlSerializer = function( options ) {
	this.options = $.extend( {
		// defaults
	}, options || {} );
};

/* Static Members */

ve.dm.HtmlSerializer.headingTags = {
	'1': 'h1',
	'2': 'h2',
	'3': 'h3',
	'4': 'h4',
	'5': 'h5',
	'6': 'h6'
};

ve.dm.HtmlSerializer.listTags = {
	'bullet': 'ul',
	'number': 'ol',
	'definition': 'dl'
};

ve.dm.HtmlSerializer.listItemTags = {
	'item': 'li',
	'term': 'dt',
	'definition': 'dd'
};

ve.dm.HtmlSerializer.tableCellTags = {
	'tableHeading': 'th',
	'tableCell': 'td'
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
ve.dm.HtmlSerializer.stringify = function( data, options ) {
	return ( new ve.dm.HtmlSerializer( options ) ).document( data );
};

ve.dm.HtmlSerializer.getHtmlAttributes = function( attributes ) {
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

ve.dm.HtmlSerializer.prototype.document = function( node, wrapWith, rawFirstParagraph ) {
	var lines = [];
	if ( wrapWith ) {
		var htmlAttributes = ve.dm.HtmlSerializer.getHtmlAttributes( node.attributes );
		lines.push( ve.Html.makeOpeningTag( wrapWith, htmlAttributes ) );
	}
	for ( var i = 0, length = node.children.length; i < length; i++ ) {
		var child = node.children[i];
		if ( child.type in this ) {
			// Special case for paragraphs which have particular wrapping needs
			if ( child.type === 'paragraph' ) {
				lines.push( this.paragraph( child, rawFirstParagraph && i === 0 ) );
			} else {
				lines.push( this[child.type].call( this, child ) );
			}
		}
	}
	if ( wrapWith ) {
		lines.push( ve.Html.makeClosingTag( wrapWith ) );
	}
	return lines.join( '\n' );
};

ve.dm.HtmlSerializer.prototype.comment = function( node ) {
	return '<!--(' + node.text + ')-->';
};

ve.dm.HtmlSerializer.prototype.pre = function( node ) {
	return ve.Html.makeTag(
		'pre', {}, this.content( node.content, true )
	);
};

ve.dm.HtmlSerializer.prototype.horizontalRule = function( node ) {
	return ve.Html.makeTag( 'hr', {}, false );
};

ve.dm.HtmlSerializer.prototype.heading = function( node ) {
	return ve.Html.makeTag(
		ve.dm.HtmlSerializer.headingTags[node.attributes.level], {}, this.content( node.content )
	);
};

ve.dm.HtmlSerializer.prototype.paragraph = function( node, raw ) {
	if ( raw ) {
		return this.content( node.content );
	} else {
		return ve.Html.makeTag( 'p', {}, this.content( node.content ) );
	}
};

ve.dm.HtmlSerializer.prototype.list = function( node ) {
	return this.document(
		node, ve.dm.HtmlSerializer.listTags[node.attributes.style]
	);
};

ve.dm.HtmlSerializer.prototype.listItem = function( node ) {
	return this.document(
		node, ve.dm.HtmlSerializer.listItemTags[node.attributes.style]
	);
};

ve.dm.HtmlSerializer.prototype.table = function( node ) {
	return this.document( node, 'table' );
};

ve.dm.HtmlSerializer.prototype.tableRow = function( node ) {
	return this.document( node, 'tr' );
};

ve.dm.HtmlSerializer.prototype.tableCell = function( node ) {
	return this.document(
		node, ve.dm.HtmlSerializer.tableCellTags[node.attributes.type], true
	);
};

ve.dm.HtmlSerializer.prototype.tableCaption = function( node ) {
	return ve.Html.makeTag(
		'caption',
		ve.dm.HtmlSerializer.getHtmlAttributes( node.attributes ),
		this.content( node.content )
	);
};

ve.dm.HtmlSerializer.prototype.transclusion = function( node ) {
	var title = [];
	if ( node.namespace !== 'Main' ) {
		title.push( node.namespace );
	}
	title.push( node.title );
	title = title.join( ':' );
	return ve.Html.makeTag( 'a', { 'href': '/wiki/' + title }, title );
};

ve.dm.HtmlSerializer.prototype.parameter = function( node ) {
	return '{{{' + node.name + '}}}';
};

ve.dm.HtmlSerializer.prototype.content = function( node ) {
	if ( 'annotations' in node && node.annotations.length ) {
		var annotationSerializer = new ve.dm.AnnotationSerializer(),
			tagTable = {
				'textStyle/bold': 'b',
				'textStyle/italic': 'i',
				'textStyle/strong': 'strong',
				'textStyle/emphasize': 'em',
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
