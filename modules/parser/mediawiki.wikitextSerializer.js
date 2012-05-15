/**
 * Serializes a WikiDom plain object into a Wikitext string.
 * 
 * @class
 * @constructor
 * @param options {Object} List of options for serialization
 */
WikitextSerializer = function( options ) {
	this.options = $.extend( {
		// defaults
	}, options || {} );
};

/* Static Methods */

/**
 * Get a serialized version of data.
 * 
 * @static
 * @method
 * @param {Object} data Data to serialize
 * @param {Object} options Options to use, @see {WikitextSerializer} for details
 * @returns {String} Serialized version of data
 */
WikitextSerializer.stringify = function( data, options ) {
	return ( new WikitextSerializer( options ) ).convert( data );
};

WikitextSerializer.getHtmlAttributes = function( attributes ) {
	var htmlAttributes = {},
		count = 0;
	for ( var key in attributes ) {
		if ( key.indexOf( 'html/' ) === 0 ) {
			htmlAttributes[key.substr( 5 )] = attributes[key];
			count++;
		}
	}
	return count ? htmlAttributes : null;
};

WikitextSerializer.makeAttributeList = function( attributes, prespace ) {
	var attr = [];
	var name;
	if ( attributes ) {
		for ( name in attributes ) {
			attr.push( name + '="' + attributes[name] + '"' );
		}
	}
	return ( prespace && attr.length ? ' ' : '' ) + attr.join( ' ' );
};

/* Methods */

WikitextSerializer.prototype.convert = function( childNode, first ) {
	var lines = [];
	var childType = childNode.nodeName.toLowerCase();
	if ( childType in this ) {
		lines.push( this[childType].start.call( this, childNode ) );
		for ( var i in childNode.children ) {
			lines.push( this.convert( childNode.children[i], (i - 0) === 0 ) );
		}
		if ( 'end' in this[childType] ) {
			lines.push( this[childType].end.call( this, childNode ) );
		}
	}
	return lines.join( '\n' );
};

// Paragraphs are a special case, they are not a dictionary
WikitextSerializer.prototype.p = function( node ) {
	return this.content( node.content );
};

WikitextSerializer.prototype['#comment'] = {
	start: function( node ) {
		return '<!--' + node.text + '-->';
	}
};

WikitextSerializer.prototype.hr = {
	start: function( node ) {
		return '----';
	}
};

WikitextSerializer.prototype.heading = {
	start: function( node, level ) {
		var symbols = '';
		while (level > 0) {
			symbols += '=';
		}
		return symbols + this.content( node.content ) + symbols;
	}
};

for ( var j = 1; j < 6; j++ ) {
	WikitextSerializer.prototype['h'+j] = (function( level ) {
		return {
			start: function( node ) {
				return this.heading.start( node, level );
			}
		};
	})( j );
}

WikitextSerializer.prototype.pre = {
	start: function( node ) {
		return ' ' + this.content( node.content ).replace( '\n', '\n ' );
	}
};

WikitextSerializer.prototype.ul = {
	start: function( node, lead ) {
		return '<!-- list item -->';
	}
};

WikitextSerializer.prototype.ol = {
	start: function( node, lead ) {
		return '<!-- list item -->';
	}
};

WikitextSerializer.prototype.listItem = {
	start: function( node, lead ) {
		return '<!-- list item -->';
	}
};

WikitextSerializer.prototype.table = {
	start: function( node ) {
		var lines = [],
			attributes = WikitextSerializer.getHtmlAttributes( node.attributes );
		if ( attributes ) {
			attributes = this.makeAttributeList( attributes );
		}
		lines.push( '{|' + attributes );
		return lines.join( '\n' );
	},
	end: function( node ) {
		return [ '|}' ].join('\n';
	}
};

WikitextSerializer.prototype.tr = {
	start: function( node, first ) {
		var lines = [],
			attributes = WikitextSerializer.getHtmlAttributes( node.attributes );
		if ( attributes ) {
			attributes = this.makeAttributeList( attributes );
		}
		if ( !first || attributes ) {
			lines.push( '|-' + attributes );
		}
		return lines.join( '\n' );
	}
};

WikitextSerializer.prototype.tableCell = {
	start: function( node, first ) {
		var attributes = WikitextSerializer.getHtmlAttributes( node.attributes );
		if ( attributes ) {
			attributes = this.makeAttributeList( attributes ) + '|';
		}
		return attributes + this.content( node.content );
	}
};

WikitextSerializer.prototype.td = {
	start: function( node, first ) {
		return '|' + this.tableCell( node, first);
	}
};

WikitextSerializer.prototype.th = {
	start: function( node, first ) {
		return '!' + this.tableCell( node, first);
	}
};

WikitextSerializer.prototype.b = {
	start: function( node ) {
		return "'''" + this.content( node ) + "'''";
	}
};

WikitextSerializer.prototype.i = {
	start: function( node ) {
		return "'''" + this.content( node ) + "'''";
	}
};

// dunno what these are in HTML
WikitextSerializer.prototype.transclusion = {
	start: function( node ) {
		var title = [];
		if ( node.namespace === 'Main' ) {
			title.push( '' );
		} else if ( node.namespace !== 'Template' ) {
			title.push( node.namespace );
		}
		title.push( node.title );
		return '{{' + title.join( ':' ) + '}}';
	}
};

WikitextSerializer.prototype.parameter = {
	start: function( node ) {
		return '{{{' + node.name + '}}}';
	}
};

WikitextSerializer.prototype.content = function( node ) {
	return node.text;
};
