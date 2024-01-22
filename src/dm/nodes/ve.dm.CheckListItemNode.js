/*!
 * VisualEditor DataModel CheckListItemNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel list item node.
 *
 * @class
 * @extends ve.dm.BranchNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 * @param {ve.dm.Node[]} [children]
 */
ve.dm.CheckListItemNode = function VeDmCheckListItemNode() {
	// Parent constructor
	ve.dm.CheckListItemNode.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.dm.CheckListItemNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.CheckListItemNode.static.name = 'checkListItem';

ve.dm.CheckListItemNode.static.parentNodeTypes = [ 'checkList' ];

ve.dm.CheckListItemNode.static.matchTagNames = [ 'li' ];

ve.dm.CheckListItemNode.static.matchRdfaTypes = [ 've:checkList' ];

ve.dm.CheckListItemNode.static.toDataElement = function ( domElements ) {
	var checked = domElements[ 0 ].hasAttribute( 'checked' );
	return { type: this.name, attributes: { checked: checked } };
};

ve.dm.CheckListItemNode.static.toDomElements = function ( dataElement, doc ) {
	var listItem = doc.createElement( 'li' );
	listItem.setAttribute( 'rel', 've:checkList' );
	if ( dataElement.attributes.checked ) {
		listItem.setAttribute( 'checked', 'checked' );
	}
	var checkbox = document.createElement( 'span' );
	checkbox.setAttribute( 'data-ve-ignore', 'true' );
	checkbox.appendChild( document.createTextNode( dataElement.attributes.checked ? '☑' : '☐' ) );
	listItem.appendChild( checkbox );

	return [ listItem ];
};

ve.dm.CheckListItemNode.static.cloneElement = function () {
	// Parent method
	var clone = ve.dm.CheckListItemNode.super.static.cloneElement.apply( this, arguments );
	// TODO: This clears the checkbox when cloning an element, so that when you extend a
	// list by pressing enter, the new item is clear. However this always means then copied
	// lists are always fully unchecked, which isn't intended.
	clone.attributes.checked = false;
	return clone;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.CheckListItemNode );
