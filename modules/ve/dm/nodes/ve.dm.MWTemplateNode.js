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

ve.dm.MWTemplateNode.static.name = 'mwTemplate';

ve.dm.MWTemplateNode.static.matchTagNames = null;

ve.dm.MWTemplateNode.static.matchRdfaTypes = [
	'mw:Object/Template',
	// We're interested in all nodes that have mw:Object/Template, even if they also have other mw:
	// types. So we match all mw: types, then use a matchFunction to assert that mw:Object/Template
	// is in there.
	/^mw:/
];

ve.dm.MWTemplateNode.static.matchFunction = function ( domElement ) {
	return ve.indexOf( 'mw:Object/Template',
		( domElement.getAttribute( 'typeof' ) || '' ).split( ' ' )
	) !== -1;
};

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
		type = isInline ? 'mwTemplateInline' : 'mwTemplateBlock';

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
		// The object in the store is also used for rendering so return a copy
		return ve.copyArray( converter.getStore().value( index ) );
	} else {
		span = doc.createElement( 'span' );
		// All we need to send back to Parsoid is the original template marker,
		// with a reconstructed data-mw property.
		span.setAttribute( 'typeof', 'mw:Object/Template' );
		span.setAttribute( 'data-mw', JSON.stringify( dataElement.attributes.mw ) );
		return [ span ];
	}
};

/**
 * Escape a template parameter. Helper function for getWikitext().
 * @param {string} param Parameter value
 * @returns {string} Escaped parameter value
 */
ve.dm.MWTemplateNode.static.escapeParameter = function ( param ) {
	var match, input = param, output = '', inNowiki = false;
	while ( input.length > 0 ) {
		match = input.match( /(?:\}\})+|\|+|<\/?nowiki>|<nowiki\s*\/>/ );
		if ( !match ) {
			output += input;
			break;
		}
		output += input.substr( 0, match.index );
		input = input.substr( match.index + match[0].length );
		if ( inNowiki ) {
			if ( match[0] === '</nowiki>' ) {
				inNowiki = false;
				output += match[0];
			} else {
				output += match[0];
			}
		} else {
			if ( match[0] === '<nowiki>' ) {
				inNowiki = true;
				output += match[0];
			} else if ( match[0] === '</nowiki>' || match[0].match( /<nowiki\s*\/>/ ) ) {
				output += match[0];
			} else {
				output += '<nowiki>' + match[0] + '</nowiki>';
			}
		}
	}
	return output;
};

/* Methods */

/**
 * Get the wikitext for this template invocation.
 * @returns {string} Wikitext like `{{foo|1=bar|baz=quux}}`
 */
ve.dm.MWTemplateNode.prototype.getWikitext = function () {
	var key, mw = this.element.attributes.mw,
		result = '{{' + mw.target.wt;
	for ( key in mw.params ) {
		result += '|' + key + '=' + this.constructor.static.escapeParameter( mw.params[key].wt );
	}
	result += '}}';
	return result;
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

ve.dm.MWTemplateBlockNode.static.name = 'mwTemplateBlock';

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

ve.dm.MWTemplateInlineNode.static.name = 'mwTemplateInline';

ve.dm.MWTemplateInlineNode.static.isContent = true;

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWTemplateNode );
ve.dm.modelRegistry.register( ve.dm.MWTemplateBlockNode );
ve.dm.modelRegistry.register( ve.dm.MWTemplateInlineNode );
