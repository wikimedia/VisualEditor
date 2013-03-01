/*!
 * VisualEditor ContentEditable MWPreformattedNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MW preformatted node.
 *
 * @class
 * @extends ve.ce.PreformattedNode
 * @constructor
 * @param {ve.dm.MWPreformattedNode} model Model to observe
 */
ve.ce.MWPreformattedNode = function VeCeMWPreformattedNode( model ) {
	// Parent constructor
	ve.ce.PreformattedNode.call( this, model );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWPreformattedNode, ve.ce.PreformattedNode );

/* Static Properties */

ve.ce.MWPreformattedNode.static.name = 'MWpreformatted';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWPreformattedNode );
