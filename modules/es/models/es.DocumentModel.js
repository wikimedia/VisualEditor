/**
 * Creates an es.DocumentModel object.
 * 
 * es.DocumentModel objects extend the native Array object, so it's contents are directly accessible
 * through the typical methods.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelBranchNode}
 * @param {Array} data Model data to initialize with, such as data from es.DocumentModel.getData()
 * @param {Object} attributes Document attributes
 */
es.DocumentModel = function( data, attributes ) {
	// Inheritance
	es.DocumentModelBranchNode.call( this, 'document', null );

	// Properties
	this.data = es.isArray( data ) ? data : [];
	this.attributes = es.isPlainObject( attributes ) ? attributes : {};
	this.contentLength = this.data.length;

	// Auto-generate model tree
	var nodes = es.DocumentModel.createNodesFromData( this.data );
	for ( var i = 0; i < nodes.length; i++ ) {
		this.push( nodes[i] );
	}
};

/* Static Members */

/**
 * Mapping of symbolic names and node model constructors.
 */
es.DocumentModel.nodeModels = {};

/**
 * Mapping of symbolic names and nesting rules.
 * 
 * Each rule is an object with a parents and children property. Each of these properties may contain
 * one of two possible values:
 *     Array - List of allowed element types (if empty, no elements will be allowed)
 *     Null - Any element type is allowed (as long as the other element also allows it)
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
 *         'children': []
 *     }
 */
es.DocumentModel.nodeRules = {};

/**
 * Mapping of operation types to pure functions.
 * 
 * Each function is called in the context of a state, and takes an operation object as a parameter.
 */
es.DocumentModel.operations = ( function() {
	function retain( op ) {
		annotate.call( this, this.cursor + op.length );
		this.cursor += op.length;
	}

	function rebuild( newData, oldNodes ) {
		var parent = oldNodes[0].getParent(),
			index = parent.indexOf( oldNodes[0] );
		// Remove the node we are about to insert into from the model tree
		parent.splice( index, oldNodes.length );
		// Regenerate nodes for the data we've affected
		var newNodes = es.DocumentModel.createNodesFromData( newData );
		// Insert new elements into the tree where the old ones used to be
		for ( var i = newNodes.length - 1; i >= 0; i-- ) {
			parent.splice( index, 0, newNodes[i] );
		}
	}

	function insert( op ) {
		if ( es.DocumentModel.isStructuralOffset( this.data, this.cursor ) ) {
			// TODO: Support tree updates when inserting between elements
		} else {
			// Get the node we are about to insert into
			var node = this.tree.getNodeFromOffset( this.cursor );
			if ( !node ) {
				throw 'Missing node error. A node could not not be found at the cursor.';
			}
			var offset = this.tree.getOffsetFromNode( node );
			if ( es.DocumentModel.containsElementData( op.data ) ) {
				// Perform insert on linear data model
				es.insertIntoArray( this.data, this.cursor, op.data );
				annotate.call( this, this.cursor + op.data.length );
				// Synchronize model tree
				if ( offset === -1 ) {
					throw 'Invalid offset error. Node is not in model tree';
				}
				rebuild.call(
					this,
					this.data.slice( offset, offset + node.getElementLength() + op.data.length ),
					[node]
				);
			} else {
				// Perform insert on linear data model
				es.insertIntoArray( this.data, this.cursor, op.data );
				annotate.call( this, this.cursor + op.data.length );
				// Update model tree
				node.adjustContentLength( op.data.length, true );
				node.emit( 'update', this.cursor - offset );
			}
		}
		this.cursor += op.data.length;
	}

	function remove( op ) {
		var elementLeft = es.DocumentModel.isElementData( this.data, this.cursor ),
			elementRight = es.DocumentModel.isElementData( this.cursor + op.data.length );
		if ( elementLeft && elementRight ) {
			// TODO: Support tree updates when removing whole elements
		} else {
			if ( es.DocumentModel.containsElementData( op.data ) ) {
				// TODO: Support tree updates when removing partial elements
			} else {
				// Get the node we are removing content from
				var node = this.tree.getNodeFromOffset( this.cursor );
				// Remove content from linear data model
				this.data.splice( this.cursor, op.data.length );
				// Update model tree
				node.adjustContentLength( -op.data.length, true );
				node.emit( 'update', this.cursor - this.tree.getOffsetFromNode( node ) );
			}
		}
	}
	
	function attribute( op, invert ) {
		var element = this.data[this.cursor];
		if ( element.type === undefined ) {
			throw 'Invalid element error. Can not set attributes on non-element data.';
		}
		if ( ( op.method === 'set' && !invert ) || ( op.method === 'clear' && invert ) ) {
			// Automatically initialize attributes object
			if ( !element.attributes ) {
				element.attributes = {};
			}
			element.attributes[op.key] = op.value;
		} else if ( ( op.method === 'clear' && !invert ) || ( op.method === 'set' && invert ) ) {
			if ( element.attributes ) {
				delete element.attributes[op.key];
			}
			// Automatically clean up attributes object
			var empty = true;
			for ( var key in element.attributes ) {
				empty = false;
				break;
			}
			if ( empty ) {
				delete element.attributes;
			}
		} else {
			throw 'Invalid method error. Can not operate attributes this way: ' + method;
		}
	}
	
	function annotate( to ) {
		var i,
			j,
			length,
			annotation;
		// Handle annotations
		if ( this.set.length ) {
			for ( i = 0, length = this.set.length; i < length; i++ ) {
				annotation = this.set[i];
				// Auto-build annotation hash
				if ( annotation.hash === undefined ) {
					annotation.hash = es.DocumentModel.getAnnotationHash( annotation );
				}
				for ( j = this.cursor; j < to; j++ ) {
					// Auto-convert to array
					if ( es.isArray( this.data[j] ) ) {
						this.data[j].push( annotation );
					} else {
						this.data[j] = [this.data[j], annotation];
					}
				}
			}
		}
		if ( this.clear.length ) {
			for ( i = 0, length = this.clear.length; i < length; i++ ) {
				annotation = this.clear[i];
				// Auto-build annotation hash
				if ( annotation.hash === undefined ) {
					annotation.hash = es.DocumentModel.getAnnotationHash( annotation );
				}
				for ( j = this.cursor; j < to; j++ ) {
					var index = es.DocumentModel.getIndexOfAnnotation( this.data[j], annotation );
					if ( index !== -1 ) {
						this.data[j].splice( index, 1 );
					}
					// Auto-convert to string
					if ( this.data[j].length === 1 ) {
						this.data[j] = this.data[j][0];
					}
				}
			}
		}
	}
	
	function mark( op, invert ) {
		var target;
		if ( ( op.method === 'set' && !invert ) || ( op.method === 'clear' && invert ) ) {
			target = this.set;
		} else if ( ( op.method === 'clear' && !invert ) || ( op.method === 'set' && invert ) ) {
			target = this.clear;
		} else {
			throw 'Invalid method error. Can not operate attributes this way: ' + method;
		}
		if ( op.bias === 'start' ) {
			target.push( op.annotation );
		} else if ( op.bias === 'stop' ) {
			var index = es.DocumentModel.getIndexOfAnnotation( target, op.annotation );
			if ( index === -1 ) {
				throw 'Annotation stack error. Annotation is missing.';
			}
			target.splice( index, 1 );
		}
	}
	
	return {
		// Retain
		'retain': {
			'commit': retain,
			'rollback': retain
		},
		// Insert
		'insert': {
			'commit': insert,
			'rollback': remove
		},
		// Remove
		'remove': {
			'commit': remove,
			'rollback': insert
		},
		// Change element attributes
		'attribute': {
			'commit': function( op ) {
				attribute.call( this, op, false );
			},
			'rollback': function( op ) {
				attribute.call( this, op, true );
			}
		},
		// Change content annotations
		'annotate': {
			'commit': function( op ) {
				mark.call( this, op, false );
			},
			'rollback': function( op ) {
				mark.call( this, op, true );
			}
		}
	};
} )();

/* Static Methods */

/*
 * Create child nodes from an array of data.
 * 
 * These child nodes are used for the model tree, which is a space partitioning data structure in
 * which each node contains the length of itself (1 for opening, 1 for closing) and the lengths of
 * it's child nodes.
 */
es.DocumentModel.createNodesFromData = function( data ) {
	var currentNode = new es.DocumentModelBranchNode();
	for ( var i = 0, length = data.length; i < length; i++ ) {
		if ( data[i].type !== undefined ) {
			// It's an element, figure out it's type
			var element = data[i],
				type = element.type,
				open = type[0] !== '/';
			// Trim the "/" off the beginning of closing tag types
			if ( !open ) {
				type = type.substr( 1 );
			}
			if ( open ) {
				// Validate the element type
				if ( !( type in es.DocumentModel.nodeModels ) ) {
					throw 'Unsuported element error. No class registered for element type: ' + type;
				}
				// Create a model node for the element
				var newNode = new es.DocumentModel.nodeModels[element.type]( element, 0 );
				// Add the new model node as a child
				currentNode.push( newNode );
				// Descend into the new model node
				currentNode = newNode;
			} else {
				// Return to the parent node
				currentNode = currentNode.getParent();
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
 * @returns {es.DocumentModel} Document model created from obj
 */
es.DocumentModel.newFromPlainObject = function( obj ) {
	if ( obj.type === 'document' ) {
		var data = [],
			attributes = es.isPlainObject( obj.attributes ) ? es.copyObject( obj.attributes ) : {};
		for ( var i = 0; i < obj.children.length; i++ ) {
			data = data.concat( es.DocumentModel.flattenPlainObjectElementNode( obj.children[i] ) );
		}
		return new es.DocumentModel( data, attributes );
	}
	throw 'Invalid object error. Object is not a valid document object.';
};

/**
 * Generates a hash of an annotation object based on it's name and data.
 * 
 * TODO: Add support for deep hashing of array and object properties of annotation data.
 * 
 * @static
 * @method
 * @param {Object} annotation Annotation object to generate hash for
 * @returns {String} Hash of annotation
 */
es.DocumentModel.getAnnotationHash = function( annotation ) {
	var hash = '#' + annotation.type;
	if ( annotation.data ) {
		var keys = [];
		for ( var key in annotation.data ) {
			keys.push( key + ':' + annotation.data );
		}
		keys.sort();
		hash += '|' + keys.join( '|' );
	}
	return hash;
};

es.DocumentModel.getIndexOfAnnotation = function( annotations, annotation ) {
	if ( annotation === undefined || annotation.type === undefined ) {
		throw 'Invalid annotation error. Can not find non-annotation data in character.';
	}
	if ( es.isArray( annotations ) ) {
		// Find the index of a comparable annotation (checking for same value, not reference)
		for ( var i = 0; i < annotations.length; i++ ) {
			// Skip over character data - used when this is called on a content data item
			if ( typeof annotations[i] === 'string' ) {
				continue;
			}
			if ( annotations[i].hash === annotation.hash ) {
				return i;
			}
		}
	}
	return -1;
};

/**
 * Creates an es.ContentModel object from a plain content object.
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
es.DocumentModel.flattenPlainObjectContentNode = function( obj ) {
	if ( !es.isPlainObject( obj ) ) {
		// Use empty content
		return [];
	} else {
		// Convert string to array of characters
		var data = obj.text.split('');
		// Render annotations
		if ( es.isArray( obj.annotations ) ) {
			for ( var i = 0, length = obj.annotations.length; i < length; i++ ) {
				var src = obj.annotations[i];
				// Build simplified annotation object
				var dst = { 'type': src.type };
				if ( 'data' in src ) {
					dst.data = es.copyObject( src.data );
				}
				// Add a hash to the annotation for faster comparison
				dst.hash = es.DocumentModel.getAnnotationHash( dst );
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
es.DocumentModel.flattenPlainObjectElementNode = function( obj ) {
	var i,
		data = [],
		element = { 'type': obj.type };
	if ( es.isPlainObject( obj.attributes ) ) {
		element.attributes = es.copyObject( obj.attributes );
	}
	// Open element
	data.push( element );
	if ( es.isPlainObject( obj.content ) ) {
		// Add content
		data = data.concat( es.DocumentModel.flattenPlainObjectContentNode( obj.content ) );
	} else if ( es.isArray( obj.children ) ) {
		// Add children - only do this if there is no content property
		for ( i = 0; i < obj.children.length; i++ ) {
			// TODO: Figure out if all this concatenating is inefficient. I think it is
			data = data.concat( es.DocumentModel.flattenPlainObjectElementNode( obj.children[i] ) );
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
es.DocumentModel.getExpandedContentData = function( data ) {
	var stack = [];
	// Text and annotations
	function start( offset, annotation ) {
		// Make a new verion of the annotation object and push it to the stack
		var obj = {
			'type': annotation.type,
			'range': { 'start': offset }
		};
		if ( annotation.data ) {
			obj.data = es.copyObject( annotation.data );
		}
		stack.push( obj );
	}
	function end( offset, annotation ) {
		for ( var i = stack.length - 1; i >= 0; i-- ) {
			if ( !stack[i].range.end ) {
				if ( annotation ) {
					// We would just compare hashes, but the stack doesn't contain any
					if ( stack[i].type === annotation.type &&
							es.compareObjects( stack[i].data, annotation.data ) ) {
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
				if ( es.DocumentModel.getIndexOfAnnotation( data[i] , left[j], true ) === -1 ) {
					end( i - offset, left[j] );
				}
			}
			for ( j = 1; j < right.length; j++ ) {
				if ( es.DocumentModel.getIndexOfAnnotation( data[i - 1], right[j], true ) === -1 ) {
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
		obj.annotation = stack;
	}
	// Copy attributes if there are any set
	if ( !es.isEmptyObject( this.attributes ) ) {
		obj.attributes = es.extendObject( true, {}, this.attributes );
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
es.DocumentModel.isContentData = function( data, offset ) {
	// Shortcut: if there's already content there, we will trust it's supposed to be there
	return typeof data[offset] === 'string' || es.isArray( data[offset] );
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
es.DocumentModel.isElementData = function( data, offset ) {
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
es.DocumentModel.isStructuralOffset = function( data, offset ) {
	// Edges are always structural
	if ( offset === 0 || offset === data.length ) {
		return true;
	}
	// Structual offsets will have elements on each side
	if ( data[offset - 1].type !== undefined && data[offset].type !== undefined ) {
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
es.DocumentModel.containsElementData = function( data ) {
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
 * @returns {es.DocumentView}
 */
es.DocumentModel.prototype.createView = function() {
	return new es.DocumentView( this );
};

/**
 * Gets copy of the document data.
 * 
 * @method
 * @param {es.Range} [range] Range of data to get, all data will be given by default
 * @param {Boolean} [deep=false] Whether to return a deep copy (WARNING! This may be very slow)
 * @returns {Array} Copy of document data
 */
es.DocumentModel.prototype.getData = function( range, deep ) {
	var start = 0,
		end;
	if ( range !== undefined ) {
		range.normalize();
		start = Math.max( 0, Math.min( this.data.length, range.start ) );
		end = Math.max( 0, Math.min( this.data.length, range.end ) );
	}
	var data = this.data.slice( start, end );
	return deep ? es.copyArray( data ) : data;
};

/**
 * Gets the element object of a node.
 * 
 * @method
 * @param {es.DocumentModelNode} node Node to get element object for
 * @returns {Object|null} Element object
 */
es.DocumentModel.prototype.getElementFromNode = function( node ) {
	var offset = this.getOffsetFromNode( node );
	if ( offset !== false ) {
		return this.data[offset];
	}
	return null;
};

/**
 * Gets the content data of a node.
 * 
 * @method
 * @param {es.DocumentModelNode} node Node to get content data for
 * @returns {Array|null} List of content and elements inside node or null if node is not found
 */
es.DocumentModel.prototype.getContentFromNode = function( node, range ) {
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
		offset++;
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
 * @returns {es.Range|null} Range of content covered by annotation, or null if offset is not covered
 */
es.DocumentModel.prototype.getAnnotationBoundaries = function( offset, annotation ) {
	if ( annotation.hash === undefined ) {
		annotation.hash = es.DocumentModel.getAnnotationHash( annotation );
	}
	if ( es.DocumentModel.getIndexOfAnnotation( this.data[offset], annotation ) === -1 ) {
		return null;
	}
	var start = offset,
		end = offset,
		item;
	while ( start > 0 ) {
		start--;
		if ( es.DocumentModel.getIndexOfAnnotation( this.data[start], annotation ) === -1 ) {
			start++;
			break;
		}
	}
	while ( end < this.data.length ) {
		if ( es.DocumentModel.getIndexOfAnnotation( this.data[end], annotation ) === -1 ) {
			break;
		}
		end++;
	}
	return new es.Range( start, end );
};

/**
 * Gets a list of annotations that a given offset is covered by.
 * 
 * @method
 * @param {Integer} offset Offset to get annotations for
 * @returns {Object[]} A copy of all annotation objects offset is covered by
 */
es.DocumentModel.prototype.getAnnotationsFromOffset = function( offset ) {
	if ( es.isArray( this.data[offset] ) ) {
		return es.copyArray( this.data[offset].slice( 1 ) );
	}
	return [];
};

/**
 * Gets the range of content surrounding a given offset that makes up a whole word.
 * 
 * @method
 * @param {Integer} offset Offset to begin looking forward and backward from
 * @returns {es.Range|null} Range of content making up a whole word or null if offset is not content
 */
es.DocumentModel.prototype.getWordBoundaries = function( offset ) {
	if ( es.DocumentModel.isStructuralOffset( this.data, offset ) ) {
		return null;
	}
	var start = offset,
		end = offset,
		item;
	while ( start > 0 ) {
		start--;
		if ( typeof this.data[start] !== 'string' && !es.isArray( this.data[start] ) ) {
			start++;
			break;
		}
		item = typeof this.data[start] === 'string' ? this.data[start] : this.data[start][0];
		if ( item.match( /\B/ ) ) {
			start++;
			break;
		}
	}
	while ( end < this.data.length ) {
		if ( typeof this.data[end] !== 'string' && !es.isArray( this.data[end] ) ) {
			break;
		}
		item = typeof this.data[end] === 'string' ? this.data[end] : this.data[end][0];
		if ( item.match( /\B/ ) ) {
			break;
		}
		end++;
	}
	return new es.Range( start, end );
};

/**
 * Gets a content offset a given distance forwards or backwards from another.
 * 
 * @method
 * @param {Integer} offset Offset to start from
 * @param {Integer} distance Number of content offsets to move
 * @param {Integer} Offset a given distance from the given offset
 */
es.DocumentModel.prototype.getRelativeContentOffset = function( offset, distance ) {
	if ( es.DocumentModel.isStructuralOffset( this.data, offset ) ) {
		throw 'Invalid offset error. Can not get relative content offset from non-content offset.';
	}
	if ( distance === 0 ) {
		return offset;
	}
	var direction = distance > 0 ? 1 : -1,
		i = offset + direction,
		steps = 0;
	distance = Math.abs( distance );
	while ( i > 0 && i < this.data.length - 1 ) {
		if ( !es.DocumentModel.isStructuralOffset( this.data, i ) ) {
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
 * @returns {es.Transaction}
 */
es.DocumentModel.prototype.prepareInsertion = function( offset, data ) {
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
						throw 'Input is malformed: expected /' + element + ' but got ' + data[i].type +
							' at index ' + i;
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
	
	var tx = new es.Transaction(),
		insertedData = data, // may be cloned and modified
		isStructuralLoc,
		wrappingElementType;
		
	if ( offset < 0 || offset > this.data.length ) {
		throw 'Offset ' + offset + ' out of bounds [0..' + this.data.length + ']';
	}
	
	// Has to be after the bounds check, because isStructuralOffset doesn't like out-of-bounds offsets
	isStructuralLoc = es.DocumentModel.isStructuralOffset( this.data, offset );
	
	if ( offset > 0 ) {
		tx.pushRetain( offset );
	}
	
	if ( es.DocumentModel.containsElementData( insertedData ) ) {
		if ( insertedData[0].type !== undefined && insertedData[0].type.charAt( 0 ) != '/' ) {
			// insertedData starts with an opening, so this is really intended to insert structure
			// Balance it to make it sane, if it's not already
			// TODO we need an actual validator and check that the insertion is really valid
			insertedData = balance( insertedData );
			if ( !isStructuralLoc ) {
				// We're inserting structure at a content location,
				// so we need to split up the wrapping element
				wrappingElementType = this.getNodeFromOffset( offset ).getElementType();
				var arr = [ { 'type': '/' + wrappingElementType }, { 'type': wrappingElementType } ];
				es.insertIntoArray( arr, 1, insertedData );
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
			es.insertIntoArray( insertedData, 1, data );
		} else {
			// Content being inserted in content is fine, do nothing
		}
	}
	
	tx.pushInsert( insertedData );
	if ( offset < this.data.length ) {
		tx.pushRetain( this.data.length - offset );
	}
	
	tx.optimize();
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
 *     2. Elements can only be merged if they are of the same time and share a common parent
 * 
 * @method
 * @param {es.Range} range
 * @returns {es.Transaction}
 */
es.DocumentModel.prototype.prepareRemoval = function( range ) {
	var doc = this;
	//debugger;

	/**
	 * Return true if can merge the remaining contents of the elements after a selection is deleted
	 * across them. For instance, if a selection is painted across two paragraphs, and then the text
	 * is deleted, the two paragraphs can become one paragraph. However, if the selection crosses
	 * into a table, those cannot be merged.
	 * @param {Number} integer offset
	 * @param {Number} integer offset
	 * @return {Boolean}
	*/
	function canMerge( range ) {
		var node1 = doc.getNodeFromOffset( range.start );
		var node2 = doc.getNodeFromOffset( range.end - 1 );
		// This is the simple rule we are following for now -- same type & same parent = can merge.
		// So you can merge adjacent paragraphs, or listitems. And you can't merge a paragraph into
		// a table row. There may be other rules we will want in here later, for instance, special
		// casing merging a listitem into a paragraph.
		return (
			( ( node1 && node2 ) && ( node1.getElementType() === node2.getElementType() ) )  &&
			( node1.getParent() === node2.getParent() )
		);
	}
	
	function mergeDelete( range, tx ) {	
		// yay, content can be removed in one fell swoop
		var removed = doc.data.slice( range.start, range.end );
		tx.pushRemove( removed );
	}

	// remove string content only, retain structure
	function stripDelete( range, tx ) { 
		var lastOperation, operationStart;

		var ops = [],
			op;
		//debugger;

		// get a list of operations, with 0-based indexes
		for (var i = range.start; i < range.end; i++ ) {
			var neededOp = doc.data[i].type === undefined ? 'remove' : 'retain';
			op = ops[ ops.length - 1 ];
			if ( op === undefined || op.type !== neededOp ) {
				ops.push( { type: neededOp, start: i, end: i } );
			} else {
				op.end = i;
			}
		}					

		//debugger;
		// insert operations as transactions (end must be adjusted)
		for (var j = 0; j < ops.length; j++ ) {
			op = ops[j];
			if ( op.type === 'retain' ) {
				// we add one because retain(3,3) really means retain 1 char at pos 3
				tx.pushRetain( op.end - op.start + 1 );
			} else if ( op.type === 'remove' ) {
				// we add one because to remove(3,5) we need to slice(3,6), the ending is last
				// subscript removed + 1.
				tx.pushRemove( doc.data.slice( op.start, op.end + 1 ) );
			} else {
				console.log( "this is impossible" );
			}
		}

	}

	
	var tx = new es.Transaction();
	range.normalize();
	
	// Retain to the start of the range
	if ( range.start > 0 ) {
		tx.pushRetain( range.start );
	}

	
	// choose a deletion strategy; merging nodes together, or stripping content from existing
	// structure.
	if ( canMerge( range ) ) {
		mergeDelete( range, tx );
	} else {
		stripDelete( range, tx );
	}

	// Retain up to the end of the document. Why do we do this?
	if ( range.end < doc.data.length ) {
		tx.pushRetain( doc.data.length - range.end );
	}
	
	tx.optimize();
	return tx;
};

/**
 * Generates a transaction which annotates content within a given range.
 * 
 * @method
 * @returns {es.Transaction}
 */
es.DocumentModel.prototype.prepareContentAnnotation = function( range, method, annotation ) {
	var tx = new es.Transaction();
	range.normalize();
	if ( annotation.hash === undefined ) {
		annotation.hash = es.DocumentModel.getAnnotationHash( annotation );
	}
	var i = range.start,
		span = i,
		on = this.data[i].type !== undefined;
	while ( i < range.end ) {
		if ( this.data[i].type !== undefined ) {
			// Don't annotate structural elements
			if ( on ) {
				tx.pushStopAnnotating( method, annotation );
				span = 0;
				on = false;
			}
		} else {
			var covered = es.DocumentModel.getIndexOfAnnotation( this.data[i], annotation ) !== -1;
			if ( covered && method === 'set' || !covered && method === 'clear' ) {
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
	if ( on ) {
		if ( span ) {
			tx.pushRetain( span );
		}
		tx.pushStopAnnotating( method, annotation );
	}
	if ( range.end < this.data.length ) {
		tx.pushRetain( this.data.length - range.end );
	}
	tx.optimize();
	return tx;
};

/**
 * Generates a transaction which changes attributes on an element at a given offset.
 * 
 * @method
 * @returns {es.Transaction}
 */
es.DocumentModel.prototype.prepareElementAttributeChange = function( offset, method, key, value ) {
	var tx = new es.Transaction();
	if ( offset ) {
		tx.pushRetain( offset );
	}
	if ( this.data[offset].type === undefined ) {
		throw 'Invalid element offset error. Can not set attributes to non-element data.';
	}
	if ( this.data[offset].type[0] === '/' ) {
		throw 'Invalid element offset error. Can not set attributes on closing element.';
	}
	tx.pushChangeElementAttribute( method, key, value );
	if ( offset < this.data.length ) {
		tx.pushRetain( this.data.length - offset );
	}
	tx.optimize();
	return tx;
};

/**
 * Applies a transaction to the content data.
 * 
 * @method
 * @param {es.Transaction}
 */
es.DocumentModel.prototype.commit = function( transaction ) {
	var state = {
			'data': this.data,
			'tree': this,
			'cursor': 0,
			'set': [],
			'clear': []
		},
		operations = transaction.getOperations();
	for ( var i = 0, length = operations.length; i < length; i++ ) {
		var operation = operations[i];
		if ( operation.type in es.DocumentModel.operations ) {
			es.DocumentModel.operations[operation.type].commit.call( state, operation );
		} else {
			throw 'Invalid operation error. Operation type is not supported: ' + operation.type;
		}
	}
};

/**
 * Reverses a transaction's effects on the content data.
 * 
 * @method
 * @param {es.Transaction}
 */
es.DocumentModel.prototype.rollback = function( transaction ) {
	var state = {
			'data': this.data,
			'tree': this,
			'cursor': 0,
			'set': [],
			'clear': []
		},
		operations = transaction.getOperations();
	for ( var i = 0, length = operations.length; i < length; i++ ) {
		var operation = operations[i];
		if ( operation.type in es.DocumentModel.operations ) {
			es.DocumentModel.operations[operation.type].rollback.call( state, operation );
		} else {
			throw 'Invalid operation error. Operation type is not supported: ' + operation.type;
		}
	}
};

/* Inheritance */

es.extendClass( es.DocumentModel, es.DocumentModelBranchNode );
