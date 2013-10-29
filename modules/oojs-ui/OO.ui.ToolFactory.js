/*!
 * ObjectOriented UserInterface ToolFactory class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Factory for tools.
 *
 * @class
 * @extends OO.Factory
 * @constructor
 */
OO.ui.ToolFactory = function OoUiToolFactory() {
	// Parent constructor
	OO.Factory.call( this );
};

/* Inheritance */

OO.inheritClass( OO.ui.ToolFactory, OO.Factory );

/* Methods */

OO.ui.ToolFactory.prototype.getTools = function ( include, exclude, promote, demote ) {
	var i, len, included, promoted, demoted,
		auto = [],
		used = {};

	// Collect included and not excluded tools
	included = OO.simpleArrayDifference( this.extract( include ), this.extract( exclude ) );

	// Promotion
	promoted = this.extract( promote, used );
	demoted = this.extract( demote, used );

	// Auto
	for ( i = 0, len = included.length; i < len; i++ ) {
		if ( !used[included[i]] ) {
			auto.push( included[i] );
		}
	}

	return promoted.concat( auto ).concat( demoted );
};

/**
 * Get a flat list of names from a list of names or groups.
 *
 * Tools can be specified in the following ways:
 *  - A specific tool: `{ 'name': 'tool-name' }` or `'tool-name'`
 *  - All tools in a group: `{ 'group': 'group-name' }`
 *  - All tools: `'*'`
 *
 * @private
 * @param {Array|string} collection List of tools
 * @param {Object} [used] Object with names that should be skipped as properties; extracted
 *   names will be added as properties
 * @return {string[]} List of extracted names
 */
OO.ui.ToolFactory.prototype.extract = function ( collection, used ) {
	var i, len, item, name, tool,
		names = [];

	if ( collection === '*' ) {
		for ( name in this.registry ) {
			tool = this.registry[name];
			if (
				// Only add tools by group name when auto-add is enabled
				tool.static.autoAdd &&
				// Exclude already used tools
				( !used || !used[name] )
			) {
				names.push( name );
				if ( used ) {
					used[name] = true;
				}
			}
		}
	} else if ( Array.isArray( collection ) ) {
		for ( i = 0, len = collection.length; i < len; i++ ) {
			item = collection[i];
			// Allow plain strings as shorthand for named tools
			if ( typeof item === 'string' ) {
				item = { 'name': item };
			}
			if ( OO.isPlainObject( item ) ) {
				if ( item.group ) {
					for ( name in this.registry ) {
						tool = this.registry[name];
						if (
							// Include tools with matching group
							tool.static.group === item.group &&
							// Only add tools by group name when auto-add is enabled
							tool.static.autoAdd &&
							// Exclude already used tools
							( !used || !used[name] )
						) {
							names.push( name );
							if ( used ) {
								used[name] = true;
							}
						}
					}
				}
				// Include tools with matching name and exclude already used tools
				else if ( item.name && ( !used || !used[item.name] ) ) {
					names.push( item.name );
					if ( used ) {
						used[item.name] = true;
					}
				}
			}
		}
	}
	return names;
};
