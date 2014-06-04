/*!
 * Build a distribution file
 *
 * Concatenates the list of input files, and performs
 * version/date placeholder replacements.
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	var moduleUtils = require( '../moduleUtils' );

	grunt.registerMultiTask( 'concat', function () {
		var variant,
			variantVersion,
			variantFileName,
			files,
			isBad = false,
			compiled = {},
			fileCache = {},
			version = grunt.config( 'pkg.version' ),
			fileName = this.data.dest,
			src = this.data.src,
			srcExpanded = moduleUtils.expandResources( src );

		function getFileHandleFile( variant ) {
			return function ( filepath ) {
				var text = fileCache[ filepath ] || (
					fileCache[ filepath ] = grunt.file.read( __dirname + '/../../' + filepath )
				);

				// Ensure files use only \n for line endings, not \r\n
				if ( /\x0d\x0a/.test( text ) ) {
					grunt.log.error( filepath + ': Incorrect line endings (\\r\\n)' );
					isBad = true;
				}

				compiled[ variant ] += text;
			};
		}

		for ( variant in srcExpanded ) {
			files = srcExpanded[ variant ];
			compiled[ variant ] = '';

			files.forEach( getFileHandleFile( variant ) );
		}

		if ( isBad ) {
			return false;
		}

		for ( variant in compiled ) {

			if ( variant === 'default' ) {
				variantVersion = version;
				variantFileName = fileName;
			} else {
				// Transform:
				// - "v1.0.0-pre (hash)" -> "v1.0.0-pre-variant (git)"
				// - "v1.0.0"            -> "v1.0.0-variant"
				variantVersion = version.replace(/(\s|$)/, '-' + variant + '$1');

				// Turn example.foo.css into example.foo.variant.css
				variantFileName = fileName.split('.');
				variantFileName.splice( -1, 0, variant );
				variantFileName = variantFileName.join('.');
			}

			// Replace version and date placeholders
			compiled[ variant ] = compiled[ variant ].replace( /@VERSION/g, variantVersion ).replace( /@DATE/g, new Date() );

			grunt.file.write( variantFileName, compiled[ variant ] );
			grunt.log.ok( 'File "' + variantFileName + '" created.' );
		}

		// Fail task if errors were logged.
		if ( this.errorCount ) {
			return false;
		}

	} );

};
