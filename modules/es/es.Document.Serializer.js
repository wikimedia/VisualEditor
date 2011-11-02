/**
 * Creates content serializer.
 * 
 * Base object for all serializers, providing basic shared functionality and stubs for required
 * implementations.
 * 
 * @class
 * @constructor
 * @param context {es.WikiContext} Context of the wiki the document is a part of
 * @property context {es.WikiContext} Context of the wiki the document is a part of
 */
es.Document.Serializer = function( context ) {
	this.context = context;
};

/* Static Methods */

es.Document.Serializer.repeatString = function( pattern, count ) {
	if ( count < 1 ) {
		return '';
	}
	var result = '';
	while ( count > 0 ) {
		if ( count & 1 ) { result += pattern; }
		count >>= 1;
		pattern += pattern;
	}
	return result;
};

es.Document.Serializer.escapeXmlText = function( text ) {
	return text
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#039;' );
};

es.Document.Serializer.buildXmlAttributes = function( attributes, prespace ) {
	var attr = [];
	var name;
	if ( attributes ) {
		for ( name in attributes ) {
			attr.push( name + '="' + attributes[name] + '"' );
		}
	}
	return ( prespace && attr.length ? ' ' : '' ) + attr.join( ' ' );
};

es.Document.Serializer.buildXmlOpeningTag = function( tag, attributes ) {
	return '<' + tag + es.Document.Serializer.buildXmlAttributes( attributes, true ) + '>';
};

es.Document.Serializer.buildXmlClosingTag = function( tag ) {
	return '</' + tag + '>';
};

es.Document.Serializer.buildXmlTag = function( tag, attributes, value, escape ) {
	if ( value === false ) {
		return '<' + tag + es.Document.Serializer.buildXmlAttributes( attributes, true ) + ' />';
	} else {
		if ( escape ) {
			value = wiki.util.xml.esc( value );
		}
		return '<' + tag + es.Document.Serializer.buildXmlAttributes( attributes, true ) + '>' +
			value + '</' + tag + '>';
	}
};
