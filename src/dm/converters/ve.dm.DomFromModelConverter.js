/*!
 * VisualEditor DataModel DomFromModelConverter class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Provides HTML DOM to VisualEditor linear data conversion
 * functionality to ve.dm.Converter.
 *
 * @class
 * @constructor
 * @param {ve.dm.ModelRegistry} modelRegistry
 * @param {ve.dm.NodeFactory} nodeFactory
 */
ve.dm.DomFromModelConverter = function VeDomFromModelConverter( modelRegistry, nodeFactory ) {
	this.modelRegistry = modelRegistry;
	this.nodeFactory = nodeFactory;

	this.store = null;
	this.documentData = null;
	this.internalList = null;
	this.originalDocInternalList = null;
	this.mode = null;
};

/* Inheritance */

OO.initClass( ve.dm.DomFromModelConverter );

/* Static Properties */

/**
 * List of HTML attribute names that {#renderHtmlAttributeList} should use computed values for.
 *
 * @type {string[]}
 */
ve.dm.DomFromModelConverter.static.computedAttributes = [ 'href', 'src' ];

ve.dm.DomFromModelConverter.static.PARSER_MODE = 0;
ve.dm.DomFromModelConverter.static.CLIPBOARD_MODE = 1;
ve.dm.DomFromModelConverter.static.PREVIEW_MODE = 2;

/* Static Methods */

/**
 * Utility function for annotation rendering. Transforms one set of annotations into another
 * by opening and closing annotations. Each time an annotation is opened or closed, the associated
 * callback is called with the annotation passed as a parameter.
 *
 * Note that currentSet will be modified, and will be equal to targetSet once this function returns.
 *
 * @static
 * @param {ve.dm.AnnotationSet} currentSet The set of annotations currently opened. Will be modified.
 * @param {ve.dm.AnnotationSet} targetSet The set of annotations we want to have.
 * @param {Function} open Callback called when an annotation is opened. Passed a ve.dm.Annotation.
 * @param {Function} close Callback called when an annotation is closed. Passed a ve.dm.Annotation.
 * @param {boolean} [forSerialization=true] Compare annotations for serialization
 */
ve.dm.DomFromModelConverter.static.openAndCloseAnnotations = function ( currentSet, targetSet, open, close, forSerialization = true ) {
	const comparisonMethod = forSerialization ? 'containsComparableForSerialization' : 'containsComparable';
	// Close annotations as needed
	// Go through annotationStack from bottom to top (low to high),
	// and find the first annotation that's not in annotations.
	if ( currentSet.getLength() ) {
		const targetSetOpen = targetSet.clone();
		let startClosingAt;
		for ( let i = 0, len = currentSet.getLength(); i < len; i++ ) {
			const hash = currentSet.getHash( i );
			// containsComparableForSerialization is expensive,
			// so do a simple contains check first
			if (
				targetSetOpen.containsHash( hash ) ||
				targetSetOpen[ comparisonMethod ]( currentSet.get( i ) )
			) {
				targetSetOpen.removeHash( hash );
			} else {
				startClosingAt = i;
				break;
			}
		}
		if ( startClosingAt !== undefined ) {
			// Close all annotations from top to bottom (high to low)
			// until we reach startClosingAt
			for ( let i = currentSet.getLength() - 1; i >= startClosingAt; i-- ) {
				close( currentSet.get( i ) );
				// Remove from currentClone
				currentSet.removeAt( i );
			}
		}
	}

	if ( targetSet.getLength() ) {
		const currentSetOpen = currentSet.clone();
		// Open annotations as needed
		for ( let i = 0, len = targetSet.getLength(); i < len; i++ ) {
			const hash = targetSet.getHash( i );
			// containsComparableForSerialization is expensive,
			// so do a simple contains check first
			if (
				currentSetOpen.containsHash( hash ) ||
				currentSetOpen[ comparisonMethod ]( targetSet.get( i ) )
			) {
				// If an annotation is already open remove it from the currentSetOpen list
				// as it may exist multiple times in the targetSet, and so may need to be
				// opened again
				currentSetOpen.removeHash( hash );
			} else {
				open( targetSet.get( i ) );
				// Add to currentClone
				currentSet.pushHash( hash );
			}
		}
	}
};

/**
 * Copy attributes from one set of DOM elements to another.
 *
 * @static
 * @param {HTMLElement[]} originalDomElements Array of DOM elements to render from
 * @param {HTMLElement[]} targetDomElements Array of DOM elements to render onto
 * @param {boolean|Function} [filter=true] Attribute filter
 * @param {boolean} [computed=false] If true, use the computed values of attributes where available
 * @param {boolean} [deep=false] Recurse into child nodes
 */
ve.dm.DomFromModelConverter.static.renderHtmlAttributeList = function ( originalDomElements, targetDomElements, filter = true, computed = false, deep = false ) {
	if ( filter === undefined ) {
		filter = true;
	}
	if ( filter === false ) {
		return;
	}

	for ( let i = 0, ilen = originalDomElements.length; i < ilen; i++ ) {
		if ( !targetDomElements[ i ] ) {
			continue;
		}
		const attrs = originalDomElements[ i ].attributes;
		if ( !attrs ) {
			continue;
		}
		for ( let j = 0, jlen = attrs.length; j < jlen; j++ ) {
			if (
				targetDomElements[ i ].nodeType === Node.ELEMENT_NODE &&
				!targetDomElements[ i ].hasAttribute( attrs[ j ].name ) &&
				( filter === true || filter( attrs[ j ].name ) )
			) {
				let value;
				if ( computed && this.computedAttributes.includes( attrs[ j ].name ) ) {
					value = originalDomElements[ i ][ attrs[ j ].name ];
				} else {
					value = attrs[ j ].value;
				}
				targetDomElements[ i ].setAttribute( attrs[ j ].name, value );
			}
		}

		// Descend into element children only (skipping text nodes, comment nodes and nodes we just created)
		if ( deep && !targetDomElements[ i ].veFromDataElement && originalDomElements[ i ].children.length > 0 ) {
			this.renderHtmlAttributeList(
				originalDomElements[ i ].children,
				targetDomElements[ i ].children,
				filter,
				computed,
				true
			);
		}
	}
};

/* Methods */

/**
 * Get the HashValueStore used for the current conversion.
 *
 * @return {ve.dm.HashValueStore|null} Current store, or null if not converting
 */
ve.dm.DomFromModelConverter.prototype.getStore = function () {
	return this.store;
};

/**
 * Get the converter mode, one of PARSER_MODE, CLIPBOARD_MODE or PREVIEW_MODE
 *
 * @return {number} Converter mode
 */
ve.dm.DomFromModelConverter.prototype.getMode = function () {
	return this.mode;
};

/**
 * Checks if the current mode needs a full view rendering in the HTML
 *
 * @return {boolean} Mode needs a rendering
 */
ve.dm.DomFromModelConverter.prototype.doesModeNeedRendering = function () {
	return this.getMode() !== this.constructor.static.PARSER_MODE;
};

/**
 * Is the current conversion for the parser
 *
 * @return {boolean} The conversion is for the paser
 */
ve.dm.DomFromModelConverter.prototype.isForParser = function () {
	return this.getMode() === this.constructor.static.PARSER_MODE;
};

/**
 * Is the current conversion for the clipboard
 *
 * @return {boolean} The conversion is for the clipboard
 */
ve.dm.DomFromModelConverter.prototype.isForClipboard = function () {
	return this.getMode() === this.constructor.static.CLIPBOARD_MODE;
};

/**
 * Is the current conversion for the preview
 *
 * @return {boolean} The conversion is for the preview
 */
ve.dm.DomFromModelConverter.prototype.isForPreview = function () {
	return this.getMode() === this.constructor.static.PREVIEW_MODE;
};

/**
 * Get the DOM element for a given linear model element.
 *
 * This invokes the toDomElements function registered for the element type.
 *
 * @private
 * @param {ve.dm.LinearData.Element|ve.dm.LinearData.Item[]} dataElements Linear model element or data slice
 * @param {HTMLDocument} doc Document to create DOM elements in
 * @param {Node[]} [childDomElements] Array of child DOM elements to pass in (annotations only)
 * @return {Node[]|boolean} DOM elements, or false if the element cannot be converted.
 *  If the first DOMelement has a 'handledOwnChildren' property set, the converter treats it as if it
 *  were a handlesOwnChildren node.
 */
ve.dm.DomFromModelConverter.prototype.getDomElementsFromDataElement = function ( dataElements, doc, childDomElements ) {
	const dataElement = Array.isArray( dataElements ) ? dataElements[ 0 ] : dataElements,
		nodeClass = this.modelRegistry.lookup( dataElement.type );

	if ( !nodeClass ) {
		throw new Error( 'Attempting to convert unknown data element type ' + dataElement.type );
	}
	if ( nodeClass.static.isInternal ) {
		return false;
	}
	const domElements = nodeClass.static.toDomElements( dataElements, doc, this, childDomElements );
	if ( !Array.isArray( domElements ) && !( nodeClass.prototype instanceof ve.dm.Annotation ) ) {
		throw new Error( 'toDomElements() failed to return an array when converting element of type ' + dataElement.type );
	}
	const originalDomElements = this.store.value( dataElement.originalDomElementsHash );
	// Optimization: don't call renderHtmlAttributeList if returned domElements are equal to the originals
	if ( originalDomElements && !ve.isEqualDomElements( domElements, originalDomElements ) ) {
		this.constructor.static.renderHtmlAttributeList(
			originalDomElements,
			domElements,
			nodeClass.static.preserveHtmlAttributes,
			// computed
			false,
			// deep
			(
				!this.nodeFactory.lookup( dataElement.type ) ||
				!this.nodeFactory.canNodeHaveChildren( dataElement.type ) ||
				this.nodeFactory.doesNodeHandleOwnChildren( dataElement.type )
			)
		);
	}
	// TODO: This is only for the diff. Eventually should make a DiffConverter subclass
	if ( dataElement.internal && dataElement.internal.diff ) {
		Array.prototype.forEach.call( domElements, ( domElement ) => {
			for ( const key in dataElement.internal.diff ) {
				// toDomElements is a misnomer, it can actually return other nodes,
				// such as comment nodes or text nodes.
				if ( domElement.setAttribute ) {
					domElement.setAttribute( key, dataElement.internal.diff[ key ] );
				}
			}
		} );
	}
	// Mark branch nodes as generated from dataElement, so we don't try and descend into them in a deep renderHtmlAttributeList call
	if ( this.nodeFactory.lookup( dataElement.type ) && this.nodeFactory.canNodeHaveChildren( dataElement.type ) ) {
		const hasSignificantWhitespace = this.nodeFactory.doesNodeHaveSignificantWhitespace( dataElement.type );
		domElements.forEach( ( domElement ) => {
			domElement.veFromDataElement = true;
			if ( hasSignificantWhitespace ) {
				domElement.veHasSignificantWhitespace = true;
			}
		} );
	}
	return domElements;
};

/**
 * Convert document model to an HTML DOM
 *
 * @param {ve.dm.Document} model Document model
 * @param {number} [mode=PARSER_MODE] Conversion mode, defaults to PARSER_MODE
 * @return {HTMLDocument} Document containing the resulting HTML
 */
ve.dm.DomFromModelConverter.prototype.getDomFromModel = function ( model, mode = ve.dm.DomFromModelConverter.static.PARSER_MODE ) {
	const doc = ve.createDocumentFromHtml( '' );
	this.getDomSubtreeFromModel( model, doc.body, mode );

	return doc;
};

/**
 * Convert model node to an HTML DOM
 *
 * @param {ve.dm.Node} node Model node
 * @param {number} [mode=PARSER_MODE] Conversion mode, defaults to PARSER_MODE
 * @return {HTMLDocument} Document containing the resulting HTML
 */
ve.dm.DomFromModelConverter.prototype.getDomFromNode = function ( node, mode = ve.dm.DomFromModelConverter.static.PARSER_MODE ) {
	return this.getDomFromModel(
		node.getDocument().shallowCloneFromRange( node.isInternal() ? node.getRange() : node.getOuterRange() ),
		mode
	);
};

/**
 * Convert document model to an HTML DOM subtree and add it to a container element.
 *
 * @param {ve.dm.Document} model Document model
 * @param {HTMLElement} container DOM element to add the generated elements to. Should be empty.
 * @param {number} [mode=PARSER_MODE] Conversion mode, defaults to PARSER_MODE
 */
ve.dm.DomFromModelConverter.prototype.getDomSubtreeFromModel = function ( model, container, mode = ve.dm.DomFromModelConverter.static.PARSER_MODE ) {
	if ( typeof mode === 'boolean' ) {
		mode = mode ? this.constructor.static.CLIPBOARD_MODE : this.constructor.static.PARSER_MODE;
	}
	// Set up the converter state
	this.documentData = model.getFullData( undefined, 'roundTrip' );
	this.store = model.getStore();
	this.internalList = model.getInternalList();
	// Internal list of the doc this was cloned from, or itself if not cloned
	this.originalDocInternalList = model.getOriginalDocument() ? model.getOriginalDocument().getInternalList() : this.internalList;
	this.mode = mode;

	this.getDomSubtreeFromData( this.documentData, container, model.getInnerWhitespace() );

	// Clear the state
	this.documentData = null;
	this.store = null;
	this.internalList = null;
	this.originalDocInternalList = null;
	this.mode = null;
};

/**
 * Convert linear model data to an HTML DOM subtree and add it to a container element.
 *
 * @param {ve.dm.LinearData.Item[]} data Linear model data
 * @param {HTMLElement} container DOM element to add the generated elements to. Should be empty.
 * @param {Array.<string|undefined>} [innerWhitespace] Inner whitespace if the container is the body
 * @throws Unbalanced data: looking for closing /type
 */
ve.dm.DomFromModelConverter.prototype.getDomSubtreeFromData = function ( data, container, innerWhitespace ) {
	const whitespaceHtmlChars = ve.visibleWhitespaceCharacters,
		isForPreview = this.isForPreview(),
		dataLen = data.length,
		doc = container.ownerDocument;
	let text, annotatedDomElements, annotatedDomElementStack,
		domElement = container;

	// TODO this whole function should be rewritten with a domElementStack and ascend() and
	// descend() functions, to build the whole DOM bottom-up rather than top-down. That would make
	// unwrapping easier and will hopefully result in fewer DOM operations.

	const openAnnotation = () => {
		// Add text if needed
		if ( text.length > 0 ) {
			annotatedDomElements.push( doc.createTextNode( text ) );
			text = '';
		}
		annotatedDomElements = [];
		annotatedDomElementStack.push( annotatedDomElements );
	};

	const closeAnnotation = ( annotation ) => {
		const originalDomElements = annotation.getOriginalDomElements(),
			origElementText = originalDomElements[ 0 ] &&
				originalDomElements[ 0 ].textContent ||
				'';
		let leading = '',
			trailing = '';

		// Add text if needed
		if ( text.length > 0 ) {
			annotatedDomElements.push( doc.createTextNode( text ) );
			text = '';
		}

		const annotatedChildDomElements = annotatedDomElementStack.pop();
		annotatedDomElements = annotatedDomElementStack[ annotatedDomElementStack.length - 1 ];

		// HACK: Move any leading and trailing whitespace out of the annotation, but only if the
		// annotation didn't originally have leading/trailing whitespace
		if ( annotation.constructor.static.trimWhitespace ) {
			let matches;
			let first = annotatedChildDomElements[ 0 ];
			while (
				first &&
				first.nodeType === Node.TEXT_NODE &&
				( matches = first.data.match( ve.dm.Converter.static.leadingWhitespacesRegex ) ) &&
				!ve.dm.Converter.static.leadingWhitespaceRegex.test( origElementText )
			) {
				leading += matches[ 0 ];
				first.deleteData( 0, matches[ 0 ].length );
				if ( first.data.length !== 0 ) {
					break;
				}
				// Remove empty text node
				annotatedChildDomElements.shift();
				// Process next text node to see if it also has whitespace
				first = annotatedChildDomElements[ 0 ];
			}
			let last = annotatedChildDomElements[ annotatedChildDomElements.length - 1 ];
			while (
				last &&
				last.nodeType === Node.TEXT_NODE &&
				( matches = last.data.match( ve.dm.Converter.static.trailingWhitespacesRegex ) ) &&
				!ve.dm.Converter.static.trailingWhitespaceRegex.test( origElementText )
			) {
				trailing = matches[ 0 ] + trailing;
				last.deleteData( last.data.length - matches[ 0 ].length, matches[ 0 ].length );
				if ( last.data.length !== 0 ) {
					break;
				}
				// Remove empty text node
				annotatedChildDomElements.pop();
				// Process next text node to see if it also has whitespace
				last = annotatedChildDomElements[ annotatedChildDomElements.length - 1 ];
			}
		}

		let annotationElement;
		if ( annotatedChildDomElements.length ) {
			annotationElement = this.getDomElementsFromDataElement(
				annotation.getElement(), doc, annotatedChildDomElements
			)[ 0 ];
		}

		if ( leading ) {
			annotatedDomElements.push( doc.createTextNode( leading ) );
		}
		let n, len;
		if ( annotationElement ) {
			for ( n = 0, len = annotatedChildDomElements.length; n < len; n++ ) {
				annotationElement.appendChild( annotatedChildDomElements[ n ] );
			}
			annotatedDomElements.push( annotationElement );
		} else {
			for ( n = 0, len = annotatedChildDomElements.length; n < len; n++ ) {
				annotatedDomElements.push( annotatedChildDomElements[ n ] );
			}
		}
		if ( trailing ) {
			annotatedDomElements.push( doc.createTextNode( trailing ) );
		}
	};

	/**
	 * @param {number} k
	 * @return {number}
	 */
	const findEndOfNode = ( k ) => {
		let n, depth;
		for ( n = k + 1, depth = 1; n < dataLen && depth > 0; n++ ) {
			if ( data[ n ].type ) {
				depth += data[ n ].type.charAt( 0 ) === '/' ? -1 : 1;
			}
		}
		if ( depth !== 0 ) {
			throw new Error( 'Unbalanced data: ' + depth + ' element(s) left open.' );
		}
		return n;
	};

	/**
	 * @param {number} i
	 * @return {ve.dm.LinearData.Element|ve.dm.LinearData.Item[]}
	 */
	const getDataElementOrSlice = ( i ) => {
		let dataSlice;
		if (
			ve.dm.nodeFactory.lookup( data[ i ].type ) &&
			ve.dm.nodeFactory.doesNodeHandleOwnChildren( data[ i ].type )
		) {
			dataSlice = data.slice( i, findEndOfNode( i ) );
		} else {
			dataSlice = data[ i ];
		}
		return dataSlice;
	};

	/**
	 * @param {string} char
	 * @return {string}
	 */
	const getChar = ( char ) => {
		if (
			isForPreview &&
			!domElement.veHasSignificantWhitespace &&
			Object.prototype.hasOwnProperty.call( whitespaceHtmlChars, char )
		) {
			char = whitespaceHtmlChars[ char ];
		}
		return char;
	};

	const annotationStack = new ve.dm.AnnotationSet( this.store );

	for ( let i = 0; i < dataLen; i++ ) {
		if ( typeof data[ i ] === 'string' ) {
			// Text
			text = '';
			let isStart = i > 0 &&
				ve.dm.LinearData.static.isOpenElementData( data[ i - 1 ] ) &&
				!ve.dm.nodeFactory.doesNodeHaveSignificantWhitespace(
					ve.dm.LinearData.static.getType( data[ i - 1 ] )
				);
			// Continue forward as far as the plain text goes
			while ( typeof data[ i ] === 'string' ) {
				// HACK: Skip over leading whitespace (T53462/T142132) in non-whitespace-preserving tags
				// This should possibly be handled by Parsoid or in the UI.
				if ( !( isStart && ve.dm.Converter.static.onlyWhitespaceRegex.test( data[ i ] ) && this.isForParser() ) ) {
					text += getChar( data[ i ] );
					isStart = false;
				}
				i++;
			}
			// i points to the first non-text thing, go back one so we don't skip this later
			i--;
			// Add text
			if ( text.length > 0 ) {
				domElement.appendChild( doc.createTextNode( text ) );
			}
		} else if (
			Array.isArray( data[ i ] ) ||
			(
				data[ i ].annotations !== undefined &&
				this.nodeFactory.canNodeSerializeAsContent( data[ i ].type )
			)
		) {
			// Annotated text, nodes or meta
			text = '';
			annotatedDomElements = [];
			annotatedDomElementStack = [ annotatedDomElements ];
			while (
				data[ i ] !== undefined && (
					Array.isArray( data[ i ] ) ||
					(
						data[ i ].annotations !== undefined &&
						this.nodeFactory.canNodeSerializeAsContent( data[ i ].type )
					)
				)
			) {
				const annotations = new ve.dm.AnnotationSet(
					this.store, data[ i ].annotations || data[ i ][ 1 ]
				);
				this.constructor.static.openAndCloseAnnotations( annotationStack, annotations,
					openAnnotation, closeAnnotation, !this.isForPreview()
				);

				if ( data[ i ].annotations === undefined ) {
					// Annotated text
					text += getChar( data[ i ][ 0 ] );
				} else {
					// Annotated node
					// Add text if needed
					if ( text.length > 0 ) {
						annotatedDomElements.push( doc.createTextNode( text ) );
						text = '';
					}
					// Insert the elements
					const dataElementOrSlice = getDataElementOrSlice( i );
					const childDomElements = this.getDomElementsFromDataElement( dataElementOrSlice, doc );
					for ( let j = 0; j < childDomElements.length; j++ ) {
						annotatedDomElements.push( childDomElements[ j ] );
					}
					if ( Array.isArray( dataElementOrSlice ) ) {
						i += dataElementOrSlice.length - 1;
					} else {
						i++; // Skip the closing
					}
				}
				i++;
			}
			// We're now at the first non-annotated thing, go back one so we don't skip this later
			i--;

			// Add any gathered text
			if ( text.length > 0 ) {
				annotatedDomElements.push( doc.createTextNode( text ) );
				text = '';
			}
			// Close any remaining annotations
			this.constructor.static.openAndCloseAnnotations( annotationStack, new ve.dm.AnnotationSet( this.store ),
				openAnnotation, closeAnnotation, !this.isForPreview()
			);
			// Put the annotated nodes in the DOM
			for ( let j = 0; j < annotatedDomElements.length; j++ ) {
				domElement.appendChild( annotatedDomElements[ j ] );
			}
		} else if ( data[ i ].type !== undefined ) {
			const dataElement = data[ i ];
			// Element
			if ( dataElement.type.charAt( 0 ) === '/' ) {
				// Close element
				const parentDomElement = domElement.parentNode;
				const type = data[ i ].type.slice( 1 );
				const isContentNode = this.nodeFactory.isNodeContent( type );
				// Process whitespace
				// whitespace = [ outerPre, innerPre, innerPost, outerPost ]
				const oldLastOuterPost = parentDomElement.lastOuterPost;
				if (
					!isContentNode &&
					domElement.veInternal &&
					domElement.veInternal.whitespace
				) {
					// Process inner whitespace. innerPre is for sure legitimate
					// whitespace that should be inserted; if it was a duplicate
					// of our child's outerPre, we would have cleared it.
					const pre = domElement.veInternal.whitespace[ 1 ];
					if ( pre ) {
						if (
							domElement.firstChild &&
							domElement.firstChild.nodeType === Node.TEXT_NODE
						) {
							// First child is a TextNode, prepend to it
							domElement.firstChild.insertData( 0, pre );
						} else {
							// Prepend a TextNode
							const textNode = doc.createTextNode( pre );
							textNode.veIsWhitespace = true;
							domElement.insertBefore(
								textNode,
								domElement.firstChild
							);
						}
					}
					const lastChild = domElement.veInternal.childDomElements ?
						domElement.veInternal
							.childDomElements[ domElement.veInternal.childDomElements.length - 1 ]
							.lastChild :
						domElement.lastChild;
					const ours = domElement.veInternal.whitespace[ 2 ];
					let theirs;
					if ( domElement.lastOuterPost === undefined ) {
						// This node didn't have any structural children
						// (i.e. it's a content-containing node), so there's
						// nothing to check innerPost against
						theirs = ours;
					} else {
						theirs = domElement.lastOuterPost;
					}
					if ( ours && ours === theirs ) {
						if ( lastChild && lastChild.nodeType === Node.TEXT_NODE ) {
							// Last child is a TextNode, append to it
							domElement.lastChild.appendData( ours );
						} else {
							// Append a TextNode
							const textNode = doc.createTextNode( ours );
							textNode.veIsWhitespace = true;
							domElement.appendChild(
								textNode
							);
						}
					}
					// Tell the parent about our outerPost
					parentDomElement.lastOuterPost = domElement.veInternal.whitespace[ 3 ] || '';
				} else if ( !isContentNode ) {
					// Use empty string, because undefined means there were no
					// structural children
					parentDomElement.lastOuterPost = '';
				}
				// else don't touch lastOuterPost

				// Logic to unwrap empty & wrapper nodes.
				// It would be nicer if we could avoid generating in the first
				// place, but then remembering where we have to skip ascending
				// to the parent would be tricky.
				let doUnwrap = false;
				if ( domElement.veInternal ) {
					switch ( domElement.veInternal.generated ) {
						case 'slug':
							// 'slug' elements - remove if they are still empty
							if ( domElement.childNodes.length === 0 ) {
								doUnwrap = true;
							}
							break;
						case 'empty':
							// 'empty' elements - first ensure they are actually empty
							if (
								domElement.childNodes.length === 0 &&
								(
									// then check that we are the last child
									// before unwrapping (and therefore destroying)
									data[ i + 1 ] === undefined ||
									data[ i + 1 ].type.charAt( 0 ) === '/' ||
									// Document ends when we encounter the internal list
									(
										data[ i + 1 ].type &&
										this.nodeFactory.isNodeInternal( data[ i + 1 ].type )
									)
								)
							) {
								doUnwrap = true;
							}
							break;
						case 'wrapper': {
							// 'wrapper' elements - ensure there is a block level
							// element between this element and the previous sibling
							// wrapper or parent node
							doUnwrap = true;
							const previousSiblings = domElement.parentNode.childNodes;
							// Note: previousSiblings includes the current element
							// so we only go up to length - 2
							for ( let j = previousSiblings.length - 2; j >= 0; j-- ) {
								const sibling = previousSiblings[ j ];
								if ( ve.isBlockElement( sibling ) ) {
									// Stop searching early when we get to a block element.
									break;
								}
								// If we find content, don't unwrap.
								if (
									// Text node content (non-whitespace)
									( sibling.nodeType === Node.TEXT_NODE && !sibling.veIsWhitespace ) ||
									// Inline content tag
									( sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName !== 'META' && sibling.tagName !== 'LINK' )
								) {
									// we've found unwrapped content so don't unwrap
									doUnwrap = false;
									break;
								}
							}
							break;
						}
					}
				}
				if ( doUnwrap ) {
					if ( domElement.childNodes.length ) {
						// If domElement has children, append them to parentDomElement
						while ( domElement.firstChild ) {
							parentDomElement.insertBefore(
								domElement.firstChild,
								domElement
							);
						}
					} else {
						// If domElement has no children, it's as if it was never there at all,
						// so set lastOuterPost back to what it was, except that we need to
						// change undefined to '' , since undefined means there were no children.
						parentDomElement.lastOuterPost = oldLastOuterPost || '';
					}
					parentDomElement.removeChild( domElement );
				}

				delete domElement.veInternal;
				delete domElement.lastOuterPost;
				// Ascend to parent node, except if this is an internal node
				// TODO: It's not covered with unit tests.
				if ( !ve.dm.nodeFactory.lookup( type ) || !ve.dm.nodeFactory.isNodeInternal( type ) ) {
					domElement = parentDomElement;
				}
			} else {
				// Create node from data
				if ( this.nodeFactory.isNodeInternal( data[ i ].type ) ) {
					// Reached the internal list, finish
					break;
				}
				const isContentNode = this.nodeFactory.isNodeContent( data[ i ].type );

				const dataElementOrSlice = getDataElementOrSlice( i );
				const childDomElements = this.getDomElementsFromDataElement( dataElementOrSlice, doc );
				if ( childDomElements && !childDomElements.length ) {
					// Support toDomElements returning an empty array
					i = findEndOfNode( i ) - 1;
					continue;
				} else if ( childDomElements ) {
					// Add clone of internal data; we use a clone rather than a reference because
					// we modify .veInternal.whitespace[1] in some cases
					childDomElements[ 0 ].veInternal = ve.extendObject(
						{ childDomElements: childDomElements },
						dataElement.internal ? ve.copy( dataElement.internal ) : {}
					);
					// Add elements
					for ( let j = 0; j < childDomElements.length; j++ ) {
						domElement.appendChild( childDomElements[ j ] );
					}
					// Descend into the first child node
					const parentDomElement = domElement;
					domElement = childDomElements[ 0 ];

					// Process outer whitespace
					// Every piece of outer whitespace is duplicated somewhere:
					// each node's outerPost is duplicated as the next node's
					// outerPre, the first node's outerPre is the parent's
					// innerPre, and the last node's outerPost is the parent's
					// innerPost. For each piece of whitespace, we verify that
					// the duplicate matches. If it doesn't, we take that to
					// mean the user has messed with it and don't output any
					// whitespace.
					if ( domElement.veInternal && domElement.veInternal.whitespace ) {
						// Process this node's outerPre
						const ours = domElement.veInternal.whitespace[ 0 ];
						let theirs;
						if ( domElement.previousSibling ) {
							// Get previous sibling's outerPost
							theirs = parentDomElement.lastOuterPost;
						} else if ( parentDomElement === container ) {
							// outerPre of the very first node in the document, check against body innerWhitespace
							theirs = innerWhitespace ? innerWhitespace[ 0 ] : ours;
						} else {
							// First child, get parent's innerPre
							if (
								parentDomElement.veInternal &&
								parentDomElement.veInternal.whitespace
							) {
								theirs = parentDomElement.veInternal.whitespace[ 1 ];
								// Clear parent's innerPre so it's not used again
								parentDomElement.veInternal.whitespace[ 1 ] = undefined;
							}
							// else theirs=undefined
						}
						if ( ours && ours === theirs ) {
							// Matches the duplicate, insert a TextNode
							const textNode = doc.createTextNode( ours );
							textNode.veIsWhitespace = true;
							parentDomElement.insertBefore(
								textNode,
								domElement
							);
						}
					} else if (
						!isContentNode &&
						!domElement.previousSibling &&
						parentDomElement.veInternal &&
						parentDomElement.veInternal.whitespace
					) {
						// The parent's innerPre should not be used, because it doesn't match
						// outerPre (since we didn't have any whitespace set at all).
						// Except if this is a content node, because content nodes
						// don't have whitespace annotated on them *sigh*
						parentDomElement.veInternal.whitespace[ 1 ] = undefined;
					}
				}

				if ( Array.isArray( dataElementOrSlice ) ) {
					i += dataElementOrSlice.length - 2;
				} else if ( childDomElements && childDomElements.length && childDomElements[ 0 ].handledOwnChildren ) {
					i = findEndOfNode( i ) - 2;
				}
			}
		}
	}
	// Check outerPost whitespace of the very last node against body innerWhitespace
	if (
		container.lastOuterPost !== undefined &&
		( !innerWhitespace || container.lastOuterPost === innerWhitespace[ 1 ] )
	) {
		if ( container.lastChild && container.lastChild.nodeType === Node.TEXT_NODE ) {
			// Last child is a TextNode, append to it
			container.lastChild.appendData( container.lastOuterPost );
		} else if ( container.lastOuterPost.length > 0 ) {
			// Append a TextNode
			container.appendChild( doc.createTextNode( container.lastOuterPost ) );
		}
		delete container.lastOuterPost;
	}
	// Get rid of excess text nodes
	container.normalize();
};
