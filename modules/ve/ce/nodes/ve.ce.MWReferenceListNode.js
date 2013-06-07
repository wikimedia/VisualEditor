/*!
 * VisualEditor ContentEditable MWReferenceListNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki reference list node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @mixins ve.ce.ProtectedNode
 *
 * @constructor
 * @param {ve.dm.MWReferenceListNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWReferenceListNode = function VeCeMWReferenceListNode( model, config ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, config );

	// Mixin constructors
	ve.ce.ProtectedNode.call( this );

	// DOM Changes
	this.$.addClass( 've-ce-mwReferenceListNode', 'reference' )
		.attr( 'contenteditable', false );
	this.$reflist = $( '<ol class="references">' );
	this.$.append( this.$reflist );

	// Events
	this.model.getDocument().internalList.connect( this, { 'update': 'onInternalListUpdate' } );
	this.model.getDocument().internalList.getListNode().connect( this, { 'update': 'onListNodeUpdate' } );

	// Initialization
	this.update();
};

/* Inheritance */

ve.inheritClass( ve.ce.MWReferenceListNode, ve.ce.LeafNode );

ve.mixinClass( ve.ce.MWReferenceListNode, ve.ce.ProtectedNode );

/* Static Properties */

ve.ce.MWReferenceListNode.static.name = 'mwReferenceList';

ve.ce.MWReferenceListNode.static.tagName = 'div';

/* Methods */

/**
 * Handle the updating of the InternalList object.
 *
 * This will occur after a document transaction.
 *
 * @method
 * @param {string[]} groupsChanged A list of groups which have changed in this transaction
 */
ve.ce.MWReferenceListNode.prototype.onInternalListUpdate = function ( groupsChanged ) {
	// Only update if this group has been changed
	if ( ve.indexOf( this.model.getAttribute( 'listGroup' ), groupsChanged ) !== -1 ) {
		this.update();
	}
};

/**
 * Handle the updating of the InternalListNode.
 *
 * This will occur after changes to any InternalItemNode.
 *
 * @method
 */
ve.ce.MWReferenceListNode.prototype.onListNodeUpdate = function () {
	// When the list node updates we're not sure which list group the item
	// belonged to so we always update
	// TODO: Only re-render the reference which has been edited
	this.update();
};

/**
 * Update the reference list.
 */
ve.ce.MWReferenceListNode.prototype.update = function () {
	var i, j, iLen, jLen, key, keyNodes, $li, itemNode,
		internalList = this.model.getDocument().internalList,
		listGroup = this.model.getAttribute( 'listGroup' ),
		nodes = internalList.getNodeGroup( listGroup );

	// HACK: detach the children attached in the previous run
	while ( this.attachedItems && this.attachedItems.length > 0 ) {
		itemNode = this.attachedItems.pop();
		itemNode.setLive( false );
		itemNode.detach( this );
	}
	this.attachedItems = this.attachedItems || [];

	this.$reflist.empty();
	if ( nodes && nodes.keyOrder.length ) {
		for ( i = 0, iLen = nodes.keyOrder.length; i < iLen; i++ ) {
			key = nodes.keyOrder[i];
			keyNodes = nodes.keyNodes[key];

			$li = $( '<li>' );

			for ( j = 0, jLen = keyNodes.length; j < jLen; j++ ) {
				if ( keyNodes.length > 1 ) {
					$li.append(
						$( '<sup>' ).append(
							$( '<a>' ).text( ( i + 1 ) + '.' + j )
						)
					).append( ' ' );
				}
			}

			// Generate reference HTML from first item in key
			itemNode = new ve.ce.InternalItemNode(
				internalList.getItemNode( keyNodes[0].getAttribute( 'listIndex' ) )
			);
			// HACK: ProtectedNode crashes when dealing with an unattached node
			this.attachedItems.push( itemNode );
			itemNode.attach( this );
			$li.append( $( '<span class="reference-text">' ).html( itemNode.$.show() ) );
			this.$reflist.append( $li );
		}
	} // TODO: Show a placeholder for an empty reference list in the 'else' section
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWReferenceListNode );
