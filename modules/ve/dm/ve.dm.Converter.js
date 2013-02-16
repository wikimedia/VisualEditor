/*!
 * VisualEditor DataModel Converter class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel converter.
 *
 * Converts between HTML DOM and VisualEditor linear data.
 *
 * @class
 * @constructor
 * @param {ve.dm.ModelRegistry} modelRegistry
 * @param {ve.dm.NodeFactory} nodeFactory
 * @param {ve.dm.AnnotationFactory} annotationFactory
 */
ve.dm.Converter = function VeDmConverter( modelRegistry, nodeFactory, annotationFactory, metaItemFactory ) {
	// Properties
	this.modelRegistry = modelRegistry;
	this.nodeFactory = nodeFactory;
	this.annotationFactory = annotationFactory;
	this.metaItemFactory = metaItemFactory;
	this.doc = null;
	this.documentData = null;
	this.store = null;
	this.internalList = null;
	this.contextStack = null;
};

/* Static Methods */

/**
 * Get linear model data from a string optionally applying annotations
 *
 * @static
 * @param {string} text Plain text to convert
 * @param {ve.dm.AnnotationSet} [annotations] Annotations to apply
 * @returns {Array} Linear model data, one element per character
 */
ve.dm.Converter.getDataContentFromText = function ( text, annotations ) {
	var i, len, characters = text.split( '' );
	if ( !annotations || annotations.isEmpty() ) {
		return characters;
	}
	// Apply annotations to characters
	for ( i = 0, len = characters.length; i < len; i++ ) {
		// Just store the annotations' indexes from the index-value store
		characters[i] = [characters[i], annotations.getIndexes().slice()];
	}
	return characters;
};

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
 */
ve.dm.Converter.openAndCloseAnnotations = function ( currentSet, targetSet, open, close ) {
	var i, len, arr, annotation, annotationIndex, startClosingAt;
	// Close annotations as needed
	// Go through annotationStack from bottom to top (low to high),
	// and find the first annotation that's not in annotations.
	arr = currentSet.getIndexes();
	for ( i = 0, len = arr.length; i < len; i++ ) {
		annotationIndex = arr[i];
		if ( !targetSet.containsIndex( annotationIndex ) ) {
			startClosingAt = i;
			break;
		}
	}
	if ( startClosingAt !== undefined ) {
		// Close all annotations from top to bottom (high to low)
		// until we reach startClosingAt
		for ( i = currentSet.getLength() - 1; i >= startClosingAt; i-- ) {
			close( arr[i] );
			// Remove from currentClone
			currentSet.removeAt( i );
		}
	}

	// Open annotations as needed
	arr = targetSet.getIndexes();
	for ( i = 0, len = arr.length; i < len; i++ ) {
		annotationIndex = arr[i];
		if ( !currentSet.containsIndex( annotationIndex ) ) {
			annotation = targetSet.getStore().value( annotationIndex );
			open( annotation );
			// Add to currentClone
			currentSet.push( annotation );
		}
	}
};

/* Methods */

/**
 * Check whether this converter instance is currently inside a getDataFromDom() conversion.
 *
 * @method
 * @returns {boolean} Whether we're converting
 */
ve.dm.Converter.prototype.isConverting = function () {
	return this.contextStack !== null;
};

/**
 * Get the IndexValueStore used for the current conversion.
 *
 * @method
 * @returns {ve.dm.IndexValueStore|null} Current store, or null if not converting
 */
ve.dm.Converter.prototype.getStore = function () {
	return this.store;
};

/**
 * Get the HTML document currently being converted
 *
 * @method
 * @returns {HTMLDocument|null} HTML document being converted, or null if not converting
 */
ve.dm.Converter.prototype.getHtmlDocument = function () {
	return this.doc;
};

/**
 * Get the current conversion context. This is the recursion state of getDataFromDomRecursion().
 *
 * @method
 * @returns {Object|null} Context object, or null if not converting
 */
ve.dm.Converter.prototype.getCurrentContext = function ()  {
	return this.contextStack === null ? null : this.contextStack[this.contextStack.length - 1];
};

/**
 * Get the annotations currently being applied by the converter. Note that this is specific to
 * the current recursion level.
 *
 * @method
 * @returns {ve.dm.AnnotationSet|null} Annotation set, or null if not converting
 */
ve.dm.Converter.prototype.getActiveAnnotations = function () {
	var context = this.getCurrentContext();
	return context ? context.annotations : null;
};

/**
 * Whether the converter is currently expecting content. Note that this is specific to the current
 * recursion level.
 *
 * @method
 * @returns {boolean|null} Boolean indicating whether content is expected, or null if not converting
 */
ve.dm.Converter.prototype.isExpectingContent = function () {
	var context = this.getCurrentContext();
	return context ? context.expectingContent : null;
};

/**
 * Whether the conversion is currently inside a wrapper paragraph generated by the converter.
 * Note that this is specific to the current recursion level.
 *
 * @method
 * @returns {boolean|null} Boolean indicating whether we're wrapping, or null if not converting
 */
ve.dm.Converter.prototype.isInWrapper = function () {
	var context = this.getCurrentContext();
	return context ? context.inWrapper : null;
};

/**
 * Whether the active wrapper can be closed. Note that this is specific to the current recursion
 * level. If there is no active wrapper, this returns false.
 *
 * @method
 * @returns {boolean|null} Boolean indicating whether the wrapper can be closed, or null if not converting
 */
ve.dm.Converter.prototype.canCloseWrapper = function () {
	var context = this.getCurrentContext();
	return context ? context.canCloseWrapper : null;
};

/**
 * Get the DOM element for a given linear model element.
 *
 * This invokes the toDomElements function registered for the element type.
 *
 * @method
 * @param {Object|Array} dataElement Linear model element or data slice
 * @param {HTMLDocument} doc Document to create DOM elements in
 * @returns {HTMLElement|boolean} DOM element, or false if the element cannot be converted
 */
ve.dm.Converter.prototype.getDomElementsFromDataElement = function ( dataElements, doc ) {
	var domElements, dataElementAttributes, key, matches,
		dataElement = ve.isArray( dataElements ) ? dataElements[0] : dataElements,
		nodeClass = this.modelRegistry.lookup( dataElement.type );
	if ( !nodeClass ) {
		throw new Error( 'Attempting to convert unknown data element type ' + dataElement.type );
	}
	if ( nodeClass.static.isInternal ) {
		return false;
	}
	domElements = nodeClass.static.toDomElements( dataElements, doc, this );
	if ( !domElements || !domElements.length ) {
		throw new Error( 'toDomElements() failed to return an array when converting element of type ' + dataElement.type );
	}
	dataElementAttributes = dataElement.attributes;
	if ( dataElementAttributes ) {
		for ( key in dataElementAttributes ) {
			// Only include 'html/i/*' attributes and strip the 'html/i/' from the beginning of the name
			/*jshint regexp:false */
			matches = key.match( /^html\/(\d+)\/(.*)$/ );
			if ( matches ) {
				if ( domElements[matches[1]] && !domElements[matches[1]].hasAttribute( matches[2] ) ) {
					domElements[matches[1]].setAttribute( matches[2], dataElementAttributes[key] );
				}
			}
		}
	}
	return domElements;
};

/**
 * Create a data element from a DOM element.
 * @param {ve.dm.Model} modelClass Model class to use for conversion
 * @param {HTMLElement[]} domElements DOM elements to convert
 * @returns {Object|Array|null} Data element or array of linear model data, or null to alienate
 */
ve.dm.Converter.prototype.createDataElements = function ( modelClass, domElements ) {
	var i, j, dataElements, dataElementAttributes, domElementAttributes,
		domElementAttribute;
	dataElements = modelClass.static.toDataElement( domElements, this );
	if ( !dataElements ) {
		return null;
	}
	if ( !ve.isArray( dataElements ) ) {
		dataElements = [ dataElements ];
	}
	if ( dataElements[0] && modelClass.static.storeHtmlAttributes ) {
		for ( i = 0; i < domElements.length; i++ ) {
			domElementAttributes = domElements[i].attributes;
			if ( domElementAttributes && domElementAttributes.length ) {
				dataElementAttributes = dataElements[0].attributes = dataElements[0].attributes || {};
				// Include all attributes and prepend 'html/i/' to each attribute name
				for ( j = 0; j < domElementAttributes.length; j++ ) {
					domElementAttribute = domElementAttributes[j];
					dataElementAttributes['html/' + i + '/' + domElementAttribute.name] =
						domElementAttribute.value;
				}
			}
		}
	}
	return dataElements;
};

/**
 * Build an HTML DOM node for a linear model annotation.
 *
 * @method
 * @param {Object} dataAnnotation Annotation object
 * @returns {HTMLElement} HTML DOM node
 */
ve.dm.Converter.prototype.getDomElementFromDataAnnotation = function ( dataAnnotation, doc ) {
	var htmlData = dataAnnotation.toHTML(),
		domElement = doc.createElement( htmlData.tag );
	ve.setDomAttributes( domElement, htmlData.attributes );
	return domElement;
};

/**
 * Convert an HTML document to a linear model.
 * @param {HTMLDocument} doc HTML document to convert
 * @param {ve.dm.IndexValueStore} store Index-value store
 * @param {ve.dm.InternalList} internalList Internal list
 * @returns {ve.dm.ElementLinearData} Linear model data
 */
ve.dm.Converter.prototype.getDataFromDom = function ( doc, store, internalList ) {
	var linearData, refData;
	// Set up the converter state
	this.doc = doc;
	this.store = store;
	this.internalList = internalList;
	this.contextStack = [];
	// Possibly do things with doc and the head in the future

	linearData = new ve.dm.ElementLinearData(
		store,
		this.getDataFromDomRecursion( doc.body )
	);
	refData = this.internalList.getDataFromDom( this );
	linearData.batchSplice( linearData.getLength(), 0, refData );

	// Clear the state
	this.doc = null;
	this.store = null;
	this.internalList = null;
	this.contextStack = null;
	return linearData;
};

/**
 * Recursive implementation of getDataFromDom(). For internal use, and for use in
 * ve.dm.Model.static.toDataElement() implementations.
 *
 * @method
 * @param {HTMLElement} domElement HTML element to convert
 * @param {Object} [wrapperElement] Data element to wrap the returned data in
 * @param {ve.dm.AnnotationSet} [annotationSet] Override the set of annotations to use
 * @returns {Array} Linear model data
 */
ve.dm.Converter.prototype.getDataFromDomRecursion = function ( domElement, wrapperElement, annotationSet ) {
	function addWhitespace( element, index, whitespace ) {
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
		if ( !element.internal.whitespace[index] ) {
			element.internal.whitespace[index] = '';
		}
		element.internal.whitespace[index] = whitespace;
	}
	function processNextWhitespace( element ) {
		// This function uses and changes nextWhitespace in the outer function's scope,
		// which means it's not really a function but more of a shortcut.
		if ( nextWhitespace !== '' ) {
			addWhitespace( element, 0, nextWhitespace );
			nextWhitespace = '';
		}
	}
	function outputWrappedMetaItems( whitespaceTreatment ) {
		var i, len, prev = wrappingParagraph;
		for ( i = 0, len = wrappedMetaItems.length; i < len; i++ ) {
			if ( wrappedMetaItems[i].type && wrappedMetaItems[i].type.charAt( 0 ) !== '/' ) {
				if ( wrappedMetaItems[i].internal && wrappedMetaItems[i].internal.whitespace ) {
					if ( whitespaceTreatment === 'restore' ) {
						data = data.concat( ve.dm.Converter.getDataContentFromText(
								wrappedMetaItems[i].internal.whitespace[0], context.annotations
						) );
						delete wrappedMetaItems[i].internal;
					} else if ( whitespaceTreatment === 'fixup' ) {
						addWhitespace( prev, 3, wrappedMetaItems[i].internal.whitespace[0] );
					}
				}
				prev = wrappedMetaItems[i];
			}
			data.push( wrappedMetaItems[i] );
		}
		wrappedMetaItems = [];
	}
	function startWrapping() {
		// Mark this paragraph as having been generated by
		// us, so we can strip it on the way out
		wrappingParagraph = {
			'type': 'paragraph',
			'internal': { 'generated': 'wrapper' }
		};
		data.push( wrappingParagraph );
		context.inWrapper = true;
		context.canCloseWrapper = true;
		context.expectingContent = true;
		processNextWhitespace( wrappingParagraph );
	}
	function stopWrapping() {
		if ( wrappedWhitespace !== '' ) {
			// Remove wrappedWhitespace from data
			data.splice( wrappedWhitespaceIndex, wrappedWhitespace.length );
			addWhitespace( wrappingParagraph, 3, wrappedWhitespace );
			nextWhitespace = wrappedWhitespace;
		}
		data.push( { 'type': '/paragraph' } );
		outputWrappedMetaItems( 'fixup' );
		wrappingParagraph = undefined;
		context.inWrapper = false;
		context.canCloseWrapper = false;
		context.expectingContent = context.originallyExpectingContent;
	}

	function getAboutGroup( el ) {
		var textNodes = [], aboutGroup = [ el ], elAbout, node;
		if ( !el.getAttribute || el.getAttribute( 'about' ) === null ) {
			return aboutGroup;
		}
		elAbout = el.getAttribute( 'about' );
		for ( node = el.nextSibling; node; node = node.nextSibling ) {
			if ( !node.getAttribute ) {
				// Text nodes don't have a getAttribute() method. Thanks HTML DOM,
				// that's really helpful ^^
				textNodes.push( node );
				continue;
			}
			if ( node.getAttribute( 'about' ) === elAbout ) {
				aboutGroup = aboutGroup.concat( textNodes );
				textNodes = [];
				aboutGroup.push( node );
			} else {
				break;
			}
		}
		return aboutGroup;
	}

	var i, childDomElement, childDomElements, childDataElements, text, childTypes, matches,
		wrappingParagraph, prevElement, childAnnotations, modelName, modelClass,
		annotation, childIsContent, aboutGroup,
		data = [],
		nextWhitespace = '',
		wrappedWhitespace = '',
		wrappedWhitespaceIndex,
		wrappedMetaItems = [],
		context = {},
		prevContext = this.contextStack.length ? this.contextStack[this.contextStack.length - 1] : null;

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
	for ( i = 0; i < domElement.childNodes.length; i++ ) {
		childDomElement = domElement.childNodes[i];
		switch ( childDomElement.nodeType ) {
			case Node.ELEMENT_NODE:
				modelName = this.modelRegistry.matchElement( childDomElement );
				modelClass = this.modelRegistry.lookup( modelName ) || ve.dm.AlienNode;
				if ( modelClass.prototype instanceof ve.dm.Annotation ) {
					childDataElements = this.createDataElements( modelClass, [ childDomElement ] );
				} else {
					// Node or meta item
					aboutGroup = getAboutGroup( childDomElement );
					childDomElements = modelClass.static.enableAboutGrouping ?
						aboutGroup : [ childDomElement ];
					childDataElements = this.createDataElements( modelClass, childDomElements );
				}

				if ( !childDataElements ) {
					// Alienate
					modelClass = ve.dm.AlienNode;
					childDomElements = modelClass.static.enableAboutGrouping ?
						aboutGroup : [ childDomElement ];
					childDataElements = this.createDataElement( modelClass, childDomElements );
				} else {
					// Update modelClass to reflect the type we got back
					modelClass = this.modelRegistry.lookup( childDataElements[0].type );
				}

				// Now take the appropriate action based on that
				if ( modelClass.prototype instanceof ve.dm.Annotation ) {
					annotation = this.annotationFactory.create( modelName, childDataElements[0] );
					// Start wrapping if needed
					if ( !context.inWrapper && !context.expectingContent ) {
						startWrapping();
						prevElement = wrappingParagraph;
					}
					// Append child element data
					childAnnotations = context.annotations.clone();
					childAnnotations.push( annotation );
					data = data.concat(
						this.getDataFromDomRecursion( childDomElement, undefined, childAnnotations )
					);
					// Clear wrapped whitespace
					wrappedWhitespace = '';
				} else {
					// Node or meta item
					if ( modelClass.prototype instanceof ve.dm.MetaItem ) {
						// No additional processing needed
						// Write to data and continue
						if ( childDataElements.length === 1 ) {
							childDataElements.push( { 'type': '/' + childDataElements[0].type } );
						}
						if ( context.inWrapper ) {
							wrappedMetaItems = wrappedMetaItems.concat( childDataElements );
							if ( wrappedWhitespace !== '' ) {
								data.splice( wrappedWhitespaceIndex, wrappedWhitespace.length );
								addWhitespace( childDataElements[0], 0, wrappedWhitespace );
								nextWhitespace = wrappedWhitespace;
								wrappedWhitespace = '';
							}
						} else {
							data = data.concat( childDataElements );
							processNextWhitespace( childDataElements[0] );
							prevElement = childDataElements[0];
						}
						break;
					}

					childIsContent = this.nodeFactory.isNodeContent( childDataElements[0].type );

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
							childDomElements = modelClass.static.enableAboutGrouping ?
								aboutGroup : [ childDomElement ];
							childDataElements = this.createDataElements( modelClass, childDomElements );
							childIsContent = this.nodeFactory.isNodeContent( childDataElements[0].type );
						}
					}

					// Annotate child
					if ( childIsContent && !context.annotations.isEmpty() ) {
						childDataElements[0].annotations = context.annotations.getIndexes().slice();
					}

					// Output child and process children if needed
					if (
						childDataElements.length === 1 &&
						childDomElements.length === 1 &&
						this.nodeFactory.canNodeHaveChildren( childDataElements[0].type ) &&
						!this.nodeFactory.doesNodeHandleOwnChildren( childDataElements[0].type )
					) {
						// Recursion
						// Opening and closing elements are added by the recursion too
						data = data.concat(
							this.getDataFromDomRecursion( childDomElement, childDataElements[0],
								new ve.dm.AnnotationSet( this.store )
							)
						);
					} else {
						if ( childDataElements.length === 1 ) {
							childDataElements.push( { 'type': '/' + childDataElements[0].type } );
						}
						// Write childDataElements directly
						data = data.concat( childDataElements );
					}
					processNextWhitespace( childDataElements[0] );
					prevElement = childDataElements[0];

					// In case we consumed multiple childDomElements, adjust i accordingly
					i += childDomElements.length - 1;
				}
				break;
			case Node.TEXT_NODE:
				text = childDomElement.data;
				if ( text === '' ) {
					// Empty text node?!?
					break;
				}
				if ( !context.originallyExpectingContent ) {
					// Strip and store outer whitespace
					if ( text.match( /^\s+$/ ) ) {
						// This text node is whitespace only
						if ( context.inWrapper ) {
							// We're already wrapping, so output this whitespace
							// and store it in wrappedWhitespace (see
							// comment about wrappedWhitespace below)
							wrappedWhitespace = text;
							wrappedWhitespaceIndex = data.length;
							data = data.concat(
								ve.dm.Converter.getDataContentFromText( wrappedWhitespace, context.annotations )
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
						// HACK: . doesn't match newlines in JS, so use
						// [\s\S] to match any character
						matches = text.match( /^(\s*)([\s\S]*?)(\s*)$/ );
						if ( !context.inWrapper ) {
							// Wrap the text in a paragraph and output it
							startWrapping();

							// Only store leading whitespace if we just
							// started wrapping
							if ( matches[1] !== '' ) {
								if ( !prevElement ) {
									if ( wrapperElement ) {
										// First child, store as inner
										// whitespace in the parent
										addWhitespace( wrapperElement, 1, matches[1] );
									}
									// Else, WTF?!? This is not supposed to
									// happen, but it's not worth
									// throwing an exception over.
								} else {
									addWhitespace( prevElement, 3, matches[1] );
								}
								addWhitespace( wrappingParagraph, 0, matches[1] );
							}
						} else {
							outputWrappedMetaItems( 'restore' );
							// We were already wrapping in a paragraph,
							// so the leading whitespace must be output
							data = data.concat(
								ve.dm.Converter.getDataContentFromText( matches[1], context.annotations )
							);
						}
						// Output the text sans whitespace
						data = data.concat(
							ve.dm.Converter.getDataContentFromText( matches[2], context.annotations )
						);

						// Don't store this in wrappingParagraph.internal.whitespace[3]
						// and nextWhitespace just yet. Instead, store it
						// in wrappedWhitespace. There might be more text
						// nodes after this one, so we output wrappedWhitespace
						// for now and undo that if it turns out this was
						// the last text node. We can't output it later
						// because we have to apply the correct annotations.
						wrappedWhitespace = matches[3];
						wrappedWhitespaceIndex = data.length;
						data = data.concat(
							ve.dm.Converter.getDataContentFromText( wrappedWhitespace, context.annotations )
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
					matches = text.match( /^\s+/ );
					if ( matches && matches[0] !== '' ) {
						addWhitespace( wrapperElement, 1, matches[0] );
						text = text.substring( matches[0].length );
					}
				}
				if (
					context.annotations.isEmpty() &&
					i === domElement.childNodes.length - 1 &&
					wrapperElement &&
					!this.nodeFactory.doesNodeHaveSignificantWhitespace( wrapperElement.type )
				) {
					// Strip trailing whitespace from the last child
					matches = text.match( /\s+$/ );
					if ( matches && matches[0] !== '' ) {
						addWhitespace( wrapperElement, 2, matches[0] );
						text = text.substring( 0,
							text.length - matches[0].length );
					}
				}

				// Annotate the text and output it
				data = data.concat(
					ve.dm.Converter.getDataContentFromText( text, context.annotations )
				);
				break;
			case Node.COMMENT_NODE:
				// TODO treat this as a node with nodeName #comment, removes code duplication
				childDataElements = [
					{
						'type': 'alienMeta',
						'attributes': {
							'style': 'comment',
							'text': childDomElement.data
						}
					},
					{ 'type': '/alienMeta' }
				];
				if ( context.inWrapper ) {
					wrappedMetaItems = wrappedMetaItems.concat( childDataElements );
					if ( wrappedWhitespace !== '' ) {
						data.splice( wrappedWhitespaceIndex, wrappedWhitespace.length );
						addWhitespace( childDataElements[0], 0, wrappedWhitespace );
						nextWhitespace = wrappedWhitespace;
						wrappedWhitespace = '';
					}
				} else {
					data = data.concat( childDataElements );
					processNextWhitespace( childDataElements[0] );
					prevElement = childDataElements[0];
				}
				break;
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
	childTypes = this.nodeFactory.getChildNodeTypes( context.branchType );
	if ( context.branchType !== 'paragraph' && wrapperElement && data[data.length - 1] === wrapperElement &&
		!context.inWrapper && !this.nodeFactory.canNodeContainContent( context.branchType ) &&
		!this.nodeFactory.isNodeContent( context.branchType ) &&
		( childTypes === null || ve.indexOf( 'paragraph', childTypes ) !== -1 )
	) {
		data.push( { 'type': 'paragraph', 'internal': { 'generated': 'empty' } } );
		data.push( { 'type': '/paragraph' } );
	}

	// Close element
	if ( wrapperElement ) {
		data.push( { 'type': '/' + wrapperElement.type } );
		// Add the whitespace after the last child to the parent as innerPost
		if ( nextWhitespace !== '' ) {
			addWhitespace( wrapperElement, 2, nextWhitespace );
			nextWhitespace = '';
		}
	}
	// Don't return an empty document
	if ( context.branchType === 'document' && data.length === 0 ) {
		return [
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			{ 'type': '/paragraph' }
		];
	}

	this.contextStack.pop();
	return data;
};

/**
 * Convert linear model data to an HTML DOM
 *
 * @method
 * @param {Array} documentData Linear model data
 * @param {ve.dm.IndexValueStore} store Index-value store
 * @param {ve.dm.InternalList} internalList Internal list
 * @returns {HTMLDocument} Document containing the resulting HTML
 */
ve.dm.Converter.prototype.getDomFromData = function ( documentData, store, internalList ) {
	var doc = ve.createDocumentFromHTML( '' );
	// Set up the converter state
	this.documentData = documentData;
	this.store = store;
	this.internalList = internalList;

	this.getDomSubtreeFromData( documentData, doc.body );

	// Clear the state
	this.documentData = null;
	this.store = null;
	this.internalList = null;

	return doc;
};

/**
 * Convert linear model data to an HTML DOM subtree and add it to a container element.
 *
 * @param {Array} data Linear model data
 * @param {HTMLElement} container DOM element to add the generated elements to. Should be empty.
 * @throws Unbalanced data: looking for closing /type
 */
ve.dm.Converter.prototype.getDomSubtreeFromData = function ( data, container ) {
	var text, i, j, annotations, annotationElement, dataElement, dataElementOrSlice,
		childDomElements, pre, ours, theirs, parentDomElement, lastChild,
		isContentNode, sibling, previousSiblings, doUnwrap, textNode,
		conv = this,
		doc = container.ownerDocument,
		domElement = container,
		annotationStack = new ve.dm.AnnotationSet( this.store );

	function openAnnotation( annotation ) {
		// Add text if needed
		if ( text.length > 0 ) {
			domElement.appendChild( doc.createTextNode( text ) );
			text = '';
		}
		// Create new node and descend into it
		annotationElement = conv.getDomElementsFromDataElement(
			annotation.getElement(), doc
		)[0];
		domElement.appendChild( annotationElement );
		domElement = annotationElement;
	}

	function closeAnnotation() {
		// Add text if needed
		if ( text.length > 0 ) {
			domElement.appendChild( doc.createTextNode( text ) );
			text = '';
		}
		// Traverse up
		domElement = domElement.parentNode;
	}

	function getDataElementOrSlice() {
		var dataSlice, j, depth, handlesOwn = false;
		try {
			handlesOwn = ve.dm.nodeFactory.doesNodeHandleOwnChildren( data[i].type );
		} catch ( e ) {}

		if ( handlesOwn ) {
			j = i + 1;
			depth = 1;
			while ( j < data.length && depth > 0 ) {
				if ( data[j].type ) {
					depth += data[j].type.charAt( 0 ) === '/' ? -1 : 1;
				}
				j++;
			}
			if ( j >= data.length ) {
				throw new Error( 'Unbalanced data: looking for closing /' +
					dataElement.type );
			}
			dataSlice = data.slice( i, j + 1 );
		} else {
			dataSlice = data[i];
		}
		return dataSlice;
	}

	for ( i = 0; i < data.length; i++ ) {
		if ( typeof data[i] === 'string' ) {
			// Text
			text = '';
			// Continue forward as far as the plain text goes
			while ( typeof data[i] === 'string' ) {
				text += data[i];
				i++;
			}
			// i points to the first non-text thing, go back one so we don't skip this later
			i--;
			// Add text
			domElement.appendChild( doc.createTextNode( text ) );
		} else if (
			ve.isArray( data[i] ) ||
			(
				data[i].annotations !== undefined && (
					this.metaItemFactory.lookup( data[i].type ) ||
					this.nodeFactory.isNodeContent( data[i].type )
				)
			)
		) {
			// Annotated text or annotated nodes
			text = '';
			while (
				ve.isArray( data[i] ) ||
				(
					data[i].annotations !== undefined &&
					this.nodeFactory.isNodeContent( data[i].type )
				)
			) {
				annotations = new ve.dm.AnnotationSet(
					this.store, data[i].annotations || data[i][1]
				);
				ve.dm.Converter.openAndCloseAnnotations( annotationStack, annotations,
					openAnnotation, closeAnnotation
				);

				if ( data[i].annotations === undefined ) {
					// Annotated text
					text += data[i][0];
				} else {
					// Annotated node
					// Add text if needed
					if ( text.length > 0 ) {
						domElement.appendChild( doc.createTextNode( text ) );
						text = '';
					}
					// Insert the elements
					dataElementOrSlice = getDataElementOrSlice();
					childDomElements = this.getDomElementsFromDataElement( dataElementOrSlice, doc );
					for ( j = 0; j < childDomElements.length; j++ ) {
						domElement.appendChild( childDomElements[j] );
					}
					if ( ve.isArray( dataElementOrSlice ) ) {
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
				domElement.appendChild( doc.createTextNode( text ) );
				text = '';
			}
			// Close any remaining annotation nodes
			for ( j = annotationStack.getLength() - 1; j >= 0; j-- ) {
				// Traverse up
				domElement = domElement.parentNode;
			}
			// Clear annotationStack
			annotationStack = new ve.dm.AnnotationSet( this.store );
		} else if ( data[i].type !== undefined ) {
			dataElement = data[i];
			// Element
			if ( dataElement.type.charAt( 0 ) === '/' ) {
				parentDomElement = domElement.parentNode;
				isContentNode = !this.metaItemFactory.lookup( data[i].type.substr( 1 ) ) &&
					this.nodeFactory.isNodeContent( data[i].type.substr( 1 ) );
				// Process whitespace
				// whitespace = [ outerPre, innerPre, innerPost, outerPost ]
				if (
					!isContentNode &&
					domElement.veInternal &&
					domElement.veInternal.whitespace
				) {
					// Process inner whitespace. innerPre is for sure legitimate
					// whitespace that should be inserted; if it was a duplicate
					// of our child's outerPre, we would have cleared it.
					pre = domElement.veInternal.whitespace[1];
					if ( pre ) {
						if (
							domElement.firstChild &&
							domElement.firstChild.nodeType === Node.TEXT_NODE
						) {
							// First child is a TextNode, prepend to it
							domElement.firstChild.insertData( 0, pre );
						} else {
							// Prepend a TextNode
							textNode = doc.createTextNode( pre );
							textNode.veIsWhitespace = true;
							domElement.insertBefore(
								textNode,
								domElement.firstChild
							);
						}
					}
					lastChild = domElement.veInternal.childDomElements ?
						domElement.veInternal
							.childDomElements[domElement.veInternal.childDomElements.length - 1]
							.lastChild :
						domElement.lastChild;
					ours = domElement.veInternal.whitespace[2];
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
							textNode = doc.createTextNode( ours );
							textNode.veIsWhitespace = true;
							domElement.appendChild(
								textNode
							);
						}
					}
					// Tell the parent about our outerPost
					parentDomElement.lastOuterPost = domElement.veInternal.whitespace[3] || '';
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
				doUnwrap = false;
				if ( domElement.veInternal ) {
					switch ( domElement.veInternal.generated ) {
						case 'empty':
							// 'empty' elements - first ensure they are actually empty
							if ( domElement.childNodes.length === 0 && (
									// then check that we are the last child
									// before unwrapping (and therefore destroying)
									i === data.length - 1 ||
									data[i + 1].type.charAt(0) === '/'
								)
							) {
								doUnwrap = true;
							}
							break;
						case 'wrapper':
							// 'wrapper' elements - ensure there is a block level
							// element between this element and the previous sibling
							// wrapper or parent node
							doUnwrap = true;
							previousSiblings = domElement.parentElement.childNodes;
							// Note: previousSiblings includes the current element
							// so we only go up to length - 2
							for ( j = previousSiblings.length - 2; j >= 0; j-- ) {
								sibling = previousSiblings[j];
								if ( sibling.nodeType === Node.TEXT_NODE && !sibling.veIsWhitespace ) {
									// we've found an unwrapped paragraph so don't unwrap
									doUnwrap = false;
									break;
								}
								if ( ve.isBlockElement( sibling ) ) {
									// there is a block element before the next unwrapped node
									// so it's safe to unwrap
									break;
								}
							}
							break;
					}
				}
				if ( doUnwrap ) {
					while ( domElement.firstChild ) {
						parentDomElement.insertBefore(
							domElement.firstChild,
							domElement
						);
					}
					parentDomElement.removeChild( domElement );
				}

				delete domElement.veInternal;
				delete domElement.lastOuterPost;
				// Ascend to parent node
				domElement = parentDomElement;
			} else {
				// Create node from data
				dataElementOrSlice = getDataElementOrSlice();
				childDomElements = this.getDomElementsFromDataElement( dataElementOrSlice, doc );
				if ( childDomElements ) {
					// Add clone of internal data; we use a clone rather than a reference because
					// we modify .veInternal.whitespace[1] in some cases
					childDomElements[0].veInternal = ve.extendObject(
						{ 'childDomElements': childDomElements },
						ve.copyObject( dataElement.internal || {} )
					);
					// Add elements
					for ( j = 0; j < childDomElements.length; j++ ) {
						domElement.appendChild( childDomElements[j] );
					}
					// Descend into the first child node
					parentDomElement = domElement;
					domElement = childDomElements[0];

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
						ours = domElement.veInternal.whitespace[0];
						theirs = undefined;
						if ( domElement.previousSibling ) {
							// Get previous sibling's outerPost
							theirs = parentDomElement.lastOuterPost;
						} else if ( parentDomElement === container ) {
							// outerPre of the very first node in the document, this one
							// has no duplicate
							theirs = ours;
						} else {
							// First child, get parent's innerPre
							if (
								parentDomElement.veInternal &&
								parentDomElement.veInternal.whitespace
							) {
								theirs = parentDomElement.veInternal.whitespace[1];
								// Clear after use so it's not used twice
								parentDomElement.veInternal.whitespace[1] = undefined;
							}
							// else theirs=undefined
						}
						if ( ours && ours === theirs ) {
							// Matches the duplicate, insert a TextNode
							textNode = doc.createTextNode( ours );
							textNode.veIsWhitespace = true;
							parentDomElement.insertBefore(
								textNode,
								domElement
							);
						}
					}
				}

				if ( ve.isArray( dataElementOrSlice ) ) {
					i += dataElementOrSlice.length - 2;
				}
			}
		}
	}
	// Process the outerPost whitespace of the very last node
	if ( container.lastOuterPost !== undefined ) {
		if ( container.lastChild && container.lastChild.nodeType === Node.TEXT_NODE ) {
			// Last child is a TextNode, append to it
			container.lastChild.appendData( container.lastOuterPost );
		} else {
			// Append a TextNode
			container.appendChild( doc.createTextNode( container.lastOuterPost ) );
		}
		delete container.lastOuterPost;
	}
};

/* Initialization */

ve.dm.converter = new ve.dm.Converter( ve.dm.modelRegistry, ve.dm.nodeFactory, ve.dm.annotationFactory, ve.dm.metaItemFactory );
