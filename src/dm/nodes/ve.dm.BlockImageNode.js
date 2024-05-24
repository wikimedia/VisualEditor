/*!
 * VisualEditor DataModel BlockImageNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel block image node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @mixes ve.dm.ImageNode
 * @mixes ve.dm.AlignableNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 * @param {ve.dm.Node[]} [children]
 */
ve.dm.BlockImageNode = function VeDmBlockImageNode() {
	// Parent constructor
	ve.dm.BlockImageNode.super.apply( this, arguments );

	// Mixin constructors
	ve.dm.ImageNode.call( this );
	ve.dm.AlignableNode.call( this );

	// <figure>
	//   <img/>
	//   [<figcaption/>]
	// </figure>
};

/* Inheritance */

OO.inheritClass( ve.dm.BlockImageNode, ve.dm.BranchNode );

OO.mixinClass( ve.dm.BlockImageNode, ve.dm.ImageNode );

// Mixin Alignable's parent class
OO.mixinClass( ve.dm.BlockImageNode, ve.dm.ClassAttributeNode );

OO.mixinClass( ve.dm.BlockImageNode, ve.dm.AlignableNode );

/* Static Properties */

ve.dm.BlockImageNode.static.name = 'blockImage';

ve.dm.BlockImageNode.static.preserveHtmlAttributes = function ( attribute ) {
	const attributes = [ 'class', 'src', 'width', 'height' ];
	return attributes.indexOf( attribute ) === -1;
};

ve.dm.BlockImageNode.static.handlesOwnChildren = true;

ve.dm.BlockImageNode.static.childNodeTypes = [ 'imageCaption' ];

ve.dm.BlockImageNode.static.matchTagNames = [ 'figure' ];

ve.dm.BlockImageNode.static.matchFunction = function ( element ) {
	return element.children[ 0 ] && element.children[ 0 ].nodeName === 'IMG';
};

ve.dm.BlockImageNode.static.toDataElement = function ( domElements, converter ) {
	const figure = domElements[ 0 ];
	const classAttr = figure.getAttribute( 'class' );
	const img = figure.children[ 0 ];
	const width = img.getAttribute( 'width' );
	const height = img.getAttribute( 'height' );
	const caption = figure.children[ 1 ];

	const attributes = {
		src: img.getAttribute( 'src' ),
		width: width !== null && width !== '' ? +width : null,
		height: height !== null && height !== '' ? +height : null,
		alt: img.getAttribute( 'alt' )
	};

	this.setClassAttributes( attributes, classAttr );

	const dataElement = {
		type: this.name,
		attributes: attributes
	};

	if ( !caption ) {
		return [
			dataElement,
			{ type: 'imageCaption' },
			{ type: '/imageCaption' },
			{ type: '/' + this.name }
		];
	} else {
		return [ dataElement ].concat(
			converter.getDataFromDomClean( caption, { type: 'imageCaption' } ),
			{ type: '/' + this.name }
		);
	}
};

// TODO: Consider using jQuery instead of pure JS.
// TODO: At this moment node is not resizable but when it will be then adding defaultSize class
// should be more conditional.
ve.dm.BlockImageNode.static.toDomElements = function ( data, doc, converter ) {
	const dataElement = data[ 0 ],
		figure = doc.createElement( 'figure' ),
		img = doc.createElement( 'img' );

	ve.setDomAttributes( img, dataElement.attributes, [ 'alt', 'src', 'width', 'height' ] );

	figure.appendChild( img );

	const classAttr = this.getClassAttrFromAttributes( dataElement.attributes );
	if ( classAttr ) {
		// eslint-disable-next-line mediawiki/class-doc
		figure.className = classAttr;
	}

	const captionData = data.slice( 1, -1 );
	// If length of captionData is smaller or equal to 2 it means that there is no caption or that
	// it is empty - in both cases we are going to skip appending <figcaption>.
	if ( captionData.length > 2 ) {
		const wrapper = doc.createElement( 'div' );
		converter.getDomSubtreeFromData( captionData, wrapper );
		while ( wrapper.firstChild ) {
			figure.appendChild( wrapper.firstChild );
		}
	}

	return [ figure ];
};

/* Methods */

/**
 * Get the caption node of the image.
 *
 * @return {ve.dm.BlockImageCaptionNode|null} Caption node, if present
 */
ve.dm.BlockImageNode.prototype.getCaptionNode = function () {
	const node = this.children[ 0 ];
	return node instanceof ve.dm.BlockImageCaptionNode ? node : null;
};

/**
 * @inheritdoc
 */
ve.dm.BlockImageNode.prototype.suppressSlugType = function () {
	// TODO: Have alignment attribute changes trigger a parent branch node re-render
	return this.getAttribute( 'align' ) !== 'center' ? 'float' : null;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.BlockImageNode );
