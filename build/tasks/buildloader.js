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
			text = grunt.file.read( __dirname + '/../../' + src );

		function scriptTag( file ) {
			return indent + '<script src="' + pathPrefix + file + '"></script>';
		}

		function styleTag( file ) {
			return indent + '<link rel=stylesheet href="' + pathPrefix + file + '">';
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

		text = text
			.replace( /^[^\S\n]*<!-- STYLES -->[^\S\n]*$/m, styles )
			.replace( /^[^\S\n]*<!-- SCRIPTS -->[^\S\n]*$/m, scripts );

		grunt.file.write( dest, text );
		grunt.log.ok( 'File "' + dest + '" written.' );
	} );

};
