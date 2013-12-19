/*!
 * Build a static loader file from a template
 */

/*jshint node:true */
module.exports = function ( grunt ) {

	grunt.registerMultiTask( 'buildloader', function () {
		var module,
			styles = '',
			scripts = '',
			dest = this.data.dest,
			src = this.data.src,
			pathPrefix = this.data.pathPrefix || '',
			indent = this.data.indent || '',
			modules = this.data.modules,
			placeholders = this.data.placeholders || {},
			text = grunt.file.read( __dirname + '/../../' + src ),
			done = this.async();

		function scriptTag( file ) {
			return indent + '<script src="' + pathPrefix + file + '"></script>';
		}

		function styleTag( file ) {
			return indent + '<link rel=stylesheet href="' + pathPrefix + file + '">';
		}

		function placeholder( input, id, replacement, callback ) {
			var output,
				rComment = new RegExp( '^[^\\S\\n]*<!-- ' + id + ' -->[^\\S\\n]*$', 'm' );
			if ( typeof replacement === 'function' ) {
				replacement( function ( response ) {
					output = input.replace( rComment, response );
					callback( output );
				} );
			} else {
				output = input.replace( rComment, replacement );
				callback( output );
			}
		}

		for ( module in modules ) {
			if ( modules[module].scripts ) {
				scripts += indent + '<!-- ' + module + ' -->\n';
				scripts += modules[module].scripts.map( scriptTag ).join( '\n' ) + '\n';
				scripts += '\n';
			}
			if ( modules[module].styles ) {
				styles += indent + '<!-- ' + module + ' -->\n';
				styles += modules[module].styles.map( styleTag ).join( '\n' ) + '\n';
				styles += '\n';
			}
		}

		scripts += indent + '<script>ve.init.platform.setModulesUrl( \'' + pathPrefix +
			'modules\' );</script>';

		// Strip last 2 line breaks since we only want them between sections
		styles = styles.slice( 0, -2 );

		placeholders.styles = styles;
		placeholders.scripts = scripts;

		grunt.util.async.forEachSeries(
			Object.keys(placeholders),
			function ( id, next ) {
				placeholder( text, id.toUpperCase(), placeholders[id], function ( newText ) {
					text = newText;
					next();
				} );
			},
			function () {
				grunt.file.write( dest, text );
				grunt.log.ok( 'File "' + dest + '" written.' );

				done();
			}
		);

	} );

};
