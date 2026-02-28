/*!
 * VisualEditor ContentEditable PasteSourceDetectorRegistry class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Paste source detector registry.
 *
 * Registers {@link ve.ce.PasteSourceDetector} objects.
 *
 * @class
 * @extends OO.Registry
 * @constructor
 */
ve.ce.PasteSourceDetectorRegistry = function VeCePasteSourceDetectorRegistry() {
	// Parent constructor
	ve.ce.PasteSourceDetectorRegistry.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ce.PasteSourceDetectorRegistry, OO.Registry );

/* Methods */

/**
 * Register a PasteSourceDetector.
 *
 * @param {ve.ce.PasteSourceDetector} detector Detector
 * @throws {Error} If detector is invalid
 */
ve.ce.PasteSourceDetectorRegistry.prototype.register = function ( detector ) {
	if ( !( detector instanceof ve.ce.PasteSourceDetector ) ) {
		throw new Error( 'detector must be an instance of ve.ce.PasteSourceDetector' );
	}

	// Parent method
	ve.ce.PasteSourceDetectorRegistry.super.prototype.register.call( this, detector.name, detector );
};

/**
 * Detect paste source from clipboard data.
 *
 * @param {DataTransfer} clipboardData Clipboard data
 * @return {ve.ce.PasteSourceDetector|null} Detector if matched
 */
ve.ce.PasteSourceDetectorRegistry.prototype.match = function ( clipboardData ) {
	for ( const name in this.registry ) {
		const detector = this.lookup( name );
		if ( detector.match( clipboardData ) ) {
			return detector;
		}
	}
	return null;
};

/* Initialization */

ve.ce.pasteSourceDetectors = new ve.ce.PasteSourceDetectorRegistry();

/**
 * Paste source detector.
 *
 * @class
 * @constructor
 * @param {string} name Detector name
 * @param {Function} match Match function, called with clipboardData
 * @param {string[]} categories Detector categories
 */
ve.ce.PasteSourceDetector = function VeCePasteSourceDetector( name, match, categories ) {
	this.name = name;
	this.match = match;
	this.categories = categories;
};

/* Inheritance */

OO.initClass( ve.ce.PasteSourceDetector );

/* Methods */

/**
 * Get data about this detector.
 *
 * `name` is the symbolic name of the detector.
 *
 * `categories` are an array of strings describing the type
 * of source, for example 'wordProcessor', 'ai', 'plain', 'internal'.
 *
 * @return {Object} Detector data
 */
ve.ce.PasteSourceDetector.prototype.getData = function () {
	return {
		name: this.name,
		categories: this.categories
	};
};

/* Registration */

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'googleDocs',
	( clipboardData ) => clipboardData.types.some( ( type ) => type.startsWith( 'application/x-vnd.google-docs' ) ) ||
		clipboardData.getData( 'text/html' ).match( /id=['"]?docs-internal-guid/i ),
	[ 'wordProcessor' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'libreOffice',
	( clipboardData ) => clipboardData.getData( 'text/html' ).match( /content=['"]?LibreOffice/i ),
	[ 'wordProcessor' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'microsoftOffice',
	( clipboardData ) => {
		const html = clipboardData.getData( 'text/html' );
		// Word365 (Desktop)
		return html.match( /content=Word.Document/i ) ||
			// Word365 (web)
			( html.match( /data-contrast=["']/i ) && html.includes( 'TextRun' ) );
	},
	[ 'wordProcessor' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'chatGPT',
	( clipboardData ) => {
		const html = clipboardData.getData( 'text/html' );
		// Generic HTML attributes
		return ( html.match( /data-start=["']/i ) && html.match( /data-end=["']/i ) ) ||
			// Query string added to links
			html.match( /utm_source=chatgpt\.com/i );
	},
	[ 'ai' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'gemini',
	( clipboardData ) => {
		const html = clipboardData.getData( 'text/html' );
		// Generic HTML attributes
		return html.match( /data-path-to-node=["']/i ) ||
			html.match( /<response-element/i ) ||
			// Attribute value added to links
			html.match( /BardVeMetadataKey/i );
	},
	[ 'ai' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'claude',
	( clipboardData ) => clipboardData.getData( 'text/html' ).match( /font-claude-/i ),
	[ 'ai' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'plainText',
	( clipboardData ) => clipboardData.types.length === 1 && clipboardData.types[ 0 ] === 'text/plain',
	[ 'plain' ]
) );
