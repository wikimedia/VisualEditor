/*!
 * VisualEditor DataModel MWReferenceNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki reference node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWReferenceNode = function VeDmMWReferenceNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 0, element );

	// Event handlers
	this.connect( this, {
		'root': 'onRoot',
		'unroot': 'onUnroot'
	} );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWReferenceNode, ve.dm.LeafNode );

/* Static members */

ve.dm.MWReferenceNode.static.name = 'mwReference';

ve.dm.MWReferenceNode.static.matchTagNames = null;

ve.dm.MWReferenceNode.static.matchRdfaTypes = [ 'mw:Extension/ref' ];

ve.dm.MWReferenceNode.static.isContent = true;

ve.dm.MWReferenceNode.static.toDataElement = function ( domElements, converter ) {
	var dataElement,
		about = domElements[0].getAttribute( 'about' ),
		mwDataJSON = domElements[0].getAttribute( 'data-mw' ),
		mwData = mwDataJSON ? JSON.parse( mwDataJSON ) : {},
		body = mwData.body ? mwData.body.html : '',
		refGroup = mwData.attrs && mwData.attrs.group || '',
		listGroup = this.name + '/' + refGroup,
		listKey = mwData.attrs && mwData.attrs.name !== undefined ? mwData.attrs.name : null,
		queueResult = converter.internalList.queueItemHtml( listGroup, listKey, body ),
		listIndex = queueResult.index,
		contentsUsed = ( body !== '' && queueResult.isNew );

	dataElement = {
		'type': this.name,
		'attributes': {
			'mw': mwData,
			'about': about,
			'listIndex': listIndex,
			'listGroup': listGroup,
			'listKey': listKey,
			'refGroup': refGroup,
			'contentsUsed': contentsUsed
		}
	};
	return dataElement;
};

ve.dm.MWReferenceNode.static.toDomElements = function ( dataElement, doc, converter ) {
	var itemNodeHtml, mwAttr, i, iLen, keyedNodes, setContents,
		span = doc.createElement( 'span' ),
		itemNodeWrapper = doc.createElement( 'div' ),
		itemNode = converter.internalList.getItemNode( dataElement.attributes.listIndex ),
		itemNodeRange = itemNode.getRange();

	span.setAttribute( 'about', dataElement.attributes.about );
	span.setAttribute( 'typeof', 'mw:Extension/ref' );

	mwAttr = ve.copyObject( dataElement.attributes.mw ) || {};

	setContents = dataElement.attributes.contentsUsed ||
		dataElement.attributes.listKey === null;

	if ( !setContents ) {
		// Check if any other nodes with this key provided content. If not
		// then we attach the contents to the first reference with this key
		keyedNodes = converter.internalList
			.getNodeGroup( dataElement.attributes.listGroup )
				.keyedNodes[dataElement.attributes.listKey];
		// Check that this the first reference with its key
		if ( dataElement === keyedNodes[0].element ) {
			setContents = true;
			// Check no other reference originally defined the contents
			// As this is keyedNodes[0] we can start at 1
			for ( i = 1, iLen = keyedNodes.length; i < iLen; i++ ) {
				if ( keyedNodes[i].element.attributes.contentsUsed ) {
					setContents = false;
					break;
				}
			}
		}
	}

	if ( setContents ) {
		converter.getDomSubtreeFromData(
			itemNode.getDocument().getData().slice( itemNodeRange.start, itemNodeRange.end ),
			itemNodeWrapper
		),
		itemNodeHtml = $( itemNodeWrapper ).html();
		ve.setProp( mwAttr, 'body', 'html', itemNodeHtml );
	}

	// Set or clear key
	if ( dataElement.attributes.listKey !== null ) {
		ve.setProp( mwAttr, 'attrs', 'name', dataElement.attributes.listKey );
	} else if ( mwAttr.attrs ) {
		delete mwAttr.attrs.listKey;
	}
	// Set or clear group
	if ( dataElement.attributes.refGroup !== '' ) {
		ve.setProp( mwAttr, 'attrs', 'group', dataElement.attributes.refGroup );
	} else if ( mwAttr.attrs ) {
		delete mwAttr.attrs.refGroup;
	}

	span.setAttribute( 'data-mw', JSON.stringify( mwAttr ) );

	return [ span ];
};

ve.dm.MWReferenceNode.static.remapInternalListIndexes = function ( dataElement, mapping ) {
	dataElement.attributes.listIndex = mapping[dataElement.attributes.listIndex];
};

/* Methods */

/**
 * Gets the internal item node associated with this node
 * @method
 * @returns {ve.dm.InternalItemNode} Item node
 */
ve.dm.MWReferenceNode.prototype.getInternalItem = function () {
	return this.getDocument().getInternalList().getItemNode( this.getAttribute( 'listIndex' ) );
};

/**
 * Handle the node being attached to the root
 * @method
 */
ve.dm.MWReferenceNode.prototype.onRoot = function () {
	this.addToInternalList();
};

/**
 * Handle the node being detatched from the root
 * @method
 */
ve.dm.MWReferenceNode.prototype.onUnroot = function () {
	this.removeFromInternalList();
};

/**
 * Register the node with the internal list
 * @method
 */
ve.dm.MWReferenceNode.prototype.addToInternalList = function () {
	if ( this.getRoot() === this.getDocument().getDocumentNode() ) {
		this.getDocument().getInternalList().addNode(
			this.element.attributes.listGroup,
			this.element.attributes.listKey,
			this.element.attributes.listIndex,
			this
		);
	}
};

/**
 * Unregister the node from the internal list
 * @method
 */
ve.dm.MWReferenceNode.prototype.removeFromInternalList = function () {
	this.getDocument().getInternalList().removeNode(
		this.element.attributes.listGroup,
		this.element.attributes.listKey,
		this.element.attributes.listIndex,
		this
	);
};

ve.dm.MWReferenceNode.prototype.getClonedElement = function () {
	var clone = ve.dm.LeafNode.prototype.getClonedElement.call( this );
	delete clone.element.attributes.contentsUsed;
	return clone;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWReferenceNode );
