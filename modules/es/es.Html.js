/**
 * Static object with HTML generation helpers.
 */
es.Html = {
	'escapeText': function( text ) {
		return text
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#039;' );
	},
	'makeAttributeList': function( attributes, prespace ) {
		var attr = [];
		var name;
		if ( attributes ) {
			for ( name in attributes ) {
				attr.push( name + '="' + attributes[name] + '"' );
			}
		}
		return ( prespace && attr.length ? ' ' : '' ) + attr.join( ' ' );
	},
	'makeOpeningTag': function( name, attributes ) {
		return '<' + name + es.Html.makeAttributeList( attributes, true ) + '>';
	},
	'makeClosingTag': function( name ) {
		return '</' + name + '>';
	},
	'makeTag': function( name, attributes, value, escape ) {
		if ( value === false ) {
			return '<' + name + es.Html.makeAttributeList( attributes, true ) + ' />';
		} else {
			if ( escape ) {
				value = wiki.util.xml.esc( value );
			}
			return '<' + name + es.Html.makeAttributeList( attributes, true ) + '>' +
				value + '</' + name + '>';
		}
	}
};
