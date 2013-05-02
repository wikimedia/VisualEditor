/*!
 * VisualEditor DataModel MWTemplateNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki template node.
 *
 * @class
 * @abstract
 * @extends ve.dm.GeneratedContentNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWTemplateNode = function VeDmMWTemplateNode( length, element ) {
	// Parent constructor
	ve.dm.GeneratedContentNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWTemplateNode, ve.dm.GeneratedContentNode );

/* Static members */

ve.dm.MWTemplateNode.static.name = 'MWtemplate';

ve.dm.MWTemplateNode.static.matchTagNames = null;

ve.dm.MWTemplateNode.static.matchRdfaTypes = [ 'mw:Object/Template' ];

ve.dm.MWTemplateNode.static.getHashObject = function ( dataElement ) {
	return {
		type: dataElement.type,
		mw: dataElement.attributes.mw
	};
};

ve.dm.MWTemplateNode.static.toDataElement = function ( domElements, converter ) {
	var dataElement,
		mw = JSON.parse( domElements[0].getAttribute( 'data-mw' ) ),
		isInline = this.isHybridInline( domElements, converter ),
		type = isInline ? 'MWtemplateInline' : 'MWtemplateBlock';

	dataElement = {
		'type': type,
		'attributes': {
			'mw': mw,
			'mwOriginal': ve.copyObject( mw )
		}
	};
	this.storeDomElements( dataElement, domElements, converter.getStore() );
	return dataElement;
};

ve.dm.MWTemplateNode.static.toDomElements = function ( dataElement, doc, converter ) {
	var span, index;
	if ( ve.compareObjects( dataElement.attributes.mw, dataElement.attributes.mwOriginal ) ) {
		// If the template is unchanged just send back the original dom elements so selser can skip over it
		index = converter.getStore().indexOfHash( ve.getHash( this.getHashObject( dataElement ) ) );
		return converter.getStore().value( index );
	} else {
		span = doc.createElement( 'span' );
		// All we need to send back to Parsoid is the original template marker,
		// with a reconstructed data-mw property.
		span.setAttribute( 'typeof', 'mw:Object/Template' );
		span.setAttribute( 'data-mw', JSON.stringify( dataElement.attributes.mw ) );
		return [ span ];
	}
};

/* Concrete subclasses */

/**
 * DataModel MediaWiki template block node.
 *
 * @class
 * @extends ve.dm.MWTemplateNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWTemplateBlockNode = function VeDmMWTemplateBlockNode( length, element ) {
	// Parent constructor
	ve.dm.MWTemplateNode.call( this, length, element );
};

ve.inheritClass( ve.dm.MWTemplateBlockNode, ve.dm.MWTemplateNode );

ve.dm.MWTemplateBlockNode.static.matchTagNames = [];

ve.dm.MWTemplateBlockNode.static.name = 'MWtemplateBlock';

/**
 * DataModel MediaWiki template inline node.
 *
 * @class
 * @extends ve.dm.MWTemplateNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWTemplateInlineNode = function VeDmMWTemplateInlineNode( length, element ) {
	// Parent constructor
	ve.dm.MWTemplateNode.call( this, length, element );
};

ve.inheritClass( ve.dm.MWTemplateInlineNode, ve.dm.MWTemplateNode );

ve.dm.MWTemplateInlineNode.static.matchTagNames = [];

ve.dm.MWTemplateInlineNode.static.name = 'MWtemplateInline';

ve.dm.MWTemplateInlineNode.static.isContent = true;

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWTemplateNode );
ve.dm.modelRegistry.register( ve.dm.MWTemplateBlockNode );
ve.dm.modelRegistry.register( ve.dm.MWTemplateInlineNode );
