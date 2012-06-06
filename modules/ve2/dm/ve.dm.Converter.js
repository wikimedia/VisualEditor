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

/**
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getHtmlElementFromDataElement = function( dataElement ) {
	var type = dataElement.type,
		htmlElement = this.elements.toHtml[type]( type, dataElement ),
		attributes = dataElement.attributes;
	// Add 'html/*' attributes directly sans 'html/', others get packaged in the 'data-mw' attribute
	if ( attributes ) {
		var dataMw = {},
			key,
			value;
		for ( key in dataElement.attributes ) {
			value = dataElement.attributes[key];
			if ( key.indexOf( 'html/' ) === 0 ) {
				htmlElement.setAttribute( key.substr( 5 ), value );
			} else if ( key.indexOf( 'mw/' ) === 0 ) {
				dataMw[key] = value;
			}
			// Other attributes should have already been handled by the node's toHtml converter
		}
		for ( key in dataMw ) {
			htmlElement.setAttribute( 'data-mw', JSON.stringify( dataMw ) );
			break;
		}
	}
	return htmlElement;
};

/**
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getHtmlContentFromDataContent = function( dataContent ) {
	//
};

/**
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getDataElementFromHtmlElement = function( htmlElement ) {
	var type = htmlElement.nodeName.toLowerCase(),
		dataElement = this.elements.toData[type]( type, htmlElement );
	// Add 'data-mw' attributes to the 'mw/' namespace, others get added under 'html/'
	for ( var i = 0; i < htmlElement.attributes.length; i++ ) {
		dataElement.attributes = {};
		var attribute = htmlElement.attributes[i];
		if ( attribute.name.toLowerCase() === 'data-mw' ) {
			var dataMw = JSON.parse( attribute.value );
			for ( var key in dataMw ) {
				dataElement.attributes['mw/' + key] = dataMw[key];
			}
		} else {
			dataElement.attributes['html/' + attribute.name] = attribute.value;
		}
	}
	return dataElement;
};

/**
 * ...
 *
 * @method
 */
ve.dm.Converter.prototype.getDataContentFromHtmlContent = function( htmlContent ) {
	//
};

/* Initialization */

ve.dm.converter = new ve.dm.Converter( ve.dm.nodeFactory, ve.dm.annotationFactory );
