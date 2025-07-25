/*!
 * VisualEditor DataModel ModelFromDomConverter class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Provides VisualEditor linear data to HTML DOM conversion
 * functionality to ve.dm.Converter.
 *
 * @class
 * @constructor
 * @param {ve.dm.ModelRegistry} modelRegistry
 * @param {ve.dm.NodeFactory} nodeFactory
 * @param {ve.dm.AnnotationFactory} annotationFactory
 */
ve.dm.ModelFromDomConverter = function VeModelFromDomConverter( modelRegistry, nodeFactory, annotationFactory ) {
	this.modelRegistry = modelRegistry;
	this.nodeFactory = nodeFactory;
	this.annotationFactory = annotationFactory;

	this.store = null;
	this.doc = null;
	this.targetDoc = null;
	this.fromClipboard = null;
	this.internalList = null;
	this.contextStack = null;
};

/* Inheritance */

OO.initClass( ve.dm.ModelFromDomConverter );

/* Static Methods */

/**
 * Get linear model data from a string optionally applying annotations
 *
 * @private
 * @static
 * @param {string} text Plain text to convert
 * @param {ve.dm.AnnotationSet} [annotations] Annotations to apply
 * @return {ve.dm.LinearData.Item[]} Linear model data, one element per character
 */
ve.dm.ModelFromDomConverter.static.getDataContentFromText = function ( text, annotations ) {
	const characters = text.split( '' );

	if ( !annotations || annotations.isEmpty() ) {
		return characters;
	}
	// Apply annotations to characters
	for ( let i = 0, len = characters.length; i < len; i++ ) {
		// Just store the annotations' hashes from the hash-value store
		characters[ i ] = [ characters[ i ], annotations.getHashes().slice() ];
	}
	return characters;
};

/**
 * Modify linear model data in-place to move inline meta items out of content context
 *
 * All branch node start items must have item.internal.metaItems = []
 * All inline meta items must have item.internal.isInlineMeta set to true
 *
 * After the method completes, each inline meta item will be moved downward to the nearest legal
 * block position (i.e. just after the close meta parent item), and has these properties:
 * item.internal.loadMetaParentHash - corresponding meta parent's item.originalDomElementsHash
 * item.internal.loadMetaParentOffset - offset at load time within the meta parent (0 for start).
 * Each meta item is appended to the corresponding meta parent's item.internal.metaItems .
 *
 * @private
 * @static
 * @param {ve.dm.LinearData.Item[]} data Linear model data to modify in place
 */
ve.dm.ModelFromDomConverter.static.moveInlineMetaItems = function ( data ) {
	const ancestors = [],
		pendingMetaItems = [];

	function closestMetaParent() {
		for ( let n = ancestors.length - 1; n >= 0; n-- ) {
			const ancestor = ancestors[ n ];
			if ( ancestor.isMetaParent ) {
				return ancestor;
			}
		}
		return null;
	}

	let metaParent;
	for ( let i = 0; i < data.length; i++ ) {
		let item = data[ i ];
		if ( Array.isArray( item ) ) {
			// Ignore annotations
			item = item[ 0 ];
		}
		if ( !item.type ) {
			// Item is not a node
			continue;
		}
		if ( item.type[ 0 ] !== '/' ) {
			// Item is a node start
			if ( ve.getProp( item, 'internal', 'isInlineMeta' ) ) {
				// This is an inline meta item: move it
				delete item.internal.isInlineMeta;
				if ( item.annotations ) {
					// Remove annotations, but save so we could restore
					item.internal.preservedAnnotations = item.annotations;
					delete item.annotations;
				}
				metaParent = closestMetaParent();
				if ( metaParent ) {
					metaParent.item.internal.metaItems.push( item );
					pendingMetaItems.push( {
						item: item,
						closeItem: data[ i + 1 ],
						metaParent: metaParent,
						offset: i - metaParent.offset - 1
					} );
					// Remove this item and the immediately following close item
					data.splice( i, 2 );
					// Prepare to rescan this index
					i--;
				} else {
					// Inline meta outside meta parent. This can happen if, say,
					// the document starts with a comment then a meta item.
					// Skip this item and the immediately following close item
					i++;
				}
			} else {
				ancestors.push( {
					item: item,
					offset: i,
					isMetaParent: !!ve.getProp( item, 'internal', 'metaItems' )
				} );
			}
		} else {
			// Item is a node end
			metaParent = ancestors.pop();
			if ( metaParent.isMetaParent ) {
				for ( let j = 0; j < pendingMetaItems.length; j++ ) {
					const pending = pendingMetaItems[ j ];
					if ( pending.metaParent.item !== metaParent.item ) {
						continue;
					}
					pending.item.internal.loadMetaParentHash = metaParent.item.originalDomElementsHash;
					pending.item.internal.loadMetaParentOffset = pending.offset;
					pendingMetaItems.splice( j, 1 );
					j--;
					// This will drop annotations on meta items; fine
					data.splice( i + 1, 0, pending.item, pending.closeItem );
					i += 2;
				}
			}
		}
	}
};

/* Methods */

/**
 * Get the HashValueStore used for the current conversion.
 *
 * @return {ve.dm.HashValueStore|null} Current store, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.getStore = function () {
	return this.store;
};

/**
 * Check whether this converter instance is currently inside a getModelFromDom() conversion.
 *
 * @return {boolean} Whether we're converting
 */
ve.dm.ModelFromDomConverter.prototype.isConverting = function () {
	return this.contextStack !== null;
};

/**
 * Get the HTML document currently being converted
 *
 * @return {HTMLDocument|null} HTML document being converted, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.getHtmlDocument = function () {
	return this.doc;
};

/**
 * Get the HTML document we are converting data for
 *
 * @return {HTMLDocument|null} HTML document being converted for, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.getTargetHtmlDocument = function () {
	return this.targetDoc;
};

/**
 * Is the current conversion from the clipboard
 *
 * @return {boolean|null} The conversion is from the clipboard, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.isFromClipboard = function () {
	return this.fromClipboard;
};

/**
 * Get the current conversion context. This is the recursion state of getDataFromDomSubtree().
 *
 * @return {Object|null} Context object, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.getCurrentContext = function () {
	return this.contextStack === null ? null : this.contextStack[ this.contextStack.length - 1 ];
};

/**
 * Whether the converter is currently expecting content. Note that this is specific to the current
 * recursion level.
 *
 * @return {boolean|null} Boolean indicating whether content is expected, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.isExpectingContent = function () {
	const context = this.getCurrentContext();
	return context ? context.expectingContent : null;
};

/**
 * Whether the converter can currently accept a child node with the given type.
 *
 * @param {string} nodeType
 * @return {boolean|null} Whether the node type is valid, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.isValidChildNodeType = function ( nodeType ) {
	const context = this.getCurrentContext();
	if ( !context ) {
		return null;
	}
	const childTypes = this.nodeFactory.getChildNodeTypes( context.branchType );
	return ( childTypes === null || childTypes.includes( nodeType ) );
};

/**
 * Whether the conversion is currently inside a wrapper paragraph generated by the converter.
 * Note that this is specific to the current recursion level.
 *
 * @return {boolean|null} Boolean indicating whether we're wrapping, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.isInWrapper = function () {
	const context = this.getCurrentContext();
	return context ? context.inWrapper : null;
};

/**
 * Whether the active wrapper can be closed. Note that this is specific to the current recursion
 * level. If there is no active wrapper, this returns false.
 *
 * @return {boolean|null} Boolean indicating whether the wrapper can be closed, or null if not converting
 */
ve.dm.ModelFromDomConverter.prototype.canCloseWrapper = function () {
	const context = this.getCurrentContext();
	return context ? context.canCloseWrapper : null;
};

/**
 * Create a data element from a DOM element.
 *
 * @private
 * @param {ve.dm.Model} modelClass Model class to use for conversion
 * @param {Node[]} domElements DOM elements to convert
 * @return {ve.dm.LinearData.Element|ve.dm.LinearData.Item[]|null} Data element or array of linear model data, or null to alienate
 */
ve.dm.ModelFromDomConverter.prototype.createDataElements = function ( modelClass, domElements ) {
	let dataElements = modelClass.static.toDataElement( domElements, this );

	if ( !dataElements ) {
		return null;
	}
	if ( !Array.isArray( dataElements ) ) {
		dataElements = [ dataElements ];
	}
	if ( dataElements.length ) {
		let serializer;
		if ( modelClass.prototype instanceof ve.dm.Annotation ) {
			serializer = function ( node ) {
				// Do not include childNodes; see T160839
				return node.cloneNode( false ).outerHTML;
			};
		} else {
			serializer = ve.getNodeHtml;
		}
		dataElements[ 0 ].originalDomElementsHash = this.store.hash(
			domElements,
			domElements.map( serializer ).join( '' )
		);
		if ( modelClass.prototype instanceof ve.dm.BranchNode && modelClass.static.childNodeTypes === null ) {
			// Set this item up as a meta parent
			ve.setProp( dataElements[ 0 ], 'internal', 'metaItems', [] );
			ve.setProp( dataElements[ 0 ], 'internal', 'changesSinceLoad', 0 );
		}
	}
	return dataElements;
};

/**
 * Convert an HTML document to a document model.
 *
 * @param {HTMLDocument} doc HTML document to convert
 * @param {Object} [options] Conversion options
 * @param {HTMLDocument} [options.targetDoc=doc] Target HTML document we are converting for, if different from doc
 * @param {boolean} [options.fromClipboard=false] Conversion is from clipboard
 * @param {string} [options.lang] Document language code
 * @param {string} [options.dir] Document directionality (ltr/rtl)
 * @param {ve.dm.HashValueStore} [store=new ve.dm.HashValueStore()] Hash value store
 * @return {ve.dm.Document} Document model
 */
ve.dm.ModelFromDomConverter.prototype.getModelFromDom = function ( doc, options = {}, store = new ve.dm.HashValueStore() ) {
	const tmpDoc = new ve.dm.Document();
	const internalList = new ve.dm.InternalList( tmpDoc );

	// Set up the converter state
	this.doc = doc;
	this.targetDoc = options.targetDoc || doc;
	this.fromClipboard = options.fromClipboard;
	this.store = store;
	this.internalList = internalList;
	this.contextStack = [];
	// Possibly do things with doc and the head in the future

	// Generate data
	const data = this.getDataFromDomSubtree( doc.body );
	this.constructor.static.moveInlineMetaItems( data );

	const linearData = new ve.dm.LinearData( store, data );
	const refData = this.internalList.convertToData( this, doc );
	linearData.batchSplice( linearData.getLength(), 0, refData );
	const innerWhitespace = this.getInnerWhitespace( linearData );

	// Clear the state
	this.doc = null;
	this.targetDoc = null;
	this.fromClipboard = null;
	this.store = null;
	this.internalList = null;
	this.contextStack = null;

	return new ve.dm.Document( linearData, doc, undefined, internalList, innerWhitespace, options.lang, options.dir, null, null, tmpDoc.getStorage() );
};

/**
 * Wrapper for getDataFromDom which resets contextStack before the call
 * and then set it back after the call.
 *
 * TODO: This is kind of a hack, better implementation would be more appropriate in near future.
 *
 * @param {HTMLElement} domElement HTML element to convert
 * @param {Object} [wrapperElement] Data element to wrap the returned data in
 * @param {ve.dm.AnnotationSet} [annotationSet] Override the set of annotations to use
 * @return {ve.dm.LinearData.Item[]} Linear model data
 */
ve.dm.ModelFromDomConverter.prototype.getDataFromDomClean = function ( domElement, wrapperElement, annotationSet ) {
	const contextStack = this.contextStack;
	this.contextStack = [];
	const result = this.getDataFromDomSubtree( domElement, wrapperElement, annotationSet );
	this.contextStack = contextStack;
	return result;
};

/**
 * Get linear model data from a DOM node. Called recursively. For internal use
 * and ve.dm.Model.static.toDataElement() implementations.
 *
 * @param {HTMLElement} domElement HTML element to convert
 * @param {Object} [wrapperElement] Data element to wrap the returned data in
 * @param {ve.dm.AnnotationSet} [annotationSet] Override the set of annotations to use
 * @return {ve.dm.LinearData.Item[]} Linear model data
 */
ve.dm.ModelFromDomConverter.prototype.getDataFromDomSubtree = function ( domElement, wrapperElement, annotationSet ) {
	const modelRegistry = this.modelRegistry,
		data = [],
		context = {},
		prevContext = this.contextStack.length ?
			this.contextStack[ this.contextStack.length - 1 ] : null;
	let wrappingParagraph,
		nextWhitespace = '',
		wrappedWhitespace = '',
		wrappedWhitespaceIndex,
		wrappedMetaItems = [];

	/**
	 * Add whitespace to an element at a specific offset.
	 *
	 * @private
	 * @param {ve.dm.LinearData.Element} element Data element
	 * @param {number} index Whitespace index, 0-3
	 * @param {string} whitespace Whitespace content
	 */
	const addWhitespace = ( element, index, whitespace ) => {
		if ( !whitespace ) {
			return;
		}
		if ( !element.internal ) {
			element.internal = {};
		}
		// whitespace = [ outerPre, innerPre, innerPost, outerPost ]
		//         <tag>        text         </tag>         <nextTag>
		// ^^^^^^^^     ^^^^^^^^    ^^^^^^^^^      ^^^^^^^^^
		// outerPre     innerPre    innerPost      outerPost
		if ( !element.internal.whitespace ) {
			element.internal.whitespace = [];
		}
		element.internal.whitespace[ index ] = whitespace;
	};
	const processNextWhitespace = ( element ) => {
		// This function uses and changes nextWhitespace in the outer function's scope,
		// which means it's not really a function but more of a shortcut.
		if ( nextWhitespace !== '' ) {
			addWhitespace( element, 0, nextWhitespace );
			nextWhitespace = '';
		}
	};
	// FIXME rewrite this horrible meta item / whitespace queueing/wrapping business
	const outputWrappedMetaItems = ( whitespaceTreatment ) => {
		const toInsert = [];
		let prev = wrappingParagraph;

		for ( let j = 0, len = wrappedMetaItems.length; j < len; j++ ) {
			if ( wrappedMetaItems[ j ].type && wrappedMetaItems[ j ].type.charAt( 0 ) !== '/' ) {
				if ( wrappedMetaItems[ j ].internal && wrappedMetaItems[ j ].internal.whitespace ) {
					if ( whitespaceTreatment === 'restore' ) {
						ve.batchPush( toInsert, this.constructor.static.getDataContentFromText(
							wrappedMetaItems[ j ].internal.whitespace[ 0 ], context.annotations
						) );
						delete wrappedMetaItems[ j ].internal;
					} else if ( whitespaceTreatment === 'fixup' ) {
						addWhitespace( prev, 3, wrappedMetaItems[ j ].internal.whitespace[ 0 ] );
					}
				}
				prev = wrappedMetaItems[ j ];
			}
			toInsert.push( wrappedMetaItems[ j ] );
		}
		if ( wrappedWhitespace !== '' && whitespaceTreatment === 'restore' ) {
			// If we have wrapped whitespace, insert the wrapped meta items before it
			// This is horrible and this whole system desperately needs to be rewritten
			ve.batchSplice( data, wrappedWhitespaceIndex, 0, toInsert );
		} else {
			ve.batchPush( data, toInsert );
		}
		wrappedMetaItems = [];
	};
	const startWrapping = () => {
		// Mark this paragraph as having been generated by
		// us, so we can strip it on the way out
		wrappingParagraph = {
			type: 'paragraph',
			internal: { generated: 'wrapper', metaItems: [] }
		};
		data.push( wrappingParagraph );
		context.inWrapper = true;
		context.canCloseWrapper = true;
		context.expectingContent = true;
		processNextWhitespace( wrappingParagraph );
	};
	const stopWrapping = () => {
		if ( wrappedWhitespace !== '' ) {
			// Remove wrappedWhitespace from data
			data.splice( wrappedWhitespaceIndex, wrappedWhitespace.length );
			// Add whitespace to the last sibling: either the last meta item or the wrapper paragraph
			addWhitespace( wrappedMetaItems.length > 0 ? wrappedMetaItems[ wrappedMetaItems.length - 2 ] : wrappingParagraph, 3, wrappedWhitespace );
			nextWhitespace = wrappedWhitespace;
		}
		data.push( { type: '/paragraph' } );
		outputWrappedMetaItems( 'fixup' );
		wrappingParagraph = undefined;
		context.inWrapper = false;
		context.canCloseWrapper = false;
		context.expectingContent = context.originallyExpectingContent;
	};
	const getAboutGroup = ( node ) => {
		const group = [ node ];

		if ( node.nodeType !== Node.ELEMENT_NODE || node.getAttribute( 'about' ) === null ) {
			return group;
		}
		const about = node.getAttribute( 'about' );
		while ( ( node = node.nextSibling ) !== null ) {
			if ( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'about' ) === about ) {
				group.push( node );
			} else {
				break;
			}
		}
		return group;
	};
	const isAllInstanceOf = ( linearData, targetClass ) => {
		for ( let j = linearData.length - 1; j >= 0; j-- ) {
			const type = ve.dm.LinearData.static.getType( linearData[ j ] );
			if ( type ) {
				const itemClass = modelRegistry.lookup( type ) || ve.dm.AlienNode;
				if ( !( itemClass === targetClass || itemClass.prototype instanceof targetClass ) ) {
					return false;
				}
			} else {
				return false;
			}
		}
		return true;
	};

	context.annotations = annotationSet || (
		prevContext ? prevContext.annotations.clone() : new ve.dm.AnnotationSet( this.store )
	);
	context.branchType = wrapperElement ? wrapperElement.type : (
		prevContext ? prevContext.branchType : 'document'
	);
	context.branchHasContent = this.nodeFactory.canNodeContainContent( context.branchType );
	context.originallyExpectingContent = context.branchHasContent || !context.annotations.isEmpty();
	context.expectingContent = context.originallyExpectingContent;
	context.inWrapper = prevContext ? prevContext.inWrapper : false;
	context.canCloseWrapper = false;
	this.contextStack.push( context );

	// Open element
	if ( wrapperElement ) {
		data.push( wrapperElement );
	}
	// Add contents
	function setInlineMeta( element ) {
		ve.setProp( element, 'internal', 'isInlineMeta', true );
	}

	let prevElement;
	for ( let i = 0; i < domElement.childNodes.length; i++ ) {
		const childNode = domElement.childNodes[ i ];
		switch ( childNode.nodeType ) {
			case Node.ELEMENT_NODE:
			case Node.COMMENT_NODE: {
				if (
					childNode.hasAttribute &&
					childNode.hasAttribute( 'data-ve-ignore' )
				) {
					continue;
				}
				const aboutGroup = getAboutGroup( childNode );
				const modelName = this.modelRegistry.matchElement( childNode, aboutGroup.length > 1 );
				let modelClass = this.modelRegistry.lookup( modelName ) || ve.dm.AlienNode;
				let childNodes;
				if ( modelClass.prototype instanceof ve.dm.Annotation ) {
					childNodes = [ childNode ];
				} else {
					// Node or meta item
					childNodes = modelClass.static.enableAboutGrouping ?
						aboutGroup : [ childNode ];
				}
				let childDataElements = this.createDataElements( modelClass, childNodes );

				if ( !childDataElements ) {
					// Alienate
					modelClass = ve.dm.AlienNode;
					childNodes = modelClass.static.enableAboutGrouping ?
						aboutGroup : [ childNode ];
					childDataElements = this.createDataElements( modelClass, childNodes );
				} else if ( childDataElements.length ) {
					// Update modelClass to reflect the type we got back
					modelClass = this.modelRegistry.lookup( childDataElements[ 0 ].type );
				} else {
					continue;
				}

				// If we're about to start wrapping for an annotation,
				// check paragraphs are actually allowed here.
				if (
					!context.inWrapper && !context.expectingContent &&
					modelClass.prototype instanceof ve.dm.Annotation &&
					!this.isValidChildNodeType( 'paragraph' )
				) {
					// Alienate (force block mode as we are replacing a wrapper)
					modelClass = ve.dm.AlienBlockNode;
					childNodes = modelClass.static.enableAboutGrouping ?
						aboutGroup : [ childNode ];
					childDataElements = this.createDataElements( modelClass, childNodes );
				}

				// Now take the appropriate action based on that
				if ( modelClass.prototype instanceof ve.dm.Annotation ) {
					const annotation = this.annotationFactory.createFromElement( childDataElements[ 0 ], this.store );
					// Start wrapping if needed
					if ( !context.inWrapper && !context.expectingContent ) {
						startWrapping();
						prevElement = wrappingParagraph;
					}
					// Append child element data
					const childAnnotations = context.annotations.clone();
					childAnnotations.push( annotation );

					childDataElements = this.getDataFromDomSubtree( childNode, undefined, childAnnotations );
					if ( !childDataElements.length || isAllInstanceOf( childDataElements, ve.dm.AlienMetaItem ) ) {
						// Empty annotation, create a meta item
						if ( !childDataElements.length || isAllInstanceOf( childDataElements, ve.dm.RemovableAlienMetaItem ) ) {
							childDataElements = this.createDataElements( ve.dm.RemovableAlienMetaItem, childNodes );
						} else {
							childDataElements = this.createDataElements( ve.dm.AlienMetaItem, childNodes );
						}
						childDataElements.push( { type: '/' + childDataElements[ 0 ].type } );
						// Annotate meta item
						if ( !context.annotations.isEmpty() ) {
							childDataElements[ 0 ].annotations = context.annotations.getHashes().slice();
						}
						// Mark meta items to be moved outside of content context, as we can't handle them here
						// (context.expectingContent is always true at this point)
						setInlineMeta( childDataElements[ 0 ] );
					}
					outputWrappedMetaItems( 'restore' );
					ve.batchPush( data, childDataElements );
					// Clear wrapped whitespace
					wrappedWhitespace = '';
				} else {
					// Node or meta item
					if ( modelClass.prototype instanceof ve.dm.MetaItem ) {
						if ( context.expectingContent ) {
							// Mark meta items to be moved outside of content context, as we can't handle them here
							childDataElements.forEach( setInlineMeta );
						}

						// No additional processing needed
						// Write to data and continue
						if ( childDataElements.length === 1 ) {
							childDataElements.push( { type: '/' + childDataElements[ 0 ].type } );
						}
						// Annotate meta item
						if ( !context.annotations.isEmpty() ) {
							childDataElements[ 0 ].annotations = context.annotations.getHashes().slice();
						}
						// Queue wrapped meta items only if it's actually possible for us to move them out
						// of the wrapper
						if ( context.inWrapper && context.canCloseWrapper ) {
							ve.batchPush( wrappedMetaItems, childDataElements );
							if ( wrappedWhitespace !== '' ) {
								data.splice( wrappedWhitespaceIndex, wrappedWhitespace.length );
								addWhitespace( childDataElements[ 0 ], 0, wrappedWhitespace );
								nextWhitespace = wrappedWhitespace;
								wrappedWhitespace = '';
							}
						} else {
							outputWrappedMetaItems( 'restore' );
							ve.batchPush( data, childDataElements );
							processNextWhitespace( childDataElements[ 0 ] );
							prevElement = childDataElements[ 0 ];
						}
						// In case we consumed multiple childNodes, adjust i accordingly
						i += childNodes.length - 1;
						break;
					}

					let childIsContent = this.nodeFactory.canNodeSerializeAsContent( childDataElements[ 0 ].type );

					// If childIsContent isn't what we expect, adjust
					if ( !context.expectingContent && childIsContent ) {
						startWrapping();
						prevElement = wrappingParagraph;
					} else if ( context.expectingContent && !childIsContent ) {
						if ( context.inWrapper && context.canCloseWrapper ) {
							stopWrapping();
						} else {
							// Alienate
							modelClass = ve.dm.AlienNode;
							childNodes = modelClass.static.enableAboutGrouping ?
								aboutGroup : [ childNode ];
							childDataElements = this.createDataElements( modelClass, childNodes );
							childIsContent = this.nodeFactory.canNodeSerializeAsContent( childDataElements[ 0 ].type );
						}
					}

					// If we're inserting content into a wrapper, any wrapped whitespace and meta
					// items up until this point are here to stay
					if ( context.inWrapper && childIsContent ) {
						outputWrappedMetaItems( 'restore' );
						wrappedWhitespace = '';
						// Don't record the wrapped whitespace as the child node's outer whitespace
						nextWhitespace = '';
					}

					// Annotate child
					if ( childIsContent && !context.annotations.isEmpty() ) {
						childDataElements[ 0 ].annotations = context.annotations.getHashes().slice();
					}

					// Output child and process children if needed
					if (
						childDataElements.length === 1 &&
						childNodes.length === 1 &&
						this.nodeFactory.canNodeHaveChildren( childDataElements[ 0 ].type ) &&
						!this.nodeFactory.doesNodeHandleOwnChildren( childDataElements[ 0 ].type )
					) {
						// Recursion
						// Opening and closing elements are added by the recursion too
						outputWrappedMetaItems( 'restore' );
						ve.batchPush( data,
							this.getDataFromDomSubtree( childNode, childDataElements[ 0 ],
								new ve.dm.AnnotationSet( this.store )
							)
						);
					} else {
						if ( childDataElements.length === 1 ) {
							childDataElements.push( { type: '/' + childDataElements[ 0 ].type } );
						}
						// Write childDataElements directly
						outputWrappedMetaItems( 'restore' );
						ve.batchPush( data, childDataElements );
					}
					processNextWhitespace( childDataElements[ 0 ] );
					prevElement = childDataElements[ 0 ];

					// In case we consumed multiple childNodes, adjust i accordingly
					i += childNodes.length - 1;
				}
				break;
			}
			case Node.TEXT_NODE: {
				let text = childNode.data;
				if ( text === '' ) {
					// Empty text node?!?
					break;
				}
				if ( !context.originallyExpectingContent ) {
					// Strip and store outer whitespace
					if ( ve.dm.Converter.static.onlyWhitespaceRegex.test( text ) ) {
						// This text node is whitespace only
						if ( context.inWrapper ) {
							// We're already wrapping, so output this whitespace
							// and store it in wrappedWhitespace (see
							// comment about wrappedWhitespace below)
							wrappedWhitespace = text;
							wrappedWhitespaceIndex = data.length;
							ve.batchPush( data,
								this.constructor.static.getDataContentFromText( wrappedWhitespace, context.annotations )
							);
						} else {
							// We're not in wrapping mode, store this whitespace
							if ( !prevElement ) {
								if ( wrapperElement ) {
									// First child, store as inner
									// whitespace in the parent
									addWhitespace( wrapperElement, 1, text );
								}
								// Else, WTF?!? This is not supposed to
								// happen, but it's not worth
								// throwing an exception over.
							} else {
								addWhitespace( prevElement, 3, text );
							}
							nextWhitespace = text;
							wrappedWhitespace = '';
							outputWrappedMetaItems( 'restore' );
						}
						// We're done, no actual text left to process
						break;
					} else {
						// This text node contains actual text
						// Separate the real text from the whitespace
						// HACK: '.' doesn't match newlines in JS, so use
						// [\s\S] to match any character
						const matches = text.match( ve.dm.Converter.static.trimWhitespaceRegex );
						if ( !context.inWrapper ) {
							// Wrap the text in a paragraph and output it
							startWrapping();

							// Only store leading whitespace if we just
							// started wrapping
							if ( matches[ 1 ] !== '' ) {
								if ( !prevElement ) {
									if ( wrapperElement ) {
										// First child, store as inner
										// whitespace in the parent
										addWhitespace( wrapperElement, 1, matches[ 1 ] );
									}
									// Else, WTF?!? This is not supposed to
									// happen, but it's not worth
									// throwing an exception over.
								} else {
									addWhitespace( prevElement, 3, matches[ 1 ] );
								}
								addWhitespace( wrappingParagraph, 0, matches[ 1 ] );
							}
						} else {
							outputWrappedMetaItems( 'restore' );
							// We were already wrapping in a paragraph,
							// so the leading whitespace must be output
							ve.batchPush( data,
								this.constructor.static.getDataContentFromText( matches[ 1 ], context.annotations )
							);
						}
						// Output the text sans whitespace
						ve.batchPush( data,
							this.constructor.static.getDataContentFromText( matches[ 2 ], context.annotations )
						);

						// Don't store this in wrappingParagraph.internal.whitespace[3]
						// and nextWhitespace just yet. Instead, store it
						// in wrappedWhitespace. There might be more text
						// nodes after this one, so we output wrappedWhitespace
						// for now and undo that if it turns out this was
						// the last text node. We can't output it later
						// because we have to apply the correct annotations.
						wrappedWhitespace = matches[ 3 ];
						wrappedWhitespaceIndex = data.length;
						ve.batchPush( data,
							this.constructor.static.getDataContentFromText( wrappedWhitespace, context.annotations )
						);
						prevElement = wrappingParagraph;
						break;
					}
				}

				// Strip leading and trailing inner whitespace
				// (but only in non-annotation nodes)
				// and store it so it can be restored later.
				if (
					context.annotations.isEmpty() && i === 0 && wrapperElement &&
					!this.nodeFactory.doesNodeHaveSignificantWhitespace( wrapperElement.type )
				) {
					// Strip leading whitespace from the first child
					const matches = text.match( ve.dm.Converter.static.leadingWhitespacesRegex );
					if ( matches && matches[ 0 ] !== '' ) {
						addWhitespace( wrapperElement, 1, matches[ 0 ] );
						text = text.slice( matches[ 0 ].length );
					}
				}
				if (
					context.annotations.isEmpty() &&
					i === domElement.childNodes.length - 1 &&
					wrapperElement &&
					!this.nodeFactory.doesNodeHaveSignificantWhitespace( wrapperElement.type )
				) {
					// Strip trailing whitespace from the last child
					const matches = text.match( ve.dm.Converter.static.trailingWhitespacesRegex );
					if ( matches && matches[ 0 ] !== '' ) {
						addWhitespace( wrapperElement, 2, matches[ 0 ] );
						text = text.slice( 0, -matches[ 0 ].length );
					}
				}

				// Annotate the text and output it
				ve.batchPush( data,
					this.constructor.static.getDataContentFromText( text, context.annotations )
				);
				break;
			}
		}
	}
	// End auto-wrapping of bare content
	if ( context.inWrapper && context.canCloseWrapper ) {
		stopWrapping();
		// HACK: don't set context.inWrapper = false here because it's checked below
		context.inWrapper = true;
	}

	// If we're closing a node that doesn't have any children, but could contain a paragraph,
	// add a paragraph. This prevents things like empty list items
	if ( context.branchType !== 'paragraph' && wrapperElement && data[ data.length - 1 ] === wrapperElement &&
		!context.inWrapper && !this.nodeFactory.canNodeContainContent( context.branchType ) &&
		!this.nodeFactory.isNodeContent( context.branchType ) &&
		this.isValidChildNodeType( 'paragraph' )
	) {
		const wrapperParagraph = { type: 'paragraph', internal: { generated: 'wrapper' } };
		processNextWhitespace( wrapperParagraph );
		data.push( wrapperParagraph );
		data.push( { type: '/paragraph' } );
	}

	// Close element
	if ( wrapperElement ) {
		// Add the whitespace after the last child to the parent as innerPost
		// But don't do this if the parent is empty, because in that case we've already put that
		// whitespace in innerPre
		if ( nextWhitespace !== '' && data[ data.length - 1 ] !== wrapperElement ) {
			addWhitespace( wrapperElement, 2, nextWhitespace );
			nextWhitespace = '';
		}
		data.push( { type: '/' + wrapperElement.type } );
	}
	// Don't return an empty document
	if ( context.branchType === 'document' && isAllInstanceOf( data, ve.dm.MetaItem ) && !annotationSet ) {
		const emptyParagraph = { type: 'paragraph', internal: { generated: 'empty' } };
		processNextWhitespace( emptyParagraph );
		data.push( emptyParagraph );
		data.push( { type: '/paragraph' } );
	}

	this.contextStack.pop();
	return data;
};

/**
 * Get inner whitespace from linear data
 *
 * @private
 * @param {ve.dm.LinearData} data Linear model data
 * @return {Array.<string|undefined>} Sparse array of whitespace strings: [ innerLeft, innerRight ]
 */
ve.dm.ModelFromDomConverter.prototype.getInnerWhitespace = function ( data ) {
	const innerWhitespace = new Array( 2 );
	let stack = 0,
		last = data.getLength() - 1;

	let whitespace;
	if ( data.isOpenElementData( 0 ) ) {
		whitespace = ve.getProp( data.getData( 0 ), 'internal', 'whitespace' );
		innerWhitespace[ 0 ] = whitespace ? whitespace[ 0 ] : undefined;
	}
	if ( data.isCloseElementData( last ) ) {
		// Find matching opening tag of the last close tag
		stack++;
		while ( --last ) {
			if ( data.isCloseElementData( last ) ) {
				stack++;
			} else if ( data.isOpenElementData( last ) ) {
				stack--;
				if ( stack === 0 && data.getType( last ) !== 'internalList' ) {
					break;
				}
			}
		}
		whitespace = ve.getProp( data.getData( last ), 'internal', 'whitespace' );
		innerWhitespace[ 1 ] = whitespace ? whitespace[ 3 ] : undefined;
	}
	return innerWhitespace;
};
