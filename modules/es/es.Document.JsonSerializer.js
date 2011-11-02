/**
 * Serializes a WikiDom into JSON.
 * 
 * @class
 * @constructor
 * @extends {es.Document.Serializer}
 * @param context {es.WikiContext} Context of the wiki the document is a part of
 * @property options {Object} List of options for serialization
 * @property options.indentWith {String} Text to use as indentation, such as \t or 4 spaces
 */
es.Document.JsonSerializer = function( context, options ) {
	es.Document.Serializer.call( this, context );
	this.options = $.extend( {
		'indentWith': '\t'
	}, options || {} );
};

/* Static Methods */

es.Document.JsonSerializer.typeOf = function( value ) {
	if ( typeof value === 'object' ) {
		if ( value === null ) {
			return 'null';
		}
		switch ( value.constructor ) {
			case [].constructor:
				return 'array';
			case ( new Date() ).constructor:
				return 'date';
			case ( new RegExp() ).constructor:
				return 'regex';
			default:
				return 'object';
		}
	}
	return typeof value;
};

es.Document.JsonSerializer.prototype.encode = function( data, indention ) {
	if ( indention === undefined ) {
		indention = '';
	}
	var type = es.Document.JsonSerializer.typeOf( data );
	
	// Open object/array
	var json = '',
		key;
	if ( type === 'array' ) {
		if (data.length === 0) {
			// Empty array
			return '[]';
		}
		json += '[';
	} else {
		var empty = true;
		for ( key in data ) {
			if ( data.hasOwnProperty( key ) ) {
				empty = false;
				break;
			}
		}
		if ( empty ) {
			return '{}';
		}
		json += '{';
	}
	
	// Iterate over items
	var comma = false;
	for ( key in data ) {
		if ( data.hasOwnProperty( key ) ) {
			json += ( comma ? ',' : '' ) + '\n' + indention + this.options.indentWith +
				( type === 'array' ? '' : '"' + key + '"' + ': ' );
			switch ( es.Document.JsonSerializer.typeOf( data[key] ) ) {
				case 'array':
				case 'object':
					json += this.encode(
						data[key], indention + this.options.indentWith
					);
					break;
				case 'boolean':
				case 'number':
					json += data[key].toString();
					break;
				case 'null':
					json += 'null';
					break;
				case 'string':
					json += '"' + data[key]
						.replace(/[\n]/g, '\\n')
						.replace(/[\t]/g, '\\t') + '"';
					break;
				// Skip other types
			}
			comma = true;
		}
	}
	
	// Close object/array
	json += '\n' + indention + ( type === 'array' ? ']' : '}' );
	
	return json;
};

/* Methods */

es.Document.JsonSerializer.prototype.serializeDocument = function( doc ) {
	return this.encode( doc );
};

/* Registration */

es.Document.serializers.json = function( doc, context, options ) {
	var serializer = new es.Document.JsonSerializer( context, options );
	return serializer.serializeDocument( doc );
};

/* Inheritance */

es.extend( es.Document.JsonSerializer, es.Document.Serializer );
