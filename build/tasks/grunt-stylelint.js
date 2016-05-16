/*!
 * Run CSS files through stylelint and complain
 */

/*jshint node:true */
module.exports = function ( grunt ) {

	grunt.registerMultiTask( 'stylelint', function () {
		var options = this.options( {
				stylelintrc: '.stylelintrc'
			} ),
			done = this.async(),
			files = this.filesSrc,
			fileCount = files.length,
			styleLint = require( 'stylelint' );

		styleLint.lint( {
				configFile: options.stylelintrc,
				files: files,
				format: 'json'
			} )
			.then( function ( data ) {
				var i, j, warning;

				for ( i in data.results ) {
					if ( data.results.hasOwnProperty( i ) ) {
						if ( !data.results[ i ].errored ) {
							grunt.verbose.ok( 'File ' + data.results[ i ].source + ' passes' );
						} else {
							grunt.log.error( data.results[ i ].source + ' failed:' );
							for ( j in data.results[ i ].warnings ) {
								if ( data.results[ i ].warnings.hasOwnProperty( j ) ) {
									warning = data.results[ i ].warnings[ j ];
									grunt.log.error(
										'Line ' + warning.line + ', column ' + warning.column + ': ' +
										warning.text + ' (' + warning.severity + ')'
									);
								}
							}
							grunt.log.writeln();
						}
					}
				}

				if ( !data.errored ) {
					grunt.log.ok( 'Linted ' + fileCount + ' files OK' );
					done();
				} else {
					done( false );
				}
			}, function ( promiseFailure ) {
				grunt.fail.warn( 'Running stylelint failed: ', promiseFailure );

				done( false );
			} );
	} );

};
