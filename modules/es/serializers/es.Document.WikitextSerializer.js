/**
 * Serializes a WikiDom into Wikitext.
 * 
 * @class
 * @constructor
 * @extends {es.Document.Serializer}
 * @param context {es.WikiContext} Context of the wiki the document is a part of
 * @property options {Object} List of options for serialization
 * @property serializers {Object} List of serializing methods indexed by symbolic object names
 */
es.Document.WikitextSerializer = function( context, options ) {
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

es.Document.WikitextSerializer.prototype.serializeDocument = function( doc, rawFirstParagraph ) {
	var out = [];
	for ( var b = 0, bMax = doc.blocks.length; b < bMax; b++ ) {
		var block = doc.blocks[b];
		if ( block.type in this.serializers ) {
			if ( block.type === 'paragraph' ) {
				out.push(
					this.serializeParagraph( block, rawFirstParagraph && b === 0 )
				);
				if ( b + 1 < bMax /* && doc.blocks[b + 1].type === 'paragraph' */ ) {
					out.push( '' );
				}
			} else {
				out.push( this.serializers[block.type].call( this, block ) );
			}
		}
	}
	return out.join( '\n' );
};

es.Document.WikitextSerializer.prototype.serializeComment = function( comment ) {
	return '<!--' + comment.text + '-->';
};

es.Document.WikitextSerializer.prototype.serializeHorizontalRule = function( rule ) {
	return '----';
};

es.Document.WikitextSerializer.prototype.serializeHeading = function( heading ) {
	var symbols = es.Document.Serializer.repeatString( '=', heading.level );
	return symbols + this.serializeLine( heading.line ) + symbols;
};

es.Document.WikitextSerializer.prototype.serializeParagraph = function( paragraph ) {
	var out = [];
	for ( var l = 0, lMax = paragraph.lines.length; l < lMax; l++ ) {
		out.push( this.serializeLine( paragraph.lines[l] ) );
	}
	return out.join( '\n' );
};

es.Document.WikitextSerializer.prototype.serializeList = function( list, path ) {
	if ( typeof path === 'undefined' ) {
		path = '';
	}
	var symbols = {
		'bullet': '*',
		'number': '#'
	};
	path += symbols[list.style];
	var out = [];
	for ( var i = 0, iMax = list.items.length; i < iMax; i++ ) {
		out.push( this.serializeItem( list.items[i], path ) );
	}
	return out.join( '\n' );
};

es.Document.WikitextSerializer.prototype.serializeTable = function( table ) {
	var out = [];
	var types = {
		'heading': '!',
		'data': '|'
	};
	out.push( '{|' + es.Document.Serializer.buildXmlAttributes( table.attributes ) );
	for ( var r = 0, rMax = table.rows.length; r < rMax; r++ ) {
		var row = table.rows[r];
		if ( r ) {
			out.push( '|-' );
		}
		for ( var c = 0, cMax = row.length; c < cMax; c++ ) {
			var type = types[row[c].type || 'data'],
				attr = row[c].attributes ?
					es.Document.Serializer.buildXmlAttributes( row[c].attributes ) + '|' : '';
			out.push( type + attr + this.serializeDocument( row[c].document, true ) );
		}
	}
	out.push( '|}' );
	return out.join( '\n' );
};

es.Document.WikitextSerializer.prototype.serializeTransclusion = function( transclusion ) {
	var title = [];
	if ( transclusion.namespace === 'Main' ) {
		title.push( '' );
	} else if ( transclusion.namespace !== 'Template' ) {
		title.push( transclusion.namespace );
	}
	title.push( transclusion.title );
	return '{{' + title.join( ':' ) + '}}';
};

es.Document.WikitextSerializer.prototype.serializeParameter = function( parameter ) {
	return '{{{' + parameter.name + '}}}';
};

es.Document.WikitextSerializer.prototype.serializeItem = function( item, path ) {
	if ( 'lists' in item && item.lists.length ) {
		var out = [];
		if ( item.line ) {
			out.push( path + ' ' + this.serializeLine( item.line ) );
		}
		for ( var l = 0, lMax = item.lists.length; l < lMax; l++ ) {
			out.push( this.serializeList( item.lists[l], path ) );
		}
		return out.join( '\n' );
	} else {
		return path + ' ' + this.serializeLine( item.line );
	}
};

es.Document.WikitextSerializer.prototype.serializeLine = function( line ) {
	if ( 'annotations' in line && line.annotations.length ) {
		var as = new es.AnnotationSerializer();
		for ( var a = 0, aMax = line.annotations.length; a < aMax; a++ ) {
			var an = line.annotations[a];
			switch ( an.type ) {
				case 'bold':
					as.add( an.range, '\'\'\'', '\'\'\'' );
					break;
				case 'italic':
					as.add( an.range, '\'\'', '\'\'' );
					break;
				case 'xlink':
					as.add( an.range, '[' + an.data.href + ' ', ']' );
					break;
				case 'ilink':
					as.add( an.range, '[[' + an.data.title + '|', ']]' );
					break;
			}
		}
		return as.render( line.text );
	} else {
		return line.text;
	}
};

/* Registration */

es.Document.serializers.wikitext = function( doc, context, options ) {
	var serializer = new es.Document.WikitextSerializer( context, options );
	return serializer.serializeDocument( doc );
};

/* Inheritance */

es.extendClass( es.Document.WikitextSerializer, es.Document.Serializer );
