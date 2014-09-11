/*!
 * VisualEditor DataModel Focusable node.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * A mixin class for focusable nodes.
 *
 * @class
 * @abstract
 * @constructor
 */
ve.dm.FocusableNode = function VeDmFocusableNode() {};

/* Inheritance */

OO.initClass( ve.dm.FocusableNode );

/* Static Properties */

ve.dm.FocusableNode.static.isFocusable = true;
