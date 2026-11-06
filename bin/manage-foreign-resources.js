#!/usr/bin/env node
/*!
 * Manage vendored libraries in lib/, as described by lib/foreign-resources.yaml.
 *
 * A Node port of MediaWiki core's ForeignResourceManager, using the same registry format.
 *
 * Usage: node bin/manage-foreign-resources.js <update|verify|make-sri> [<module>|all] [--verbose]
 */

/* eslint-disable security/detect-non-literal-fs-filename */

'use strict';

const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const crypto = require( 'crypto' );
const { execFileSync } = require( 'child_process' );
const fg = require( 'fast-glob' );
const yaml = require( 'js-yaml' );

const LIB_DIR = path.resolve( __dirname, '../lib' );
const REGISTRY_FILE = path.join( LIB_DIR, 'foreign-resources.yaml' );
const CACHE_DIR = path.join( process.env.XDG_CACHE_HOME || path.join( os.homedir(), '.cache' ), 'visualeditor-foreign-resources' );
const DEFAULT_ALGO = 'sha384';
const ACTIONS = [ 'update', 'verify', 'make-sri' ];
const TYPES = [ 'file', 'multi-file', 'tar', 'zip', 'doc-only' ];

const args = process.argv.slice( 2 ).filter( ( a ) => !a.startsWith( '--' ) );
const isVerbose = process.argv.includes( '--verbose' );
const action = args[ 0 ];
const moduleArg = args[ 1 ] || 'all';

let hasErrors = false;

function verbose( text ) {
	if ( isVerbose ) {
		process.stdout.write( text + '\n' );
	}
}

function error( text ) {
	hasErrors = true;
	process.stderr.write( 'Error: ' + text + '\n' );
}

function sha1( data ) {
	return crypto.createHash( 'sha1' ).update( data ).digest( 'hex' );
}

function makeIntegrity( algo, data ) {
	return algo + '-' + crypto.createHash( algo ).update( data ).digest( 'base64' );
}

function cacheKey( moduleName, src, integrity ) {
	const fnv = ( s ) => sha1( s ).slice( 0, 8 );
	return ( moduleName + '_' + fnv( integrity ) + '_' + fnv( src ) + '_' + path.basename( src ) )
		.replace( /[./+?=_-]+/g, '_' ).replace( /_+$/, '' );
}

async function fetchResource( src, integrity, moduleName ) {
	const cacheFile = integrity && path.join( CACHE_DIR, cacheKey( moduleName, src, integrity ) + '.data' );
	if ( cacheFile && fs.existsSync( cacheFile ) ) {
		verbose( `... using cached ${ src }` );
		return fs.readFileSync( cacheFile );
	}
	// eslint-disable-next-line n/no-unsupported-features/node-builtins
	const response = await fetch( src, {
		headers: { 'User-Agent': 'VisualEditor-manage-foreign-resources (https://www.mediawiki.org/wiki/VisualEditor)' }
	} );
	if ( response.status !== 200 ) {
		throw new Error( `Unexpected HTTP ${ response.status } response from ${ src }` );
	}
	const data = Buffer.from( await response.arrayBuffer() );
	const algo = integrity ? integrity.split( '-' )[ 0 ] : DEFAULT_ALGO;
	const actualIntegrity = makeIntegrity( algo, data );
	if ( integrity === actualIntegrity ) {
		verbose( `... passed integrity check for ${ src }` );
		fs.mkdirSync( CACHE_DIR, { recursive: true } );
		fs.writeFileSync( cacheFile, data );
	} else if ( action === 'make-sri' ) {
		process.stdout.write( `Integrity for ${ src }\n\tintegrity: ${ actualIntegrity }\n` );
	} else {
		throw new Error( `Integrity check failed for ${ src }\n\tExpected: ${ integrity || 'null' }\n\tActual: ${ actualIntegrity }` );
	}
	return data;
}

function listFiles( dir ) {
	if ( !fs.existsSync( dir ) ) {
		return [];
	}
	return fg.sync( '**', { cwd: dir, dot: true, onlyFiles: true } );
}

/**
 * Write (update) or compare (verify) a set of files against the module's directory.
 *
 * @param {string} moduleName
 * @param {string} destDir
 * @param {Map<string,Buffer|string>} files Destination path relative to destDir => contents, or source file path
 */
function writeOrVerify( moduleName, destDir, files ) {
	const read = ( contents ) => Buffer.isBuffer( contents ) ? contents : fs.readFileSync( contents );

	if ( action === 'update' ) {
		for ( const [ dest, contents ] of files ) {
			const to = path.join( destDir, dest );
			verbose( `... writing ${ path.relative( LIB_DIR, to ) }` );
			fs.mkdirSync( path.dirname( to ), { recursive: true } );
			fs.writeFileSync( to, read( contents ) );
		}
	} else if ( action === 'verify' ) {
		for ( const [ dest, contents ] of files ) {
			const local = path.join( destDir, dest );
			verbose( `... verifying ${ path.relative( LIB_DIR, local ) }` );
			if ( !fs.existsSync( local ) ) {
				error( `File '${ path.relative( LIB_DIR, local ) }' is missing.` );
			} else if ( sha1( fs.readFileSync( local ) ) !== sha1( read( contents ) ) ) {
				error( `File '${ path.relative( LIB_DIR, local ) }' is different.` );
			}
		}
		for ( const local of listFiles( destDir ) ) {
			if ( !files.has( local ) ) {
				error( `File '${ moduleName }/${ local }' is not from upstream.` );
			}
		}
	}
}

async function handleTypeFile( moduleName, destDir, info ) {
	if ( !info.src ) {
		throw new Error( `Module '${ moduleName }' must have a 'src' key.` );
	}
	const data = await fetchResource( info.src, info.integrity, moduleName );
	const dest = info.dest || path.basename( new URL( info.src ).pathname );
	writeOrVerify( moduleName, destDir, new Map( [ [ dest, data ] ] ) );
}

async function handleTypeMultiFile( moduleName, destDir, info ) {
	if ( !info.files ) {
		throw new Error( `Module '${ moduleName }' must have a 'files' key.` );
	}
	const files = new Map();
	for ( const [ dest, file ] of Object.entries( info.files ) ) {
		if ( !file.src ) {
			throw new Error( `Module '${ moduleName }' file '${ dest }' must have a 'src' key.` );
		}
		files.set( dest, await fetchResource( file.src, file.integrity, moduleName ) );
	}
	writeOrVerify( moduleName, destDir, files );
}

async function handleTypeArchive( moduleName, destDir, info, tmpParentDir ) {
	if ( !info.src ) {
		throw new Error( `Module '${ moduleName }' must have a 'src' key.` );
	}
	const data = await fetchResource( info.src, info.integrity, moduleName );
	const tmpFile = path.join( tmpParentDir, moduleName + '.' + info.type );
	const tmpDir = path.join( tmpParentDir, moduleName );
	fs.writeFileSync( tmpFile, data );
	fs.mkdirSync( tmpDir );
	if ( info.type === 'zip' ) {
		execFileSync( 'unzip', [ '-q', tmpFile, '-d', tmpDir ] );
	} else {
		execFileSync( 'tar', [ '-xf', tmpFile, '-C', tmpDir ] );
	}

	// Lay out files as they will appear in destDir
	let stagingDir = tmpDir;
	if ( info.dest ) {
		stagingDir = path.join( tmpParentDir, moduleName + '-staged' );
		for ( const [ fromSubPath, toSubPath ] of Object.entries( info.dest ) ) {
			const fromPaths = fg.sync( fromSubPath, { cwd: tmpDir, dot: true, onlyFiles: false } );
			if ( !fromPaths.length ) {
				throw new Error( `Path '${ fromSubPath }' of '${ moduleName }' not found.` );
			}
			for ( const fromPath of fromPaths ) {
				const to = path.join( stagingDir, toSubPath || '', path.basename( fromPath ) );
				fs.mkdirSync( path.dirname( to ), { recursive: true } );
				fs.renameSync( path.join( tmpDir, fromPath ), to );
			}
		}
	}
	if ( info.exclude ) {
		for ( const file of fg.sync( info.exclude, { cwd: stagingDir, dot: true } ) ) {
			fs.rmSync( path.join( stagingDir, file ) );
		}
	}
	const files = new Map( listFiles( stagingDir ).map( ( file ) => [ file, path.join( stagingDir, file ) ] ) );
	writeOrVerify( moduleName, destDir, files );
}

async function main() {
	if ( !ACTIONS.includes( action ) ) {
		process.stderr.write( `Usage: ${ path.basename( __filename ) } <${ ACTIONS.join( '|' ) }> [<module>|all] [--verbose]\n` );
		return false;
	}
	const registry = yaml.load( fs.readFileSync( REGISTRY_FILE, 'utf8' ) );
	let modules;
	if ( moduleArg === 'all' ) {
		modules = registry;
	} else if ( registry[ moduleArg ] ) {
		modules = { [ moduleArg ]: registry[ moduleArg ] };
	} else {
		process.stderr.write( `Unknown module name.\n\nMust be one of:\n${ Object.keys( registry ).join( ', ' ) }.\n` );
		return false;
	}

	const tmpParentDir = fs.mkdtempSync( path.join( os.tmpdir(), 've-foreign-' ) );
	try {
		for ( const [ moduleName, info ] of Object.entries( modules ) ) {
			process.stdout.write( `... ${ { update: 'updating', verify: 'verifying', 'make-sri': 'checking' }[ action ] } '${ moduleName }'\n` );

			// Validate before doing anything destructive
			if ( !TYPES.includes( info.type ) ) {
				throw new Error( `Module '${ moduleName }' must have a 'type' key, one of: ${ TYPES.join( ', ' ) }.` );
			}
			if ( typeof info.license !== 'string' ) {
				throw new Error( `Module '${ moduleName }' must have a 'license' key.` );
			}
			if ( info.type === 'doc-only' ) {
				process.stdout.write( `... ${ moduleName } is documentation-only, skipping integrity checks.\n` );
				continue;
			}

			const destDir = path.join( LIB_DIR, moduleName );
			if ( action === 'update' ) {
				verbose( `... emptying directory for ${ moduleName }` );
				fs.rmSync( destDir, { recursive: true, force: true } );
			}

			try {
				if ( info.type === 'file' ) {
					await handleTypeFile( moduleName, destDir, info );
				} else if ( info.type === 'multi-file' ) {
					await handleTypeMultiFile( moduleName, destDir, info );
				} else {
					await handleTypeArchive( moduleName, destDir, info, tmpParentDir );
				}
			} catch ( e ) {
				// Report every module's problems in one run
				if ( action !== 'verify' ) {
					throw e;
				}
				error( e.message );
			}
		}
	} finally {
		fs.rmSync( tmpParentDir, { recursive: true, force: true } );
	}
	return !hasErrors;
}

main().then(
	( ok ) => {
		process.exitCode = ok ? 0 : 1;
	},
	( e ) => {
		process.stderr.write( 'Error: ' + e.message + '\n' );
		process.exitCode = 1;
	}
);
