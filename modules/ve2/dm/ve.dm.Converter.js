/**
 * Converter between HTML DOM and VisualEditor linear data.
 *
 * @class
 * @constructor
 * @param {Object} options Conversion options
 */
ve.dm.Converter = function( nodeFactory, annotationFactory ) {
	// Properties
	this.nodeFactory = nodeFactory;
	this.annotationFactory = annotationFactory;
	this.elements = { 'toHtml': {}, 'toData': {}, 'types': {} };
	this.annotations = { 'toHtml': {}, 'toData': {} };

	// Events
	this.nodeFactory.addListenerMethod( this, 'register', 'onNodeRegister' );
	this.annotationFactory.addListenerMethod( this, 'register', 'onAnnotationRegister' );
};

/* Methods */

/**
 * Responds to register events from the node factory.
 *
 * If a node is special; such as document, alienInline, alienBlock and text; it's converters data
 * should be set to null, as to distinguish it from a new node type that someone has simply
 * forgotten to implement converters for.
 *
 * @method
 * @param {String} type Node type
 * @param {Function} constructor Node constructor
 * @throws 'Missing conversion data in node implementation of {type}'
 */
ve.dm.Converter.prototype.onNodeRegister = function( type, constructor ) {
	if ( constructor.converters === undefined ) {
		throw 'Missing conversion data in node implementation of ' + type;
	} else if ( constructor.converters !== null ) {
		var tags = constructor.converters.tags,
			toHtml = constructor.converters.toHtml,
			toData = constructor.converters.toData;
		// Convert tags to an array if needed
		if ( !ve.isArray( tags ) ) {
			tags = [tags];
		}
		// Registration
		this.elements.toHtml[type] = toHtml;
		for ( var i = 0; i < tags.length; i++ ) {
			this.elements.toData[tags[i]] = toData;
			this.elements.types[tags[i]] = type;
		}
	}
};

/**
 * Responds to register events from the annotation factory.
 *
 * @method
 * @param {String} type Base annotation type
 * @param {Function} constructor Annotation constructor
 * @throws 'Missing conversion data in annotation implementation of {type}'
 */
ve.dm.Converter.prototype.onAnnotationRegister = function( type, constructor ) {
	if ( constructor.converters === undefined ) {
		throw 'Missing conversion data in annotation implementation of ' + type;
	} else if ( constructor.converters !== null ) {
		var tags = constructor.converters.tags,
			toHtml = constructor.converters.toHtml,
			toData = constructor.converters.toData;
		// Convert tags to an array if needed
		if ( !ve.isArray( tags ) ) {
			tags = [tags];
		}
		// Registration
		this.annotations.toHtml[type] = toHtml;
		for ( var i = 0; i < tags.length; i++ ) {
			this.annotations.toData[tags[i]] = toData;
		}
	}
};

/* Initialization */

ve.dm.converter = new ve.dm.Converter( ve.dm.nodeFactory, ve.dm.annotationFactory );
