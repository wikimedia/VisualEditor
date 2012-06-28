/* -------------------------------------------------------------------
 * The WikitextConstant structure holds "global constants" that 
 * capture properties about wikitext markup.
 * 
 * Ex: Valid options for wikitext image markup
 *
 * This structure, over time, can come to serve as useful documentation
 * about Wikitext itself.  For now, this is barebones and sparse.
 * ------------------------------------------------------------------- */

WikitextConstants = {
	Image: {
		SimpleOptions: {
			// halign
			'left': 'halign',
			'right': 'halign',
			'center': 'halign',
			'float': 'halign',
			'none': 'halign',
			// valign
			'baseline': 'valign',
			'sub': 'valign',
			'super': 'valign',
			'top': 'valign',
			'text-top': 'valign',
			'middle': 'valign',
			'bottom': 'valign',
			'text-bottom': 'valign',
			// format
			'border': 'format',
			'frameless': 'format',
			'frame': 'format',
			'thumbnail': 'format',
			'thumb': 'format'
		},
		PrefixOptions: {
			'link': 'link',
			'alt': 'alt',
			'page': 'page',
			'thumbnail': 'thumb',
			'thumb': 'thumb',
			'upright': 'aspect'
		}
	}
};

if (typeof module == "object") {
	module.exports.WikitextConstants = WikitextConstants;
}
