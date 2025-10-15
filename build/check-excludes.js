'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

const karmaConfigPath = path.join( __dirname, '../karma.conf.js' );
const coverageFile = path.join( __dirname, '../coverage/coverage-summary.json' );

if ( !fs.existsSync( coverageFile ) ) {
	throw new Error( `Coverage summary not found at ${ coverageFile }` );
}
const coverageData = JSON.parse( fs.readFileSync( coverageFile, 'utf8' ) );

const karmaConfig = require( karmaConfigPath );
let configObject = {};
karmaConfig( {
	set: ( cfg ) => {
		configObject = cfg;
	}
} );

const thresholdsGlobal = configObject.coverageReporter.check.global;
const excludes = configObject.coverageReporter.check.each.excludes || [];
const overrides = configObject.coverageReporter.check.each.overrides || {};

const minimatch = require( 'minimatch' );

const meetsThresholds = [];

excludes.forEach( ( file ) => {
	const absoluteFile = path.resolve( process.cwd(), file );
	const coverage = coverageData[ absoluteFile ];
	if ( !coverage ) {
		return;
	}

	// Find matching override pattern (last match wins)
	let thresholds = thresholdsGlobal;
	for ( const [ pattern, override ] of Object.entries( overrides ) ) {
		if ( minimatch( file, pattern ) ) {
			thresholds = override;
		}
	}

	if ( Object.entries( thresholds ).every( ( [ metric, min ] ) => coverage[ metric ].pct >= min ) ) {
		meetsThresholds.push( file );
	}
} );

if ( !meetsThresholds.length ) {
	console.log( 'No excluded files meet their thresholds.' );
} else {
	console.log( 'Excluded files which meet their thresholds:' );
	meetsThresholds.forEach( ( f ) => console.log( `- ${ f }` ) );
}
