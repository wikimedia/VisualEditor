/**
 * Serializes a WikiDom into HTML.
 * 
 * @class
 * @constructor
 * @extends {es.Document.Serializer}
 * @param context {es.Document.Context} Context of the wiki the document is a part of
 * @property options {Object} List of options for serialization
 * @property serializers {Object} List of serializing methods indexed by symbolic object names
 */
es.Document.HtmlSerializer = function( context, options ) {
	es.Document.Serializer.call( this, context );
	this.options = $.extend( {
		// defaults
	}, options || {} );
	this.serializers = {
		'comment': this.serializeComment,
		'horizontal-rule': this.serializeHorizontalRule,
		'heading': this.serializeHeading,
		'paragraph': this.serializeParagraph,
		'list': this.serializeList,
		'table': this.serializeTable,
		'transclusion': this.serializeTransclusion,
		'parameter': this.serializeParameter
	};
};

/* Methods */

es.Document.HtmlSerializer.prototype.serializeDocument = function( doc, rawFirstParagraph ) {
	var out = [];
	for ( var b = 0, bMax = doc.blocks.length; b < bMax; b++ ) {
		var block = doc.blocks[b];
		if ( block.type in this.serializers ) {
			if ( block.type === 'paragraph' ) {
				out.push( this.serializeParagraph( block, rawFirstParagraph && b === 0 ) );
			} else {
				out.push( this.serializers[block.type].call( this, block ) );
			}
		}
	}
	return out.join( '\n' );
};

es.Document.HtmlSerializer.prototype.serializeComment = function( comment ) {
	return '<!--' + comment.text + '-->';
};

es.Document.HtmlSerializer.prototype.serializeHorizontalRule = function( rule ) {
	return es.Document.Serializer.buildXmlTag( 'hr', {}, false );
};

es.Document.HtmlSerializer.prototype.serializeHeading = function( heading ) {
	return es.Document.Serializer.buildXmlTag(
		'h' + heading.level, {}, this.serializeLine( heading.line )
	);
};

es.Document.HtmlSerializer.prototype.serializeParagraph = function( paragraph, raw ) {
	var out = [];
	for ( var l = 0, lMax = paragraph.lines.length; l < lMax; l++ ) {
		out.push( this.serializeLine( paragraph.lines[l] ) );
	}
	if ( raw ) {
		return out.join( '\n' );
	} else {
		return es.Document.Serializer.buildXmlTag( 'p', {}, out.join( '\n' ) );
	}
};

es.Document.HtmlSerializer.prototype.serializeList = function( list ) {
	var tags = {
		'bullet': 'ul',
		'number': 'ol'
	};
	var out = [];
	out.push( es.Document.Serializer.buildXmlOpeningTag( tags[list.style] ) );
	for ( var i = 0, iMax = list.items.length; i < iMax; i++ ) {
		out.push( this.serializeItem( list.items[i] ) );
	}
	out.push( es.Document.Serializer.buildXmlClosingTag( tags[list.style] ) );
	return out.join( '\n' );
};

es.Document.HtmlSerializer.prototype.serializeTable = function( table ) {
	var out = [];
	var types = {
		'heading': 'th',
		'data': 'td'
	};
	out.push( es.Document.Serializer.buildXmlOpeningTag( 'table', table.attributes ) );
	for ( var r = 0, rMax = table.rows.length; r < rMax; r++ ) {
		out.push( es.Document.Serializer.buildXmlOpeningTag( 'tr' ) );
		var row = table.rows[r];
		for ( var c = 0, cMax = row.length; c < cMax; c++ ) {
			var type = types[row[c].type || 'data'];
			out.push( es.Document.Serializer.buildXmlTag(
				type,
				row[c].attributes,
				this.serializeDocument( row[c].document, true )
			) );
		}
		out.push( es.Document.Serializer.buildXmlClosingTag( 'tr' ) );
	}
	out.push( es.Document.Serializer.buildXmlClosingTag( 'table' ) );
	return out.join( '\n' );
};

es.Document.HtmlSerializer.prototype.serializeTransclusion = function( transclusion ) {
	var title = [];
	if ( transclusion.namespace !== 'Main' ) {
		title.push( transclusion.namespace );
	}
	title.push( transclusion.title );
	title = title.join( ':' );
	return es.Document.Serializer.buildXmlTag( 'a', { 'href': '/wiki/' + title }, title );
};

es.Document.HtmlSerializer.prototype.serializeParameter = function( parameter ) {
	return '{{{' + parameter.name + '}}}';
};

es.Document.HtmlSerializer.prototype.serializeItem = function( item ) {
	if ( 'lists' in item && item.lists.length ) {
		var out = [];
		out.push(
			es.Document.Serializer.buildXmlOpeningTag( 'li' ) + this.serializeLine( item.line )
		);
		for ( var l = 0, lMax = item.lists.length; l < lMax; l++ ) {
			out.push( this.serializeList( item.lists[l] ) );
		}
		out.push( es.Document.Serializer.buildXmlClosingTag( 'li' ) );
		return out.join( '\n' );
	} else {
		return es.Document.Serializer.buildXmlTag( 'li', {}, this.serializeLine( item.line ) );
	}
};

es.Document.HtmlSerializer.prototype.serializeLine = function( line ) {
	var as = new es.AnnotationSerializer();
	function addXml( range, tag, attributes ) {
		as.add(
			range,
			es.Document.Serializer.buildXmlOpeningTag( tag, attributes ),
			es.Document.Serializer.buildXmlClosingTag( tag )
		);
	}
	if ( 'annotations' in line && line.annotations.length ) {
		for ( var a = 0, aMax = line.annotations.length; a < aMax; a++ ) {
			var an = line.annotations[a];
			switch ( an.type ) {
				case 'bold':
					addXml( an.range, 'strong' );
					break;
				case 'italic':
					addXml( an.range, 'em' );
					break;
				case 'size':
					switch ( an.data.type ) {
						case 'big':
							addXml( an.range, 'big' );
							break;
						case 'small':
							addXml( an.range, 'small' );
							break;
					}
					break;
				case 'script':
					switch ( an.data.type ) {
						case 'super':
							addXml( an.range, 'sup' );
							break;
						case 'sub':
							addXml( an.range, 'sub' );
							break;
					}
					break;
				case 'xlink':
					addXml( an.range, 'a', { 'href': an.data.url } );
					break;
				case 'ilink':
					addXml( an.range, 'a', { 'href': '/wiki/' + an.data.title } );
					break;
				case 'template':
					as.add( an.range, an.data.html, '' );
					break;
			}
		}
		return as.render( line.text );
	} else {
		return line.text;
	}
};

/* Registration */

es.Document.serializers.html = function( doc, context, options ) {
	var serializer = new es.Document.HtmlSerializer( context, options );
	return serializer.serializeDocument( doc );
};

/* Inheritance */

es.extendClass( es.Document.HtmlSerializer, es.Document.Serializer );
