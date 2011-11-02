/**
 * Creates an annotation renderer object.
 * 
 * @class
 * @constructor
 * @property annotations {Object} List of annotations to be applied
 */
es.AnnotationSerializer = function() {
	this.annotations = {};
};

/* Static Methods */

/**
 * Adds a set of annotations to be inserted around a range of text.
 * 
 * Insertions for the same range will be nested in order of declaration.
 * @example
 *     stack = new es.AnnotationSerializer();
 *     stack.add( new es.Range( 1, 2 ), '[', ']' );
 *     stack.add( new es.Range( 1, 2 ), '{', '}' );
 *     // Outputs: "a[{b}]c"
 *     console.log( stack.render( 'abc' ) );
 * 
 * @param range {es.Range} Range to insert text around
 * @param pre {String} Text to insert before range
 * @param post {String} Text to insert after range
 */
es.AnnotationSerializer.prototype.add = function( range, pre, post ) {
	// TODO: Once we are using Range objects, we should do a range.normalize(); here
	if ( !( range.start in this.annotations ) ) {
		this.annotations[range.start] = [pre];
	} else {
		this.annotations[range.start].push( pre );
	}
	if ( !( range.end in this.annotations ) ) {
		this.annotations[range.end] = [post];
	} else {
		this.annotations[range.end].unshift( post );
	}
};

/**
 * Renders annotations into text.
 * 
 * @param text {String} Text to apply annotations to
 * @returns {String} Wrapped text
 */
es.AnnotationSerializer.prototype.render = function( text ) {
	var out = '';
	for ( var i = 0, length = text.length; i <= length; i++ ) {
		if ( i in this.annotations ) {
			out += this.annotations[i].join( '' );
		}
		if ( i < length ) {
			out += text[i];
		}
	}
	return out;
};
