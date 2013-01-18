/*!
 * VisualEditor DataModel TextStyleAnnotation class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel text style annotation.
 *
 * Should not be instantiated directly, only use this for subclassing.
 *
 * @class
 * @extends ve.dm.Annotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleAnnotation = function VeDmTextStyleAnnotation( element ) {
	ve.dm.Annotation.call( this, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.TextStyleAnnotation, ve.dm.Annotation );

/* Static Properties */

/**
 * @static
 * @property static.name
 * @inheritdoc
 */
ve.dm.TextStyleAnnotation.static.name = 'textStyle';

/**
 * @static
 * @property static.matchTagNames
 * @inheritdoc
 */
ve.dm.TextStyleAnnotation.static.matchTagNames = [];

/**
 * Convert to an object with HTML element information.
 *
 * @method
 * @returns {Object} HTML element information, including tag and attributes properties
 */
ve.dm.TextStyleAnnotation.prototype.toHTML = function () {
	var parentResult = ve.dm.Annotation.prototype.toHTML.call( this );
	parentResult.tag = parentResult.tag || this.constructor.static.matchTagNames[0];
	return parentResult;
};

/* Registration */

ve.dm.modelRegistry.register( 'textStyle', ve.dm.TextStyleAnnotation );

/* Concrete Subclasses */

/**
 * DataModel bold annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleBoldAnnotation = function VeDmTextStyleBoldAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleBoldAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleBoldAnnotation.static.name = 'textStyle/bold';
ve.dm.TextStyleBoldAnnotation.static.matchTagNames = ['b'];
ve.dm.modelRegistry.register( 'textStyle/bold', ve.dm.TextStyleBoldAnnotation );

/**
 * DataModel italic annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleItalicAnnotation = function VeDmTextStyleItalicAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleItalicAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleItalicAnnotation.static.name = 'textStyle/italic';
ve.dm.TextStyleItalicAnnotation.static.matchTagNames = ['i'];
ve.dm.modelRegistry.register( 'textStyle/italic', ve.dm.TextStyleItalicAnnotation );

/**
 * DataModel underline annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleUnderlineAnnotation = function VeDmTextStyleUnderlineAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleUnderlineAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleUnderlineAnnotation.static.name = 'textStyle/underline';
ve.dm.TextStyleUnderlineAnnotation.static.matchTagNames = ['u'];
ve.dm.modelRegistry.register( 'textStyle/underline', ve.dm.TextStyleUnderlineAnnotation );

/**
 * DataModel strike annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleStrikeAnnotation = function VeDmTextStyleStrikeAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleStrikeAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleStrikeAnnotation.static.name = 'textStyle/strike';
ve.dm.TextStyleStrikeAnnotation.static.matchTagNames = ['s'];
ve.dm.modelRegistry.register( 'textStyle/strike', ve.dm.TextStyleStrikeAnnotation );

/**
 * DataModel small annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleSmallAnnotation = function VeDmTextStyleSmallAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleSmallAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleSmallAnnotation.static.name = 'textStyle/small';
ve.dm.TextStyleSmallAnnotation.static.matchTagNames = ['small'];
ve.dm.modelRegistry.register( 'textStyle/small', ve.dm.TextStyleSmallAnnotation );

/**
 * DataModel big annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleBigAnnotation = function VeDmTextStyleBigAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleBigAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleBigAnnotation.static.name = 'textStyle/big';
ve.dm.TextStyleBigAnnotation.static.matchTagNames = ['big'];
ve.dm.modelRegistry.register( 'textStyle/big', ve.dm.TextStyleBigAnnotation );

/**
 * DataModel span annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleSpanAnnotation = function VeDmTextStyleSpanAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleSpanAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleSpanAnnotation.static.name = 'textStyle/span';
ve.dm.TextStyleSpanAnnotation.static.matchTagNames = ['span'];
ve.dm.modelRegistry.register( 'textStyle/span', ve.dm.TextStyleSpanAnnotation );

/**
 * DataModel strong annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleStrongAnnotation = function VeDmTextStyleStrongAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleStrongAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleStrongAnnotation.static.name = 'textStyle/strong';
ve.dm.TextStyleStrongAnnotation.static.matchTagNames = ['strong'];
ve.dm.modelRegistry.register( 'textStyle/strong', ve.dm.TextStyleStrongAnnotation );

/**
 * DataModel emphasis annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleEmphasizeAnnotation = function VeDmTextStyleEmphasizeAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleEmphasizeAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleEmphasizeAnnotation.static.name = 'textStyle/emphasize';
ve.dm.TextStyleEmphasizeAnnotation.static.matchTagNames = ['em'];
ve.dm.modelRegistry.register( 'textStyle/emphasize', ve.dm.TextStyleEmphasizeAnnotation );

/**
 * DataModel super script annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleSuperScriptAnnotation = function VeDmTextStyleSuperScriptAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleSuperScriptAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleSuperScriptAnnotation.static.name = 'textStyle/superScript';
ve.dm.TextStyleSuperScriptAnnotation.static.matchTagNames = ['sup'];
ve.dm.modelRegistry.register( 'textStyle/superScript', ve.dm.TextStyleSuperScriptAnnotation );

/**
 * DataModel sub script annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.TextStyleSubScriptAnnotation = function VeDmTextStyleSubScriptAnnotation( element ) {
	ve.dm.TextStyleAnnotation.call( this, element );
};
ve.inheritClass( ve.dm.TextStyleSubScriptAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleSubScriptAnnotation.static.name = 'textStyle/subScript';
ve.dm.TextStyleSubScriptAnnotation.static.matchTagNames = ['sub'];
ve.dm.modelRegistry.register( 'textStyle/subScript', ve.dm.TextStyleSubScriptAnnotation );
