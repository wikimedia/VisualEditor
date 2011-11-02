/**
 * Serializes a WikiDom into JSON.
 * 
 * @class
 * @constructor
 * @extends {es.Serializer}
 * @property options {Object} List of options for serialization
 * @property options.indentWith {String} Text to use as indentation, such as \t or 4 spaces
 */
es.JsonSerializer = function( options ) {
	es.Serializer.call( this );
	this.options = $.extend( {
		'indentWith': '\t'
	}, options || {} );
};

/* Static Methods */

es.JsonSerializer.typeOf = function( value ) {
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

es.JsonSerializer.prototype.encode = function( data, indention ) {
	if ( indention === undefined ) {
		indention = '';
	}
	var type = es.JsonSerializer.typeOf( data ),
		key;
	
	// Open object/array
	var json = '';
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
			switch ( es.JsonSerializer.typeOf( data[key] ) ) {
				case 'array':
				case 'object':
					json += this.encode( data[key], indention + this.options.indentWith );
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
