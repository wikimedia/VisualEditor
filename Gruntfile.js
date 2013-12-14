/*!
 * Grunt file
 *
 * @package VisualEditor
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	var fs = require( 'fs' ),
		exec = require( 'child_process' ).exec,
		modules = grunt.file.readJSON( 'build/modules.json' );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-csslint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-jscs-checker' );
	grunt.loadTasks( 'build/tasks' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		buildloader: {
			demo: {
				src: 'demos/ve/index.php.template',
				dest: 'demos/ve/index.php',
				modules: modules,
				pathPrefix: '../../',
				indent: '\t\t'
			},
			test: {
				src: 'modules/ve/test/index.php.template',
				dest: 'modules/ve/test/index.php',
				modules: modules,
				pathPrefix: '../../../',
				indent: '\t\t'
			},
			iframe: {
				src: '.docs/eg-iframe.html.template',
				dest: '.docs/eg-iframe.html',
				modules: modules,
				pathPrefix: '../',
				indent: '\t'
			}
		},
		jshint: {
			options: JSON.parse( grunt.file.read( '.jshintrc' )
				.replace( /\/\*(?:(?!\*\/)[\s\S])*\*\//g, '' ).replace( /\/\/[^\n\r]*/g, '' ) ),
			all: ['*.js', 'modules/{syntaxhighlight,unicodejs,ve,ve-mw}/**/*.js']
		},
		jscs: {
			src: [
				'<%= jshint.all %>',
				'!modules/syntaxhighlight/**/*.js',
				'!modules/ve/test/ce/imetests/*.js'
			]
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			// TODO: modules/syntaxhighlight should be included, but is failing.
			all: ['demos/**/*.css', 'modules/{ve,ve-mw}/**/*.css'],
		},
		qunit: {
			ve: 'modules/ve/test/index-phantomjs-tmp.html'
		},
		watch: {
			files: ['<%= jshint.all %>', '<%= csslint.all %>', '<%= qunit.ve %>', '.{jshintrc,jshintignore,csslintrc}'],
			tasks: ['test']
		}
	} );

	grunt.registerTask( 'pre-qunit', function () {
		var done = this.async();
		grunt.file.setBase( __dirname + '/modules/ve/test' );
		exec( 'php index.php > index-phantomjs-tmp.html', function ( err, stdout, stderr ) {
			if ( err || stderr ) {
				grunt.log.error( err || stderr );
				done( false );
			} else {
				grunt.file.setBase( __dirname );
				done( true );
			}
		} );
	} );

	grunt.event.on( 'qunit.done', function () {
		fs.unlinkSync( __dirname + '/modules/ve/test/index-phantomjs-tmp.html' );
	} );

	grunt.registerTask( 'lint', ['jshint', 'jscs', 'csslint'] );
	grunt.registerTask( 'unit', ['pre-qunit', 'qunit'] );
	grunt.registerTask( 'test', ['lint', 'unit'] );
	grunt.registerTask( 'build', ['buildloader'] );
	grunt.registerTask( 'default', ['build', 'test'] );
};
