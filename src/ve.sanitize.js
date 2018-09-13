/*!
 * VisualEditor HTML sanitization utilities.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* global DOMPurify */

/**
 * Parse and sanitize an HTML string, making user HTML safe to load on the page
 *
 * @param {string} html HTML
 * @return {NodeList} Node list
 */
ve.sanitizeHtml = function ( html ) {
	// TODO: Move MW-specific rules to ve-mw
	var addTags = [ 'figure-inline' ],
		addAttrs = [
			'srcset',
			// RDFa
			'about', 'rel', 'resource', 'property', 'content', 'datatype', 'typeof'
		];
	return DOMPurify.sanitize( html, {
		ADD_TAGS: addTags,
		ADD_ATTR: addAttrs,
		ADD_URI_SAFE_ATTR: addAttrs,
		FORBID_TAGS: [ 'style' ],
		FORCE_BODY: true,
		RETURN_DOM_FRAGMENT: true
	} ).childNodes;
};
