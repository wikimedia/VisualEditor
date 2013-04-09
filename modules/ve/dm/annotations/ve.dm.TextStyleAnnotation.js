/*!
 * VisualEditor DataModel TextStyleAnnotation class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
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
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleAnnotation = function VeDmTextStyleAnnotation( linmodAnnotation ) {
	ve.dm.Annotation.call( this, linmodAnnotation );
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

ve.dm.TextStyleAnnotation.static.toDataElement = function ( domElements ) {
	var types = {
		'b': 'bold',
		'i': 'italic',
		'u': 'underline',
		's': 'strike',
		'small': 'small',
		'big': 'big',
		'span': 'span',
		'strong': 'strong',
		'em': 'emphasize',
		'sup': 'superScript',
		'sub': 'subScript'
	};
	return {
		'type': 'textStyle/' + types[domElements[0].nodeName.toLowerCase()]
	};
};

ve.dm.TextStyleAnnotation.static.toDomElements = function ( dataElement ) {
	var nodeNames = {
		'bold': 'b',
		'italic': 'i',
		'underline': 'u',
		'strike': 's',
		'small': 'small',
		'big': 'big',
		'span': 'span',
		'strong': 'strong',
		'emphasize': 'em',
		'superScript': 'sup',
		'subScript': 'sub'
	};
	return [ document.createElement( nodeNames[dataElement.type.substring( 10 )] ) ];
};


/* Registration */

ve.dm.modelRegistry.register( ve.dm.TextStyleAnnotation );

/* Concrete Subclasses */

/**
 * DataModel bold annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleBoldAnnotation = function VeDmTextStyleBoldAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleBoldAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleBoldAnnotation.static.name = 'textStyle/bold';
ve.dm.TextStyleBoldAnnotation.static.matchTagNames = ['b'];
ve.dm.modelRegistry.register( ve.dm.TextStyleBoldAnnotation );

/**
 * DataModel italic annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleItalicAnnotation = function VeDmTextStyleItalicAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleItalicAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleItalicAnnotation.static.name = 'textStyle/italic';
ve.dm.TextStyleItalicAnnotation.static.matchTagNames = ['i'];
ve.dm.modelRegistry.register( ve.dm.TextStyleItalicAnnotation );

/**
 * DataModel underline annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleUnderlineAnnotation = function VeDmTextStyleUnderlineAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleUnderlineAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleUnderlineAnnotation.static.name = 'textStyle/underline';
ve.dm.TextStyleUnderlineAnnotation.static.matchTagNames = ['u'];
ve.dm.modelRegistry.register( ve.dm.TextStyleUnderlineAnnotation );

/**
 * DataModel strike annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleStrikeAnnotation = function VeDmTextStyleStrikeAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleStrikeAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleStrikeAnnotation.static.name = 'textStyle/strike';
ve.dm.TextStyleStrikeAnnotation.static.matchTagNames = ['s'];
ve.dm.modelRegistry.register( ve.dm.TextStyleStrikeAnnotation );

/**
 * DataModel small annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleSmallAnnotation = function VeDmTextStyleSmallAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleSmallAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleSmallAnnotation.static.name = 'textStyle/small';
ve.dm.TextStyleSmallAnnotation.static.matchTagNames = ['small'];
ve.dm.modelRegistry.register( ve.dm.TextStyleSmallAnnotation );

/**
 * DataModel big annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleBigAnnotation = function VeDmTextStyleBigAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleBigAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleBigAnnotation.static.name = 'textStyle/big';
ve.dm.TextStyleBigAnnotation.static.matchTagNames = ['big'];
ve.dm.modelRegistry.register( ve.dm.TextStyleBigAnnotation );

/**
 * DataModel span annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleSpanAnnotation = function VeDmTextStyleSpanAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleSpanAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleSpanAnnotation.static.name = 'textStyle/span';
ve.dm.TextStyleSpanAnnotation.static.matchTagNames = ['span'];
ve.dm.modelRegistry.register( ve.dm.TextStyleSpanAnnotation );

/**
 * DataModel strong annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleStrongAnnotation = function VeDmTextStyleStrongAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleStrongAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleStrongAnnotation.static.name = 'textStyle/strong';
ve.dm.TextStyleStrongAnnotation.static.matchTagNames = ['strong'];
ve.dm.modelRegistry.register( ve.dm.TextStyleStrongAnnotation );

/**
 * DataModel emphasis annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleEmphasizeAnnotation = function VeDmTextStyleEmphasizeAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleEmphasizeAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleEmphasizeAnnotation.static.name = 'textStyle/emphasize';
ve.dm.TextStyleEmphasizeAnnotation.static.matchTagNames = ['em'];
ve.dm.modelRegistry.register( ve.dm.TextStyleEmphasizeAnnotation );

/**
 * DataModel super script annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleSuperScriptAnnotation = function VeDmTextStyleSuperScriptAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleSuperScriptAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleSuperScriptAnnotation.static.name = 'textStyle/superScript';
ve.dm.TextStyleSuperScriptAnnotation.static.matchTagNames = ['sup'];
ve.dm.modelRegistry.register( ve.dm.TextStyleSuperScriptAnnotation );

/**
 * DataModel sub script annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.TextStyleSubScriptAnnotation = function VeDmTextStyleSubScriptAnnotation( linmodAnnotation ) {
	ve.dm.TextStyleAnnotation.call( this, linmodAnnotation );
};
ve.inheritClass( ve.dm.TextStyleSubScriptAnnotation, ve.dm.TextStyleAnnotation );
ve.dm.TextStyleSubScriptAnnotation.static.name = 'textStyle/subScript';
ve.dm.TextStyleSubScriptAnnotation.static.matchTagNames = ['sub'];
ve.dm.modelRegistry.register( ve.dm.TextStyleSubScriptAnnotation );
