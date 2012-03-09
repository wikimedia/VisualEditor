/**
 * Creates an ve.dm.DocumentNode object.
 * 
 * ve.dm.DocumentNode objects extend the native Array object, so it's contents are directly
 * accessible through the typical methods.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {Array} data Model data to initialize with, such as data from ve.dm.DocumentNode.getData()
 * @param {Object} attributes Document attributes
 */
ve.dm.DocumentNode = function( data, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'document', null );

	// Properties
	this.data = ve.isArray( data ) ? data : [];
	this.attributes = ve.isPlainObject( attributes ) ? attributes : {};

	// Auto-generate model tree
	var nodes = ve.dm.DocumentNode.createNodesFromData( this.data );
	for ( var i = 0; i < nodes.length; i++ ) {
		this.push( nodes[i] );
	}
};

/* Static Members */

/**
 * Mapping of symbolic names and node model constructors.
 */
ve.dm.DocumentNode.nodeModels = {};

/**
 * Mapping of symbolic names and nesting rules.
 * 
 * Each rule is an object with the follwing properties:
 *     parents and children properties may contain one of two possible values:
 *         {Array} List symbolic names of allowed element types (if empty, none will be allowed)
 *         {Null} Any element type is allowed (as long as the other element also allows it)
 * 
 * @example Paragraph rules
 *     {
 *         'parents': null,
 *         'children': []
 *     }
 * @example List rules
 *     {
 *         'parents': null,
 *         'children': ['listItem']
 *     }
 * @example ListItem rules
 *     {
 *         'parents': ['list'],
 *         'children': null
 *     }
 * @example TableCell rules
 *     {
 *         'parents': ['tableRow'],
 *         'children': null
 *     }
 */
ve.dm.DocumentNode.nodeRules = {
	'document': {
		'parents': null,
		'children': null
	}
};

/* Static Methods */

/*
 * Create child nodes from an array of data.
 * 
 * These child nodes are used for the model tree, which is a space partitioning data structure in
 * which each node contains the length of itself (1 for opening, 1 for closing) and the lengths of
 * it's child nodes.
 */
ve.dm.DocumentNode.createNodesFromData = function( data ) {
	var currentNode = new ve.dm.BranchNode();
	for ( var i = 0, length = data.length; i < length; i++ ) {
		if ( data[i].type !== undefined ) {
			// It's an element, figure out it's type
			var element = data[i],
				type = element.type,
				open = type.charAt( 0 ) !== '/';
			// Trim the "/" off the beginning of closing tag types
			if ( !open ) {
				type = type.substr( 1 );
			}
			if ( open ) {
				// Validate the element type
				if ( !( type in ve.dm.DocumentNode.nodeModels ) ) {
					throw 'Unsuported element error. No class registered for element type: ' + type;
				}
				// Create a model node for the element
				var newNode = new ve.dm.DocumentNode.nodeModels[element.type]( element, 0 );
				// Add the new model node as a child
				currentNode.push( newNode );
				// Descend into the new model node
				currentNode = newNode;
			} else {
				// Return to the parent node
				currentNode = currentNode.getParent();
				if ( currentNode === null ) {
					throw 'createNodesFromData() received unbalanced data: ' +
						'found closing without matching opening at index ' + i;
				}
			}
		} else {
			// It's content, let's start tracking the length
			var start = i;
			// Move forward to the next object, tracking the length as we go
			while ( data[i].type === undefined && i < length ) {
				i++;
			}
			// Now we know how long the current node is
			currentNode.setContentLength( i - start );
			// The while loop left us 1 element to far
			i--;
		}
	}
	return currentNode.getChildren().slice( 0 );
};

/**
 * Creates a document model from a plain object.
 * 
 * @static
 * @method
 * @param {Object} obj Object to create new document model from
 * @returns {ve.dm.DocumentNode} Document model created from obj
 */
ve.dm.DocumentNode.newFromPlainObject = function( obj ) {
	if ( obj.type === 'document' ) {
		var data = [],
			attributes = ve.isPlainObject( obj.attributes ) ? ve.copyObject( obj.attributes ) : {};
		for ( var i = 0; i < obj.children.length; i++ ) {
			data = data.concat(
				ve.dm.DocumentNode.flattenPlainObjectElementNode( obj.children[i] )
			);
		}
		return new ve.dm.DocumentNode( data, attributes );
	}
	throw 'Invalid object error. Object is not a valid document object.';
};

/**
 * Generates a hash of an annotation object based on it's name and data.
 * 
 * @static
 * @method
 * @param {Object} annotation Annotation object to generate hash for
 * @returns {String} Hash of annotation
 */
ve.dm.DocumentNode.getHash = ( window.JSON && typeof JSON.stringify === 'function' ) ?
	JSON.stringify : ve.dm.JsonSerializer.stringify;

/**
 * Gets the index of the first instance of a given annotation.
 * 
 * This method differs from ve.inArray because it compares hashes instead of references.
 * 
 * @static
 * @method
 * @param {Array} annotations Annotations to search through
 * @param {Object} annotation Annotation to search for
 * @param {Boolean} typeOnly Whether to only consider the type
 * @returns {Integer} Index of annotation in annotations, or -1 if annotation was not found
 */
ve.dm.DocumentNode.getIndexOfAnnotation = function( annotations, annotation, typeOnly ) {
	if ( annotation === undefined || annotation.type === undefined ) {
		throw 'Invalid annotation error. Can not find non-annotation data in character.';
	}
	if ( ve.isArray( annotations ) ) {
		// Find the index of a comparable annotation (checking for same value, not reference)
		for ( var i = 0; i < annotations.length; i++ ) {
			// Skip over character data - used when this is called on a content data item
			if ( typeof annotations[i] === 'string' ) {
				continue;
			}
			if (
				(
					typeOnly && 
					annotations[i].type === annotation.type
				) ||
				(
					!typeOnly &&
					annotations[i].hash === (
						annotation.hash || ve.dm.DocumentNode.getHash( annotation )
					)
				)
			) {
				return i;
			}
		}
	}
	return -1;
};

/**
 * Gets a list of indexes of annotations that match a regular expression.
 * 
 * @static
 * @method
 * @param {Array} annotations Annotations to search through
 * @param {RegExp} pattern Regular expression pattern to match with
 * @returns {Integer[]} List of indexes in annotations that match
 */
ve.dm.DocumentNode.getMatchingAnnotations = function( annotations, pattern ) {
	if ( !( pattern instanceof RegExp ) ) {
		throw 'Invalid annotation error. Can not find non-annotation data in character.';
	}
	var matches = [];
	if ( ve.isArray( annotations ) ) {
		// Find the index of a comparable annotation (checking for same value, not reference)
		for ( var i = 0; i < annotations.length; i++ ) {
			// Skip over character data - used when this is called on a content data item
			if ( typeof annotations[i] === 'string' ) {
				continue;
			}
			if ( pattern.test( annotations[i].type ) ) {
				matches.push( annotations[i] );
			}
		}
	}
	return matches;
};

/**
 * Sorts annotations of a character.
 * 
 * This method modifies data in place. The string portion of the annotation character will always
 * remain at the beginning.
 * 
 * @static
 * @method
 * @param {Array} character Annotated character to be sorted
 */
ve.dm.DocumentNode.sortCharacterAnnotations = function( character ) {
	if ( !ve.isArray( character ) ) {
		return;
	}
	character.sort( function( a, b ) {
		var aHash = a.hash || ve.dm.DocumentNode.getHash( a ),
			bHash = b.hash || ve.dm.DocumentNode.getHash( b );
		return typeof a === 'string' ? -1 :
			( typeof b === 'string' ? 1 : ( aHash == bHash ? 0 : ( aHash < bHash ? -1 : 1 ) ) );
	} );
};

/**
 * Adds annotation hashes to content data.
 * 
 * This method modifies data in place.
 * 
 * @method
 * @param {Array} data Data to add annotation hashes to
 */
ve.dm.DocumentNode.addAnnotationHashesToData = function( data ) {
	for ( var i = 0; i < data.length; i++ ) {
		if ( ve.isArray( data[i] ) ) {
			for ( var j = 1; j < data.length; j++ ) {
				if ( data[i][j].hash === undefined ) {
					data[i][j].hash = ve.dm.DocumentNode.getHash( data[i][j] );
				}
			}
		}
	}
};

/**
 * Applies annotations to content data.
 * 
 * This method modifies data in place.
 * 
 * @method
 * @param {Array} data Data to remove annotations from
 * @param {Array} annotations Annotations to apply
 */
ve.dm.DocumentNode.addAnnotationsToData = function( data, annotations ) {
	if ( annotations && annotations.length ) {
		for ( var i = 0; i < data.length; i++ ) {
			if ( ve.isArray( data[i] ) ) {
				data[i] = [data[i]];
			}
			data[i] = [data[i]].concat( annotations );
		}
	}
};

/**
 * Removes annotations from content data.
 * 
 * This method modifies data in place.
 * 
 * @method
 * @param {Array} data Data to remove annotations from
 * @param {Array} [annotations] Annotations to remove (all will be removed if undefined)
 */
ve.dm.DocumentNode.removeAnnotationsFromData = function( data, annotations ) {
	for ( var i = 0; i < data.length; i++ ) {
		if ( ve.isArray( data[i] ) ) {
			data[i] = data[i][0];
		}
	}
};

/**
 * Creates an ve.ContentModel object from a plain content object.
 * 
 * A plain content object contains plain text and a series of annotations to be applied to ranges of
 * the text.
 * 
 * @example
 * {
 *     'text': '1234',
 *     'annotations': [
 *         // Makes "23" bold
 *         {
 *             'type': 'bold',
 *             'range': {
 *                 'start': 1,
 *                 'end': 3
 *             }
 *         }
 *     ]
 * }
 * 
 * @static
 * @method
 * @param {Object} obj Plain content object, containing a "text" property and optionally
 * an "annotations" property, the latter of which being an array of annotation objects including
 * range information
 * @returns {Array}
 */
ve.dm.DocumentNode.flattenPlainObjectContentNode = function( obj ) {
	if ( !ve.isPlainObject( obj ) ) {
		// Use empty content
		return [];
	} else {
		// Convert string to array of characters
		var data = obj.text.split('');
		// Render annotations
		if ( ve.isArray( obj.annotations ) ) {
			for ( var i = 0, length = obj.annotations.length; i < length; i++ ) {
				var src = obj.annotations[i];
				// Build simplified annotation object
				var dst = { 'type': src.type };
				if ( 'data' in src ) {
					dst.data = ve.copyObject( src.data );
				}
				// Add a hash to the annotation for faster comparison
				dst.hash = ve.dm.DocumentNode.getHash( dst );
				// Apply annotation to range
				if ( src.range.start < 0 ) {
					// TODO: The start can not be lower than 0! Throw error?
					// Clamp start value
					src.range.start = 0;
				}
				if ( src.range.end > data.length ) {
					// TODO: The end can not be higher than the length! Throw error?
					// Clamp end value
					src.range.end = data.length;
				}
				for ( var j = src.range.start; j < src.range.end; j++ ) {
					// Auto-convert to array
					if ( typeof data[j] === 'string' ) {
						data[j] = [data[j]];
					}
					// Append 
					data[j].push( dst );
				}
			}
		}
		return data;
	}
};

/**
 * Flatten a plain node object into a data array, recursively.
 * 
 * TODO: where do we document this whole structure - aka "WikiDom"?
 * 
 * @static
 * @method
 * @param {Object} obj Plain node object to flatten
 * @returns {Array} Flattened version of obj
 */
ve.dm.DocumentNode.flattenPlainObjectElementNode = function( obj ) {
	var i,
		data = [],
		element = { 'type': obj.type };
	if ( ve.isPlainObject( obj.attributes ) ) {
		element.attributes = ve.copyObject( obj.attributes );
	}
	// Open element
	data.push( element );
	if ( ve.isPlainObject( obj.content ) ) {
		// Add content
		data = data.concat( ve.dm.DocumentNode.flattenPlainObjectContentNode( obj.content ) );
	} else if ( ve.isArray( obj.children ) ) {
		// Add children - only do this if there is no content property
		for ( i = 0; i < obj.children.length; i++ ) {
			// TODO: Figure out if all this concatenating is inefficient. I think it is
			data = data.concat( ve.dm.DocumentNode.flattenPlainObjectElementNode( obj.children[i] ) );
		}
	}
	// Close element - TODO: Do we need attributes here or not?
	data.push( { 'type': '/' + obj.type } );
	return data;
};

/**
 * Get a plain object representation of content data.
 * 
 * @method
 * @returns {Object} Plain object representation
 */
ve.dm.DocumentNode.getExpandedContentData = function( data ) {
	var stack = [];
	// Text and annotations
	function start( offset, annotation ) {
		// Make a new verion of the annotation object and push it to the stack
		var obj = {
			'type': annotation.type,
			'range': { 'start': offset }
		};
		if ( annotation.data ) {
			obj.data = ve.copyObject( annotation.data );
		}
		stack.push( obj );
	}
	function end( offset, annotation ) {
		for ( var i = stack.length - 1; i >= 0; i-- ) {
			if ( !stack[i].range.end ) {
				if ( annotation ) {
					// We would just compare hashes, but the stack doesn't contain any
					if ( stack[i].type === annotation.type &&
							ve.compareObjects( stack[i].data, annotation.data ) ) {
						stack[i].range.end = offset;
						break;
					}
				} else {
					stack[i].range.end = offset;
				}
			}
		}
	}
	var left = '',
		right,
		leftPlain,
		rightPlain,
		obj = { 'text': '' },
		offset = 0,
		i,
		j;
	for ( i = 0; i < data.length; i++ ) {
		right = data[i];
		leftPlain = typeof left === 'string';
		rightPlain = typeof right === 'string';
		// Open or close annotations
		if ( !leftPlain && rightPlain ) {
			// [formatted][plain] pair, close any annotations for left
			end( i - offset );
		} else if ( leftPlain && !rightPlain ) {
			// [plain][formatted] pair, open any annotations for right
			for ( j = 1; j < right.length; j++ ) {
				start( i - offset, right[j] );
			}
		} else if ( !leftPlain && !rightPlain ) {
			// [formatted][formatted] pair, open/close any differences
			for ( j = 1; j < left.length; j++ ) {
				if ( ve.dm.DocumentNode.getIndexOfAnnotation( data[i] , left[j], true ) === -1 ) {
					end( i - offset, left[j] );
				}
			}
			for ( j = 1; j < right.length; j++ ) {
				if ( ve.dm.DocumentNode.getIndexOfAnnotation( data[i - 1], right[j], true ) === -1 ) {
					start( i - offset, right[j] );
				}
			}
		}
		obj.text += rightPlain ? right : right[0];
		left = right;		
	}
	if ( data.length ) {
		end( i - offset );
	}
	if ( stack.length ) {
		obj.annotations = stack;
	}
	// Copy attributes if there are any set
	if ( !ve.isEmptyObject( this.attributes ) ) {
		obj.attributes = ve.extendObject( true, {}, this.attributes );
	}
	return obj;
};

/**
 * Checks if a data at a given offset is content.
 * 
 * @example Content data:
 *      <paragraph> a b c </paragraph> <list> <listItem> d e f </listItem> </list>
 *                 ^ ^ ^                                ^ ^ ^
 * 
 * @static
 * @method
 * @param {Array} data Data to evaluate offset within
 * @param {Integer} offset Offset in data to check
 * @returns {Boolean} If data at offset is content
 */
ve.dm.DocumentNode.isContentData = function( data, offset ) {
	// Shortcut: if there's already content there, we will trust it's supposed to be there
	return typeof data[offset] === 'string' || ve.isArray( data[offset] );
};

/**
 * Checks if a data at a given offset is an element.
 * 
 * @example Element data:
 *      <paragraph> a b c </paragraph> <list> <listItem> d e f </listItem> </list>
 *     ^                 ^            ^      ^                ^           ^
 * 
 * @static
 * @method
 * @param {Array} data Data to evaluate offset within
 * @param {Integer} offset Offset in data to check
 * @returns {Boolean} If data at offset is an element
 */
ve.dm.DocumentNode.isElementData = function( data, offset ) {
	// TODO: Is there a safer way to check if it's a plain object without sacrificing speed?
	return offset >= 0 && offset < data.length && data[offset].type !== undefined;
};

/**
 * Checks if an offset within given data is structural.
 * 
 * Structural offsets are those at the beginning, end or surrounded by elements. This differs
 * from a location at which an element is present in that elements can be safely inserted at a
 * structural location, but not nessecarily where an element is present.
 * 
 * @example Structural offsets:
 *      <paragraph> a b c </paragraph> <list> <listItem> d e f </listItem> </list>
 *     ^                              ^      ^                            ^       ^
 * 
 * @static
 * @method
 * @param {Array} data Data to evaluate offset within
 * @param {Integer} offset Offset to check
 * @returns {Boolean} Whether offset is structural or not
 */
ve.dm.DocumentNode.isStructuralOffset = function( data, offset ) {
	// Edges are always structural
	if ( offset === 0 || offset === data.length ) {
		return true;
	}
	// Structual offsets will have elements on each side
	if ( data[offset - 1].type !== undefined && data[offset].type !== undefined ) {
		if ( '/' + data[offset - 1].type === data[offset].type ) {
			return false;
		}
		return true;
	}
	return false;
};

/**
 * Checks if elements are present within data.
 * 
 * @static
 * @method
 * @param {Array} data Data to look for elements within
 * @returns {Boolean} If elements exist in data
 */
ve.dm.DocumentNode.containsElementData = function( data ) {
	for ( var i = 0, length = data.length; i < length; i++ ) {
		if ( data[i].type !== undefined ) {
			return true;
		}
	}
	return false;
};

/* Methods */

/**
 * Creates a document view for this model.
 * 
 * @method
 * @returns {ve.ce.DocumentNode}
 */
ve.dm.DocumentNode.prototype.createView = function() {
	return new ve.ce.DocumentNode( this );
};

/**
 * Gets copy of the document data.
 * 
 * @method
 * @param {ve.Range} [range] Range of data to get, all data will be given by default
 * @param {Boolean} [deep=false] Whether to return a deep copy (WARNING! This may be very slow)
 * @returns {Array} Copy of document data
 */
ve.dm.DocumentNode.prototype.getData = function( range, deep ) {
	var start = 0,
		end;
	if ( range !== undefined ) {
		range.normalize();
		start = Math.max( 0, Math.min( this.data.length, range.start ) );
		end = Math.max( 0, Math.min( this.data.length, range.end ) );
	}
	// Work around IE bug: arr.slice( 0, undefined ) returns [] while arr.slice( 0 ) behaves
	// correctly
	var data = end === undefined ? this.data.slice( start ) : this.data.slice( start, end );
	return deep ? ve.copyArray( data ) : data;
};

/**
 * Gets the element object of a node.
 * 
 * @method
 * @param {ve.dm.Node} node Node to get element object for
 * @returns {Object|null} Element object
 */
ve.dm.DocumentNode.prototype.getElementFromNode = function( node ) {
	var offset = this.getOffsetFromNode( node );
	if ( offset !== false ) {
		return this.data[offset];
	}
	return null;
};

/**
 * Gets the element data of a node.
 * 
 * @method
 * @param {ve.dm.Node} node Node to get element data for
 */
ve.dm.DocumentNode.prototype.getElementDataFromNode = function( node ) {
	var length = node.getElementLength();
	var offset = this.getOffsetFromNode( node );
	if ( offset !== -1 ) {
		return this.data.slice( offset, offset + length );
	}
	return null;
};

/**
 * Gets the content data of a node.
 * 
 * @method
 * @param {ve.dm.Node} node Node to get content data for
 * @returns {Array|null} List of content and elements inside node or null if node is not found
 */
ve.dm.DocumentNode.prototype.getContentDataFromNode = function( node, range ) {
	var length = node.getContentLength();
	if ( range ) {
		range.normalize();
		if ( range.start < 0 ) {
			throw 'Invalid range error. Range can not start before node start: ' + range.start;
		}
		if ( range.end > length ) {
			throw 'Invalid range error. Range can not end after node end: ' + range.end;
		}
	} else {
		range = {
			'start': 0,
			'end': length
		};
	}
	var offset = this.getOffsetFromNode( node );
	if ( offset !== -1 ) {
		if ( node.type !== 'document' ) {
			offset++;
		}
		return this.data.slice( offset + range.start, offset + range.end );
	}
	return null;
};

/**
 * Gets the range of content surrounding a given offset that's covered by a given annotation.
 * 
 * @method
 * @param {Integer} offset Offset to begin looking forward and backward from
 * @param {Object} annotation Annotation to test for coverage with
 * @returns {ve.Range|null} Range of content covered by annotation, or null if offset is not covered
 */
ve.dm.DocumentNode.prototype.getAnnotationBoundaries = function( offset, annotation, typeOnly ) {
	// Alias to reduce hash table lookups
	var DocumentNode = ve.dm.DocumentNode;
	if ( annotation.hash === undefined ) {
		annotation.hash = DocumentNode.getHash( annotation );
	}
	if ( DocumentNode.getIndexOfAnnotation( this.data[offset], annotation, typeOnly ) === -1 ) {
		return null;
	}
	var start = offset,
		end = offset,
		item;
	while ( start > 0 ) {
		start--;
		if ( DocumentNode.getIndexOfAnnotation( this.data[start], annotation, typeOnly ) === -1 ) {
			start++;
			break;
		}
	}
	while ( end < this.data.length ) {
		if ( DocumentNode.getIndexOfAnnotation( this.data[end], annotation, typeOnly ) === -1 ) {
			break;
		}
		end++;
	}
	return new ve.Range( start, end );
};

/**
 * Gets a list of annotations that a given offset is covered by.
 * 
 * @method
 * @param {Integer} offset Offset to get annotations for
 * @returns {Object[]} A copy of all annotation objects offset is covered by
 */
ve.dm.DocumentNode.prototype.getAnnotationsFromOffset = function( offset, byref ) {
	if ( ve.isArray( this.data[offset] ) ) {
		if ( byref === true ) {
			return this.data[offset].slice( 1 );	
		} else {
			return ve.copyArray( this.data[offset].slice( 1 ) );
		}
	}
	return [];
};

/**
 * Gets a list of annotations that a given range is covered by.
 * 
 * @method
 * @param {ve.Range} range Range to get annotations for
 * @returns {Object[]} A copy of all annotation objects offset is covered by
 */
ve.dm.DocumentNode.prototype.getAnnotationsFromRange = function( range ) {
	range.normalize();
	var annotations = {
			'full': [],
			'partial': [],
			'all': []
		},
		map = {},
		elementsCount = 0;
	for ( var i = range.start; i < range.end; i++ ) {
		if ( ve.dm.DocumentNode.isElementData( this.data, i ) ) {
			elementsCount++;
			continue;
		}
		for ( var j = 1; j < this.data[i].length; j++ ) {
			hash = this.data[i][j].hash;
			if ( hash in map ) {
				map[hash][1]++;
			} else {
				map[hash] = [this.data[i][j], 1];
			}
		}
	}
	var length = range.getLength();
	for ( var hash in map ) {
		if ( map[hash][1] === length - elementsCount ) {
			annotations.full.push( map[hash][0] );
		} else {
			annotations.partial.push( map[hash][0] );
		}
		annotations.all.push( map[hash][0] );
	}
	return annotations;
};

/**
 * Gets the range of content surrounding a given offset that makes up a whole word.
 * 
 * @method
 * @param {Integer} offset Offset to begin looking forward and backward from
 * @returns {ve.Range|null} Range of content making up a whole word or null if offset is not content
 */
ve.dm.DocumentNode.prototype.getWordBoundaries = function( offset ) {
	if ( ve.dm.DocumentNode.isStructuralOffset( this.data, offset ) ||
		ve.dm.DocumentNode.isElementData( this.data, offset ) ) {
		return null;
	}

	var	offsetItem = typeof this.data[offset] === 'string' ?
			this.data[offset] : this.data[offset][0],
		regex = offsetItem.match( /\B/ ) ? /\b/ : /\B/,
		start = offset,
		end = offset,
		item;
	while ( start > 0 ) {
		start--;
		if ( typeof this.data[start] !== 'string' && !ve.isArray( this.data[start] ) ) {
			start++;
			break;
		}
		item = typeof this.data[start] === 'string' ? this.data[start] : this.data[start][0];
		if ( item.match( regex ) ) {
			start++;
			break;
		}
	}
	while ( end < this.data.length ) {
		if ( typeof this.data[end] !== 'string' && !ve.isArray( this.data[end] ) ) {
			break;
		}
		item = typeof this.data[end] === 'string' ? this.data[end] : this.data[end][0];
		if ( item.match( regex ) ) {
			break;
		}
		end++;
	}
	return new ve.Range( start, end );
};

/**
 * Gets a content offset a given distance forwards or backwards from another.
 * 
 * @method
 * @param {Integer} offset Offset to start from
 * @param {Integer} distance Number of content offsets to move
 * @param {Integer} Offset a given distance from the given offset
 */
ve.dm.DocumentNode.prototype.getRelativeContentOffset = function( offset, distance ) {
	if ( distance === 0 ) {
		return offset;
	}
	var direction = distance > 0 ? 1 : -1,
		i = offset + direction,
		steps = 0;
	distance = Math.abs( distance );
	while ( i > 0 && i < this.data.length ) {
		if ( !ve.dm.DocumentNode.isStructuralOffset( this.data, i ) ) {
			steps++;
			offset = i;
			if ( distance === steps ) {
				return offset;
			}
		}
		i += direction;
	}
	return offset;
};

/**
 * Generates a transaction which inserts data at a given offset.
 * 
 * @method
 * @param {Integer} offset
 * @param {Array} data
 * @returns {ve.dm.Transaction}
 */
ve.dm.DocumentNode.prototype.prepareInsertion = function( offset, data ) {
	/**
	 * Balances mismatched openings/closings in data
	 * @return data itself if nothing was changed, or a clone of data with balancing changes made.
	 * data itself is never touched
	 */
	function balance( data ) {
		var i, stack = [], element, workingData = null;
		
		for ( i = 0; i < data.length; i++ ) {
			if ( data[i].type === undefined ) {
				// Not an opening or a closing, skip
			} else if ( data[i].type.charAt( 0 ) != '/' ) {
				// Opening
				stack.push( data[i].type );
			} else {
				// Closing
				if ( stack.length === 0 ) {
					// The stack is empty, so this is an unopened closing
					// Remove it
					if ( workingData === null ) {
						workingData = data.slice( 0 );
					}
					workingData.splice( i, 1 );
				} else {
					element = stack.pop();
					if ( element != data[i].type.substr( 1 ) ) {
						// Closing doesn't match what's expected
						// This means the input is malformed and cannot possibly
						// have been a fragment taken from well-formed data
						throw 'Input is malformed: expected /' + element + ' but got ' +
							data[i].type + ' at index ' + i;
					}
				}
			}
		}
		
		// Check whether there are any unclosed tags and close them
		if ( stack.length > 0 && workingData === null ) {
			workingData = data.slice( 0 );
		}
		while ( stack.length > 0 ) {
			element = stack.pop();
			workingData.push( { 'type': '/' + element } );
		}
		
		// TODO
		// Check whether there is any raw unenclosed content and deal with that somehow
		
		return workingData || data;
	}
	
	var tx = new ve.dm.Transaction(),
		insertedData = data, // may be cloned and modified
		isStructuralLoc,
		wrappingElementType;
		
	if ( offset < 0 || offset > this.data.length ) {
		throw 'Offset ' + offset + ' out of bounds [0..' + this.data.length + ']';
	}
	
	// Has to be after the bounds check, because isStructuralOffset doesn't like out-of-bounds
	// offsets
	isStructuralLoc = ve.dm.DocumentNode.isStructuralOffset( this.data, offset );
	
	if ( offset > 0 ) {
		tx.pushRetain( offset );
	}
	
	if ( ve.dm.DocumentNode.containsElementData( insertedData ) ) {
		if ( insertedData[0].type !== undefined && insertedData[0].type.charAt( 0 ) != '/' ) {
			// insertedData starts with an opening, so this is really intended to insert structure
			// Balance it to make it sane, if it's not already
			// TODO we need an actual validator and check that the insertion is really valid
			insertedData = balance( insertedData );
			if ( !isStructuralLoc ) {
				// We're inserting structure at a content location,
				// so we need to split up the wrapping element
				wrappingElementType = this.getNodeFromOffset( offset ).getElementType();
				var arr = [{ 'type': '/' + wrappingElementType }, { 'type': wrappingElementType }];
				ve.insertIntoArray( arr, 1, insertedData );
				insertedData = arr;
			}
			// else we're inserting structure at a structural location, which is fine
		} else {
			// insertedData starts with content but contains structure
			// TODO balance and validate, will be different for this case
		}
	} else {
		if ( isStructuralLoc ) {
			// We're inserting content into a structural location,
			// so we need to wrap the inserted content in a paragraph.
			insertedData = [ { 'type': 'paragraph' }, { 'type': '/paragraph' } ];
			ve.insertIntoArray( insertedData, 1, data );
		} else {
			// Content being inserted in content is fine, do nothing
		}
	}
	
	tx.pushInsert( insertedData );
	if ( offset < this.data.length ) {
		tx.pushRetain( this.data.length - offset );
	}
	
	return tx;
	
	/*
	 * // Structural changes
	 * There are 2 basic types of locations the insertion point can be:
	 *     Structural locations
	 *         |<p>a</p><p>b</p> - Beginning of the document
	 *         <p>a</p>|<p>b</p> - Between elements (like in a document or list)
	 *         <p>a</p><p>b</p>| - End of the document
	 *     Content locations
	 *         <p>|a</p><p>b</p> - Inside an element (like in a paragraph or listItem)
	 *         <p>a|</p><p>b</p> - May also be inside an element but right before/after an
	 *                             open/close
	 * 
	 * if ( Incoming data contains structural elements ) {
		   // We're assuming the incoming data is balanced, is that OK?
	 *     if ( Insertion point is a structural location ) {
	 *         if ( Incoming data is not a complete structural element ) {
	 *             Incoming data must be balanced
	 *         }
	 *     } else {
	 *         Closing and opening elements for insertion point must be added to incoming data
	 *     }
	 * } else {
	 *     if ( Insertion point is a structural location ) {
	 *         Incoming data must be balanced   //how? Should this even be allowed?
	 *     } else {
	 *         Content being inserted into content is OK, do nothing
	 *     }
	 * }
	 */
};

/**
 * Generates a transaction which removes data from a given range.
 * 
 * When removing data inside an element, the data is simply discarded and the node's length is
 * adjusted accordingly. When removing data across elements, there are two situations that can cause
 * added complexity:
 *     1. A range spans between nodes of different levels or types
 *     2. A range only partially covers one or two nodes
 * 
 * To resolve these issues in a predictable way the following rules must be obeyed:
 *     1. Structural elements are retained unless the range being removed covers the entire element
 *     2. Elements can only be merged if they are
 *        2a. Same type
 *        2b. Same depth 
 *        2c. Types match at each level up to a common ancestor 
 *     3. Merge takes place at the highest common ancestor
 * 
 * @method
 * @param {ve.Range} range
 * @returns {ve.dm.Transaction}
 */

ve.dm.DocumentNode.prototype.prepareRemoval = function( range ) {
	// If a selection is painted across two paragraphs, and then the text is deleted, the two
	// paragraphs can become one paragraph. However, if the selection crosses into a table, those
	// cannot be merged. To make this simple, we follow rule #2 in the comment above for deciding
	// whether two elements can be merged.
	// So you can merge adjacent paragraphs, or list items. And you can't merge a paragraph into
	// a table row. There may be other rules we will want in here later, for instance, special
	// casing merging a listitem into a paragraph.
	function canMerge( node1, node2 ) {
		var result = ve.Node.getCommonAncestorPaths( node1, node2 );
		if ( !result ) {
			return false;
		}
		
		// Check that corresponding nodes in the paths have the same type
		for ( var i = 0; i < result.node1Path.length; i++ ) {
			if ( result.node1Path[i].getElementType() !== result.node2Path[i].getElementType() ) {
				return false;
			}
		}
		
		return true;
	}
	
	var tx = new ve.dm.Transaction(), selectedNodes, selectedNode, startNode, endNode, i;
	range.normalize();
	if ( range.start === range.end ) {
		// Empty range, nothing to do
		// Retain up to the end of the document. Why do we do this? Because Trevor said so!
		tx.pushRetain( this.data.length );
		return tx;
	}
	
	selectedNodes = this.selectNodes( range );
	startNode = selectedNodes[0].node;
	endNode = selectedNodes[selectedNodes.length - 1].node;
	
	if ( startNode && endNode && canMerge( startNode, endNode ) ) {
		// This is the simple case. node1 and node2 are either the same node, or can be merged
		// So we can just remove all the data in the range and call it a day, no fancy
		// processing necessary
		
		// Retain to the start of the range
		if ( range.start > 0 ) {
			tx.pushRetain( range.start );
		}
		// Remove all data in a given range.
		tx.pushRemove( this.data.slice( range.start, range.end ) );
		// Retain up to the end of the document. Why do we do this? Because Trevor said so!
		if ( range.end < this.data.length ) {
			tx.pushRetain( this.data.length - range.end );
		}
	} else {
		var index = 0;
		for ( i = 0; i < selectedNodes.length; i++ ) {
			selectedNode = selectedNodes[i];
			// Retain up to where the next removal starts
			if ( selectedNode.globalRange.start > index ) {
				tx.pushRetain( selectedNode.globalRange.start - index );
			}
			
			// Remove stuff
			if ( selectedNode.globalRange.getLength() ) {
				tx.pushRemove(
					this.data.slice(
						selectedNode.globalRange.start,
						selectedNode.globalRange.end
					)
				);
			}
			index = selectedNode.globalRange.end;
		}
		
		// Retain up to the end of the document. Why do we do this? Because Trevor said so!
		if ( index < this.data.length ) {
			tx.pushRetain( this.data.length - index );
		}
	}
	
	return tx;
};

/**
 * Generates a transaction which removes content from a given range and
 * replaces it with other content.
 * 
 * @param {ve.Range} range
 * @param {Array} content data
 * @returns {ve.dm.Transaction}
 */
ve.dm.DocumentNode.prototype.prepareContentReplacement = function( range, data ) {
	// TODO this is way too simple and doesn't verify that there's no structural changes being snuck in
	var tx = new ve.dm.Transaction();
	range.normalize();
	if ( range.start > 0 ) {
		tx.pushRetain( range.start );
	}
	tx.pushReplace( this.data.slice( range.start, range.end ), data );
	if ( range.end < this.data.length ) {
		tx.pushRetain( this.data.length - range.end );
	}
	
	return tx;
};

/**
 * Generates a transaction which wraps, unwraps or replaces structure.
 * 
 * The unwrap parameters are checked against the actual model data, and
 * an exception is thrown if the type fields don't match. This means you
 * can omit attributes from the unwrap parameters, those are automatically
 * picked up from the model data instead.
 * 
 * @param {ve.Range} range Range to wrap/unwrap/replace around
 * @param {Array} unwrapOuter Array of opening elements to unwrap. These must be immediately *outside* the range.
 * @param {Array} wrapOuter Array of opening elements to wrap around the range.
 * @param {Array} unwrapEach Array of opening elements to unwrap from each top-level element in the range.
 * @param {Array} wrapEach Array of opening elements to wrap around each top-level element in the range.
 * @returns {ve.dm.Transaction}
 * 
 * @example Changing a paragraph to a header:
 *     Before: [ {'type': 'paragraph'}, 'a', 'b', 'c', {'type': '/paragraph'} ]
 *     prepareWrap( new ve.Range( 1, 4 ), [ {'type': 'paragraph'} ], [ {'type': 'heading', 'level': 1 } ] );
 *     After: [ {'type': 'heading', 'level': 1 }, 'a', 'b', 'c', {'type': '/heading'} ]
 * 
 * @example Changing a set of paragraphs to a list:
 *     Before: [ {'type': 'paragraph'}, 'a', {'type': '/paragraph'}, {'type':'paragraph'}, 'b', {'type':'/paragraph'} ]
 *     prepareWrap( new ve.Range( 0, 6 ), [], [ {'type': 'list' } ], [], [ {'type': 'listItem', 'attributes': {'styles': ['bullet']}} ] );
 *     After: [ {'type': 'list'}, {'type': 'listItem', 'attributes': {'styles': ['bullet']}}, {'type':'paragraph'} 'a',
 *              {'type': '/paragraph'}, {'type': '/listItem'}, {'type': 'listItem', 'attributes': {'styles': ['bullet']}},
 *              {'type': 'paragraph'}, 'b', {'type': '/paragraph'}, {'type': '/listItem'}, {'type': '/list'} ]
 * 
 */
ve.dm.DocumentNode.prototype.prepareWrap = function( range, unwrapOuter, wrapOuter, unwrapEach, wrapEach ) {
	// Function to generate arrays of closing elements in reverse order
	function closingArray( openings ) {
		var closings = [], i, len = openings.length;
		for ( i = 0; i < len; i++ ) {
			closings[closings.length] = { 'type': '/' + openings[len - i - 1].type };
		}
		return closings;
	}
	
	// TODO: we're not checking for nesting validity. prepareInsertion also needs this
	
	var tx = new ve.dm.Transaction(), i, j, unwrapOuterData;
	range.normalize();
	if ( range.start > unwrapOuter.length ) {
		// Retain up to the first thing we're unwrapping
		// The outer unwrapping takes place *outside*
		// the range, so compensate for that
		tx.pushRetain( range.start - unwrapOuter.length );
	} else if ( range.start < unwrapOuter.length ) {
		throw 'unwrapOuter is longer than the data preceding the range';
	}
	
	// Replace the opening elements for the outer unwrap&wrap
	if ( wrapOuter.length > 0 || unwrapOuter.length > 0 ) {
		// Verify that wrapOuter matches the data at this position
		unwrapOuterData = this.data.slice( range.start - unwrapOuter.length, range.start );
		for ( i = 0; i < unwrapOuterData.length; i++ ) {
			if ( unwrapOuterData[i].type !== unwrapOuter[i].type ) {
				throw 'Element in unwrapOuter does not match: expected ' +
					unwrapOuter[i].type + ' but found ' + unwrapOuterData[i].type;
			}
		}
		// Instead of putting in unwrapOuter as given, put it in the
		// way it appears in the mode,l so we pick up any attributes
		tx.pushReplace( unwrapOuterData, wrapOuter );
	}
	
	if ( wrapEach.length > 0 || unwrapEach.length > 0 ) {
		var	closingUnwrapEach = closingArray( unwrapEach ),
			closingWrapEach = closingArray( wrapEach ),
			depth = 0,
			startOffset,
			unwrapEachData;
		// Visit each top-level child and wrap/unwrap it
		// TODO figure out if we should use the tree/node functions here
		// rather than iterating over offsets, it may or may not be faster
		for ( i = range.start; i < range.end; i++ ) {
			if ( this.data[i].type === undefined ) {
				// This is a content offset, skip
			} else {
				// This is a structural offset
				if ( this.data[i].type.charAt( 0 ) != '/' ) {
					// This is an opening element
					if ( depth == 0 ) {
						// We are at the start of a top-level element
						// Replace the opening elements
						
						// Verify that unwrapEach matches the data at this position
						unwrapEachData = this.data.slice( i, i + unwrapEach.length );
						for ( j = 0; j < unwrapEachData.length; j++ ) {
							if ( unwrapEachData[j].type !== unwrapEach[j].type ) {
								throw 'Element in unwrapEach does not match: expected ' +
									unwrapEach[j].type + ' but found ' +
									unwrapEachData[j].type;
							}
						}
						// Instead of putting in unwrapEach as given, put it in the
						// way it appears in the model, so we pick up any attributes
						tx.pushReplace( unwrapEachData, wrapEach );
						
						// Store this offset for later
						startOffset = i;
					}
					depth++;
				} else {
					// This is a closing element
					depth--;
					if ( depth == 0 ) {
						// We are at the end of a top-level element
						// Retain the contents of what we're wrapping
						tx.pushRetain( i - startOffset + 1 - unwrapEach.length*2 );
						// Replace the closing elements
						tx.pushReplace( closingUnwrapEach, closingWrapEach );
					}
				}
			}
		}
	} else {
		// There is no wrapEach/unwrapEach to be done, just retain
		// up to the end of the range
		tx.pushRetain( range.end - range.start );
	}
	
	if ( wrapOuter.length > 0 || unwrapOuter.length > 0 ) {
		tx.pushReplace( closingArray( unwrapOuter ), closingArray( wrapOuter ) );
	}
	
	// Retain up to the end of the document
	if ( range.end < this.data.length ) {
		tx.pushRetain( this.data.length - range.end - unwrapOuter.length );
	}
	
	return tx;
};


/**
 * Generates a transaction which annotates content within a given range.
 * 
 * @method
 * @returns {ve.dm.Transaction}
 */
ve.dm.DocumentNode.prototype.prepareContentAnnotation = function( range, method, annotation ) {
	if ( annotation instanceof RegExp && method !== 'clear' ) {
		throw 'Invalid annotation error. RegExp patterns can only be used with the clear method.';
	}
	var tx = new ve.dm.Transaction();
	range.normalize();
	if ( annotation.hash === undefined ) {
		annotation.hash = ve.dm.DocumentNode.getHash( annotation );
	}
	var i = range.start,
		span = i,
		on = false;
	while ( i < range.end ) {
		if ( this.data[i].type !== undefined ) {
			// Don't annotate structural elements
			if ( on ) {
				if ( span ) {
					tx.pushRetain( span );
				}
				tx.pushStopAnnotating( method, annotation );
				span = 0;
				on = false;
			}
		} else {
			var covered;
			if ( annotation instanceof RegExp ) {
				covered =
					!!ve.dm.DocumentNode.getMatchingAnnotations( this.data[i], annotation ).length;
			} else {
				covered = ve.dm.DocumentNode.getIndexOfAnnotation( this.data[i], annotation ) !== -1;
			}
			if ( ( covered && method === 'set' ) || ( !covered  && method === 'clear' ) ) {
				// Don't set/clear annotations on content that's already set/cleared
				if ( on ) {
					if ( span ) {
						tx.pushRetain( span );
					}
					tx.pushStopAnnotating( method, annotation );
					span = 0;
					on = false;
				}
			} else {
				// Content
				if ( !on ) {
					if ( span ) {
						tx.pushRetain( span );
					}
					tx.pushStartAnnotating( method, annotation );
					span = 0;
					on = true;
				}
			}
		}
		span++;
		i++;
	}
	if ( span ) {
		tx.pushRetain( span );
	}
	if ( on ) {
		tx.pushStopAnnotating( method, annotation );
	}
	if ( range.end < this.data.length ) {
		tx.pushRetain( this.data.length - range.end );
	}

	return tx;
};

/**
 * Generates a transaction which changes attributes on an element at a given offset.
 * 
 * @method
 * @returns {ve.dm.Transaction}
 */
ve.dm.DocumentNode.prototype.prepareElementAttributeChange = function( offset, key, to ) {
	var tx = new ve.dm.Transaction();
	if ( offset ) {
		tx.pushRetain( offset );
	}
	if ( this.data[offset].type === undefined ) {
		throw 'Invalid element offset error. Can not set attributes to non-element data.';
	}
	if ( this.data[offset].type[0] === '/' ) {
		throw 'Invalid element offset error. Can not set attributes on closing element.';
	}
	var from = 'attributes' in this.data[offset] ? this.data[offset].attributes[key] : undefined;
	tx.pushReplaceElementAttribute( key, from, to );
	if ( offset < this.data.length ) {
		tx.pushRetain( this.data.length - offset );
	}
	
	return tx;
};

/**
 * Applies a transaction to the content data.
 * 
 * @method
 * @param {ve.dm.Transaction}
 */
ve.dm.DocumentNode.prototype.commit = function( transaction ) {
	ve.dm.TransactionProcessor.commit( this, transaction );
};

/**
 * Reverses a transaction's effects on the content data.
 * 
 * @method
 * @param {ve.dm.Transaction}
 */
ve.dm.DocumentNode.prototype.rollback = function( transaction ) {
	ve.dm.TransactionProcessor.rollback( this, transaction );
};

ve.dm.DocumentNode.prototype.prepareLeafConversion = function( range, type, attributes ) {
	range.normalize();
	var	startNode = this.getNodeFromOffset( range.start ),
		endNode =  this.getNodeFromOffset( range.end ),
		nodes = [],
		nodeOffset,
		txs = [];

	this.traverseLeafNodes( function( node ) {
		nodes.push( node );
		if( node === endNode ) {
			return false;
		}
	}, startNode );

	// TODO: skip nodes which have the same type and attributes as the target

	for ( var i = 0; i < nodes.length; i++ ) {
		nodeOffset = this.getOffsetFromNode( nodes[i], false );

		txs.push( this.prepareRemoval(
			new ve.Range( nodeOffset, nodeOffset + nodes[i].getElementLength() )
		) );
		txs.push( this.prepareInsertion(
			nodeOffset,
			[ { 'type': type, 'attributes': attributes } ]
				.concat( nodes[i].getContentData() )
				.concat( [ { 'type': '/' + type } ] )
		) );
	}

	return txs;
};

/* Inheritance */

ve.extendClass( ve.dm.DocumentNode, ve.dm.BranchNode );
