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
 * @param {Function} match Test function, called with clipboardData, expected to return a bool
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
		/id=['"]?docs-internal-guid/i.test( clipboardData.getData( 'text/html' ) ),
	[ 'wordProcessor' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'libreOffice',
	( clipboardData ) => /content=['"]?LibreOffice/i.test( clipboardData.getData( 'text/html' ) ),
	[ 'wordProcessor' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'microsoftOffice',
	( clipboardData ) => {
		const html = clipboardData.getData( 'text/html' );
		// Word365 (Desktop)
		return /content=Word.Document/i.test( html ) ||
			// Word365 (web)
			/data-contrast=["']/i.test( html ) && html.includes( 'TextRun' );
	},
	[ 'wordProcessor' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'chatGPT',
	( clipboardData ) => {
		const html = clipboardData.getData( 'text/html' );
		// Generic HTML attributes
		return ( /data-start=["']/i.test( html ) && /data-end=["']/i.test( html ) ) ||
			// Query string added to links
			/utm_source=chatgpt\.com/i.test( html );
	},
	[ 'ai' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'gemini',
	( clipboardData ) => {
		const html = clipboardData.getData( 'text/html' );
		// Generic HTML attributes
		return /data-path-to-node=["']/i.test( html ) ||
			/<response-element/i.test( html ) ||
			// Attribute value added to links
			/BardVeMetadataKey/i.test( html );
	},
	[ 'ai' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'claude',
	( clipboardData ) => /font-claude-/i.test( clipboardData.getData( 'text/html' ) ),
	[ 'ai' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'deepSeek',
	( clipboardData ) => /ds-markdown-paragraph/i.test( clipboardData.getData( 'text/html' ) ),
	[ 'ai' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'copilot',
	( clipboardData ) => /id=["']?[^-]+-content-[0-9]+/i.test( clipboardData.getData( 'text/html' ) ),
	[ 'ai' ]
) );

ve.ce.pasteSourceDetectors.register( new ve.ce.PasteSourceDetector(
	'plainText',
	( clipboardData ) => clipboardData.types.length === 1 && clipboardData.types[ 0 ] === 'text/plain',
	[ 'plain' ]
) );
