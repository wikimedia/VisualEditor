/*!
 * VisualEditor DataModel Converter class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel converter.
 *
 * Converts between HTML DOM and VisualEditor linear data.
 *
 * @class
 * @constructor
 * @param {ve.dm.ModelRegistry} modelRegistry
 * @param {ve.dm.NodeFactory} nodeFactory
 * @param {ve.dm.AnnotationFactory} annotationFactory
 */
ve.dm.Converter = function VeDmConverter( modelRegistry, nodeFactory, annotationFactory ) {
	this.domFromModelConverter = new ve.dm.DomFromModelConverter( modelRegistry, nodeFactory, annotationFactory );
	this.modelFromDomConverter = new ve.dm.ModelFromDomConverter( modelRegistry, nodeFactory, annotationFactory );
};

/* Inheritance */

OO.initClass( ve.dm.Converter );

// Proxy public APIs back to ve.dm.Converter

/* Static Properties */

/**
 * Pattern matching 'white space characters' as defined by the HTML spec only.
 *
 * All other whitespace should be treated as text, e.g. non-breaking spaces.
 *
 * See https://www.w3.org/TR/html4/struct/text.html#h-9.1
 *
 * @type {string}
 */
ve.dm.Converter.static.whitespaceList = ' \\t\\f\\u200b\\r\\n';

const whitespaceList = ve.dm.Converter.static.whitespaceList;
ve.dm.Converter.static.leadingWhitespaceRegex = new RegExp( '^[' + whitespaceList + ']' );
ve.dm.Converter.static.leadingWhitespacesRegex = new RegExp( '^[' + whitespaceList + ']+' );
ve.dm.Converter.static.trailingWhitespaceRegex = new RegExp( '[' + whitespaceList + ']$' );
ve.dm.Converter.static.trailingWhitespacesRegex = new RegExp( '[' + whitespaceList + ']+$' );
ve.dm.Converter.static.onlyWhitespaceRegex = new RegExp( '^[' + whitespaceList + ']+$' );
ve.dm.Converter.static.trimWhitespaceRegex = new RegExp( '^([' + whitespaceList + ']*)([\\s\\S]*?)([' + whitespaceList + ']*)$' );

ve.dm.Converter.static.computedAttributes = ve.dm.DomFromModelConverter.static.computedAttributes;

ve.dm.Converter.static.PARSER_MODE = ve.dm.DomFromModelConverter.static.PARSER_MODE;
ve.dm.Converter.static.CLIPBOARD_MODE = ve.dm.DomFromModelConverter.static.CLIPBOARD_MODE;
ve.dm.Converter.static.PREVIEW_MODE = ve.dm.DomFromModelConverter.static.PREVIEW_MODE;

/* Static methods */

ve.dm.Converter.static.openAndCloseAnnotations = ve.dm.DomFromModelConverter.static.openAndCloseAnnotations;

ve.dm.Converter.static.renderHtmlAttributeList = ve.dm.DomFromModelConverter.static.renderHtmlAttributeList;

/* Methods */

ve.dm.Converter.prototype.getDomFromModel = function () {
	return this.domFromModelConverter.getDomFromModel( ...arguments );
};

ve.dm.Converter.prototype.getDomFromNode = function () {
	return this.domFromModelConverter.getDomFromNode( ...arguments );
};

ve.dm.Converter.prototype.getDomSubtreeFromModel = function () {
	return this.domFromModelConverter.getDomSubtreeFromModel( ...arguments );
};

ve.dm.Converter.prototype.getDomSubtreeFromData = function () {
	return this.domFromModelConverter.getDomSubtreeFromData( ...arguments );
};

ve.dm.Converter.prototype.getModelFromDom = function () {
	return this.modelFromDomConverter.getModelFromDom( ...arguments );
};

ve.dm.Converter.prototype.getDataFromDomClean = function () {
	return this.modelFromDomConverter.getDataFromDomClean( ...arguments );
};

ve.dm.Converter.prototype.getDataFromDomSubtree = function () {
	return this.modelFromDomConverter.getDataFromDomSubtree( ...arguments );
};
/* Initialization */

ve.dm.converter = new ve.dm.Converter( ve.dm.modelRegistry, ve.dm.nodeFactory, ve.dm.annotationFactory );
