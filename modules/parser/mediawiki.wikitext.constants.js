/* -------------------------------------------------------------------
 * The WikitextConstant structure holds "global constants" that 
 * capture properties about wikitext markup.
 * 
 * Ex: Valid options for wikitext image markup
 *
 * This structure, over time, can come to serve as useful documentation
 * about Wikitext itself.  For now, this is barebones and sparse.
 * ------------------------------------------------------------------- */

var WikitextConstants = {
	// Valid image options:
	// * Prefix options are of the form "alt=foo"
	// * Simple options are of the form "center"
	//
	// See http://en.wikipedia.org/wiki/Wikipedia:Extended_image_syntax
	// for more information about how they are used.
	Image: {
		PrefixOptions: {
			'link'     : 'link',
			'alt'      : 'alt',
			'page'     : 'page',
			'thumbnail': 'thumbnail',
			'thumb'    : 'thumb',
			'upright'  : 'aspect'
		},
		SimpleOptions: {
			// halign
			'left'  : 'halign',
			'right' : 'halign',
			'center': 'halign',
			'float' : 'halign',
			'none'  : 'halign',

			// valign
			'baseline'   : 'valign',
			'sub'        : 'valign',
			'super'      : 'valign',
			'top'        : 'valign',
			'text-top'   : 'valign',
			'middle'     : 'valign',
			'bottom'     : 'valign',
			'text-bottom': 'valign',

			// format
			'border'   : 'format',
			'frameless': 'format',
			'frame'    : 'format',
			'thumbnail': 'format',
			'thumb'    : 'format'
		}
	}
};

if (typeof module == "object") {
	module.exports.WikitextConstants = WikitextConstants;
}
