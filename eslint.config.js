'use strict';

const { defineConfig } = require( 'eslint/config' );
const globals = require( 'globals' );
const html = require( 'eslint-plugin-html' );
const wikimedia = require( 'eslint-config-wikimedia/flat' );
const local = {
	rules: {
		'no-unsanitized-href': require( './build/eslint/no-unsanitized-href' )
	}
};

// Rules shared across the whole project
const sharedRules = {
	'object-shorthand': [ 'error', 'properties' ]
};

// VisualEditor source code (was src/.eslintrc.json)
const srcConfig = {
	plugins: { local },
	extends: [ wikimedia( 'client', 'jquery', 'mediawiki' ) ],
	languageOptions: {
		globals: {
			ve: 'writable',
			VisualEditorSupportCheck: 'writable',
			OO: 'readonly',
			treeDiffer: 'readonly',
			unicodeJS: 'readonly',
			RangeFix: 'readonly',
			Papa: 'readonly'
		}
	},
	rules: {
		'local/no-unsanitized-href': 'error',
		'no-jquery/no-append-html': 'error',
		'no-jquery/no-done-fail': 'off',
		'no-jquery/no-extend': 'error',
		'no-jquery/no-html': [ 'error', { allowGetOrSet: 'get' } ],
		'no-jquery/no-visibility': 'error',
		'max-len': 'off',
		...sharedRules
	}
};

// Directories with their own config, which other configs don't apply to.
// These were directories with `"root": true` in .eslintrc.json.
const rootDirs = {
	src: [ 'src/**', 'build/eslint/tests/**' ],
	collab: [ 'collab/**' ],
	demos: [ 'demos/**' ],
	rebaser: [ 'rebaser/**' ],
	rebaserSrc: [ 'rebaser/src/**' ],
	tests: [ 'tests/**' ],
	tinyve: [ 'tinyve/**' ]
};

module.exports = defineConfig( [
	{
		// Gruntfile.js, build scripts, etc.
		ignores: Object.values( rootDirs ).flat(),
		extends: [ wikimedia( 'server' ) ],
		rules: {
			'max-len': 'off',
			...sharedRules
		}
	},
	{
		files: rootDirs.src,
		...srcConfig
	},
	{
		// Code which also runs in Node
		files: [ 'src/dm/**' ],
		languageOptions: {
			globals: {
				...Object.fromEntries( Object.keys( globals.browser ).map( ( name ) => [ name, 'off' ] ) ),
				...globals[ 'shared-node-browser' ],
				HTMLElement: 'readonly',
				HTMLDocument: 'readonly',
				Node: 'readonly',
				document: 'readonly',
				$: 'off'
			}
		},
		rules: {
			// We only need to sanitize rendered DOM nodes, e.g. CE/UI code
			'local/no-unsanitized-href': 'off'
		}
	},
	{
		files: [ 'src/init/sa/**' ],
		rules: {
			'mediawiki/no-storage': 'off'
		}
	},
	{
		files: rootDirs.collab,
		extends: [ wikimedia( 'client', 'jquery', 'jsdoc' ) ],
		languageOptions: {
			globals: {
				ve: 'writable',
				VisualEditorSupportCheck: 'writable',
				OO: 'readonly',
				unicodeJS: 'readonly',
				RangeFix: 'readonly',
				Papa: 'readonly'
			}
		},
		rules: {
			'no-jquery/no-append-html': 'error',
			'no-jquery/no-extend': 'error',
			'no-jquery/no-html': [ 'error', { allowGetOrSet: 'get' } ],
			'no-jquery/no-visibility': 'error',
			'max-len': 'off',
			...sharedRules
		}
	},
	{
		files: rootDirs.demos,
		extends: [ wikimedia( 'client', 'jquery', 'mediawiki' ) ],
		languageOptions: {
			globals: {
				ve: 'readonly',
				OO: 'readonly'
			}
		},
		rules: {
			'max-len': 'off',
			...sharedRules,
			'mediawiki/no-storage': 'off',
			'no-jquery/no-done-fail': 'off'
		}
	},
	{
		// Scripts in HTML demo pages
		files: [ 'demos/**/*.html' ],
		plugins: { html },
		settings: {
			'html/indent': '+tab',
			'html/report-bad-indent': 'error'
		}
	},
	{
		files: rootDirs.rebaser,
		ignores: rootDirs.rebaserSrc,
		extends: [ wikimedia( 'client', 'jquery' ) ],
		languageOptions: {
			globals: {
				ve: 'readonly',
				OO: 'readonly'
			}
		},
		rules: {
			'no-jquery/no-done-fail': 'off',
			...sharedRules
		}
	},
	{
		files: rootDirs.rebaserSrc,
		extends: [ wikimedia( 'server', 'jsdoc' ) ],
		languageOptions: {
			globals: {
				ve: 'writable',
				OO: 'readonly'
			}
		},
		rules: {
			'max-len': 'off',
			'es-x/no-hashbang': 'off',
			...sharedRules
		}
	},
	{
		files: rootDirs.tests,
		extends: [ wikimedia( 'client/common', 'language/es2018', 'jquery', 'mediawiki', 'jsdoc', 'qunit' ) ],
		languageOptions: {
			globals: {
				ve: 'readonly',
				OO: 'readonly'
			}
		},
		rules: {
			'max-len': 'off',
			'compat/compat': [ 'error', 'last 2 chrome versions, last 2 firefox versions' ],
			'es-x/no-promise-prototype-finally': 'off',
			'no-jquery/no-class-state': 'off',
			'no-jquery/no-done-fail': 'off',
			'no-jquery/no-parse-html-literal': 'off',
			...sharedRules
		}
	},
	{
		files: rootDirs.tinyve,
		extends: [ wikimedia( 'client', 'jquery', 'mediawiki' ) ],
		languageOptions: {
			globals: {
				tinyve: 'writable',
				OO: 'readonly'
			}
		},
		rules: {
			'no-jquery/no-append-html': 'error',
			'no-jquery/no-html': [ 'error', { allowGetOrSet: 'get' } ],
			'no-jquery/no-visibility': 'error',
			'max-len': 'off'
		}
	}
] );
