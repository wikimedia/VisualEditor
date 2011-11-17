/**
 * Creates an es.TransactionProcessor object.
 * 
 * @class
 * @constructor
 */
es.TransactionProcessor = function( model, transaction ) {
	this.model = model;
	this.transaction = transaction;
	this.cursor = 0;
	this.set = [];
	this.clear = [];
};

/* Static Members */

es.TransactionProcessor.operationMap = {
	// Retain
	'retain': {
		'commit': function( op ) {
			this.retain( op );
		},
		'rollback': function( op ) {
			this.retain( op );
		}
	},
	// Insert
	'insert': {
		'commit': function( op ) {
			this.insert( op );
		},
		'rollback': function( op ) {
			this.remove( op );
		}
	},
	// Remove
	'remove': {
		'commit': function( op ) {
			this.remove( op );
		},
		'rollback': function( op ) {
			this.insert( op );
		}
	},
	// Change element attributes
	'attribute': {
		'commit': function( op ) {
			this.attribute( op, false );
		},
		'rollback': function( op ) {
			this.attribute( op, true );
		}
	},
	// Change content annotations
	'annotate': {
		'commit': function( op ) {
			this.mark( op, false );
		},
		'rollback': function( op ) {
			this.mark( op, true );
		}
	}
};

/* Static Methods */

es.TransactionProcessor.commit = function( doc, transaction ) {
	var tp = new es.TransactionProcessor( doc, transaction );
	tp.process( 'commit' );
};

es.TransactionProcessor.rollback = function( doc, transaction ) {
	var tp = new es.TransactionProcessor( doc, transaction );
	tp.process( 'rollback' );
};

/* Methods */

es.TransactionProcessor.prototype.process = function( method ) {
	var operations = this.transaction.getOperations();
	for ( var i = 0, length = operations.length; i < length; i++ ) {
		var operation = operations[i];
		if ( operation.type in es.TransactionProcessor.operationMap ) {
			es.TransactionProcessor.operationMap[operation.type][method].call( this, operation );
		} else {
			throw 'Invalid operation error. Operation type is not supported: ' + operation.type;
		}
	}
};

es.TransactionProcessor.prototype.rebuildNodes = function( newData, oldNodes, parent, index ) {
	var remove = 0;
	if ( oldNodes ) {
		if ( oldNodes[0] === oldNodes[0].getRoot() ) {
			parent = oldNodes[0];
			index = 0;
			remove = parent.getChildren().length;
		} else {
			parent = oldNodes[0].getParent();
			index = parent.indexOf( oldNodes[0] );
			remove = oldNodes.length;
		}
	}
	// Try to perform this in a single operation if possible, this reduces the number of UI updates
	// TODO: Introduce a global for max argument length - 1024 is also assumed in es.insertIntoArray
	var newNodes = es.DocumentModel.createNodesFromData( newData );
	if ( newNodes.length < 1024 ) {
		parent.splice.apply( parent, [index, remove].concat( newNodes ) );
	} else {
		parent.splice.apply( parent, [index, remove] );
		// Safe to call with arbitrary length of newNodes
		es.insertIntoArray( parent, index, newNodes );
	}
};

es.TransactionProcessor.prototype.getScope = function( node, data ) {
	var i,
		length,
		level = 0,
		maxDepth = 0;
	for ( i = 0, length = data.length; i < length; i++ ) {
		if ( typeof data[i].type === 'string' ) {
			level += data[i].type.charAt( 0 ) === '/' ? -1 : 1;
			maxDepth = Math.max( maxDepth, -level );
		}
	}
	if ( maxDepth > 0 ) {
		for ( i = 0; i < maxDepth - 1; i++ ) {
			node = node.getParent();
		}
	}
	return node;
};

es.TransactionProcessor.prototype.applyAnnotations = function( to ) {
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
				if ( es.isArray( this.model.data[j] ) ) {
					this.model.data[j].push( annotation );
				} else {
					this.model.data[j] = [this.model.data[j], annotation];
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
				var index = es.DocumentModel.getIndexOfAnnotation( this.model.data[j], annotation );
				if ( index !== -1 ) {
					this.model.data[j].splice( index, 1 );
				}
				// Auto-convert to string
				if ( this.model.data[j].length === 1 ) {
					this.model.data[j] = this.model.data[j][0];
				}
			}
		}
	}
};

es.TransactionProcessor.prototype.retain = function( op ) {
	this.applyAnnotations( this.cursor + op.length );
	this.cursor += op.length;
};

es.TransactionProcessor.prototype.insert = function( op ) {
	var node,
		index,
		offset;
	if ( es.DocumentModel.isStructuralOffset( this.model.data, this.cursor ) ) {
		es.insertIntoArray( this.model.data, this.cursor, op.data );
		this.applyAnnotations( this.cursor + op.data.length );
		node = this.model.getNodeFromOffset( this.cursor );
		offset = this.model.getOffsetFromNode( node );
		index = node.getIndexFromOffset( this.cursor + offset );
		this.rebuildNodes( op.data, null, node, index );
	} else {
		node = this.model.getNodeFromOffset( this.cursor );
		if ( node.getParent() === this.model ) {
			offset = this.model.getOffsetFromNode( node );
			index = this.model.getIndexFromOffset( this.cursor - offset );
		} else {
			node = this.getScope( node, op.data );
			offset = this.model.getOffsetFromNode( node );
			index = node.getIndexFromOffset( this.cursor - offset );
		}
		if ( es.DocumentModel.containsElementData( op.data ) ) {
			// Perform insert on linear data model
			es.insertIntoArray( this.model.data, this.cursor, op.data );
			this.applyAnnotations( this.cursor + op.data.length );
			// Synchronize model tree
			if ( offset === -1 ) {
				throw 'Invalid offset error. Node is not in model tree';
			}
			this.rebuildNodes(
				this.model.data.slice( offset, offset + node.getElementLength() + op.data.length ),
				[node]
			);
		} else {
			// Perform insert on linear data model
			// TODO this is duplicated from above
			es.insertIntoArray( this.model.data, this.cursor, op.data );
			this.applyAnnotations( this.cursor + op.data.length );
			// Update model tree
			node.adjustContentLength( op.data.length, true );
			node.emit( 'update', this.cursor - offset );
		}
	}
	this.cursor += op.data.length;
};

es.TransactionProcessor.prototype.remove = function( op ) {
	if ( es.DocumentModel.containsElementData( op.data ) ) {
		// Figure out which nodes are covered by the removal
		var ranges = this.model.selectNodes( new es.Range( this.cursor, this.cursor + op.data.length ) );
		var oldNodes = [], newData = [], firstKeptNode = true, lastElement;
		for ( var i = 0; i < ranges.length; i++ ) {
			oldNodes.push( ranges[i].node );
			if ( ranges[i].range !== undefined ) {
				// We have to keep part of this node
				if ( firstKeptNode ) {
					// This is the first node we're keeping
					// Keep its opening as well
					newData.push( ranges[i].node.getElement() );
					firstKeptNode = false;
				}
				// Compute the start and end offset of this node
				// We could do that with getOffsetFromNode() but
				// we already have all the numbers we need so why would we
				var	startOffset = ranges[i].globalRange.start - ranges[i].range.start,
					endOffset = startOffset + ranges[i].node.getContentLength(),
					// Get this node's data
					nodeData = this.model.data.slice( startOffset, endOffset );
				// Remove data covered by the range from nodeData
				nodeData.splice( ranges[i].range.start, ranges[i].range.end - ranges[i].range.start );
				// What remains in nodeData is the data we need to keep
				// Append it to newData
				newData = newData.concat( nodeData );
				
				lastElement = ranges[i].node.getElementType();
			}
		}
		if ( lastElement !== undefined ) {
			// Keep the closing of the last element that was partially kept
			newData.push( { 'type': '/' + lastElement } );
		}
		// Update the linear model
		this.model.data.splice( this.cursor, op.data.length );
		// Perform the rebuild. This updates the model tree
		this.rebuildNodes( newData, oldNodes );
	} else {
		// We're removing content only. Take a shortcut
		// Get the node we are removing content from
		var node = this.model.getNodeFromOffset( this.cursor );
		// Update model tree
		node.adjustContentLength( -op.data.length, true );
		// Update the linear model
		this.model.data.splice( this.cursor, op.data.length );
		// Emit an update so things sync up
		node.emit( 'update', this.cursor );
	}
};

es.TransactionProcessor.prototype.attribute = function( op, invert ) {
	var element = this.model.data[this.cursor];
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
};

es.TransactionProcessor.prototype.mark = function( op, invert ) {
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
};
