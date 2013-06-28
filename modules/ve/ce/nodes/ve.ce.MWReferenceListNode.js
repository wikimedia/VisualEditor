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
	ve.ce.FocusableNode.call( this );

	// DOM Changes
	this.$
		.addClass( 've-ce-mwReferenceListNode', 'reference' )
		.prop( 'contenteditable', false );
	this.$reflist = $( '<ol class="references"></ol>' );
	this.$refmsg = $( '<p>' )
		.addClass( 've-ce-mwReferenceListNode-muted' );

	// Events
	this.model.getDocument().internalList.connect( this, { 'update': 'onInternalListUpdate' } );
	this.model.getDocument().internalList.getListNode().connect( this, { 'update': 'onListNodeUpdate' } );

	// Initialization
	this.update();
};

/* Inheritance */

ve.inheritClass( ve.ce.MWReferenceListNode, ve.ce.LeafNode );

ve.mixinClass( ve.ce.MWReferenceListNode, ve.ce.ProtectedNode );

ve.mixinClass( ve.ce.MWReferenceListNode, ve.ce.FocusableNode );

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
 * Handle attribute change events.
 *
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.ce.MWReferenceListNode.prototype.onAttributeChange = function ( key ) {
	if ( key === 'listGroup' ) {
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
	var i, j, iLen, jLen, index, firstNode, key, keyedNodes, $li, itemNode,
		internalList = this.model.getDocument().internalList,
		refGroup = this.model.getAttribute( 'refGroup' ),
		listGroup = this.model.getAttribute( 'listGroup' ),
		nodes = internalList.getNodeGroup( listGroup );

	this.$reflist.detach().empty();
	this.$refmsg.detach();

	if ( !nodes || !nodes.indexOrder.length ) {
		this.$refmsg.text( ve.msg( 'visualeditor-referencelist-isempty', refGroup ) );
		this.$.append( this.$refmsg );
	} else {
		for ( i = 0, iLen = nodes.indexOrder.length; i < iLen; i++ ) {
			index = nodes.indexOrder[i];
			firstNode = nodes.firstNodes[index];

			$li = $( '<li>' );

			key = internalList.keys[index];
			keyedNodes = nodes.keyedNodes[key] || [];
			for ( j = 0, jLen = keyedNodes.length; j < jLen; j++ ) {
				if ( keyedNodes.length > 1 ) {
					$li.append(
						$( '<sup>' ).append(
							$( '<a>' ).text( ( i + 1 ) + '.' + j )
						)
					).append( ' ' );
				}
			}

			// Generate reference HTML from first item in key
			itemNode = new ve.ce.InternalItemNode(
				internalList.getItemNode( firstNode.getAttribute( 'listIndex' ) )
			);
			// HACK: PHP parser doesn't wrap single lines in a paragraph
			if ( itemNode.$.children().length === 1 && itemNode.$.children( 'p' ).length === 1 ) {
				// unwrap inner
				itemNode.$.children().replaceWith( itemNode.$.children().contents() );
			}
			$li.append(
				$( '<span>' )
					.addClass( 'reference-text' )
					.append( itemNode.$.clone().show() )
			);
			this.$reflist.append( $li );
		}
		this.$.append( this.$reflist );
	}
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWReferenceListNode );
