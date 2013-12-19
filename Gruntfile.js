/*!
 * Grunt file
 *
 * @package VisualEditor
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	var modules = grunt.file.readJSON( 'build/modules.json' );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-csslint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-jscs-checker' );
	grunt.loadTasks( 'build/tasks' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		buildloader: {
			iframe: {
				src: '.docs/eg-iframe.html.template',
				dest: '.docs/eg-iframe.html',
				modules: modules,
				pathPrefix: '../',
				indent: '\t\t'
			},
			demo: {
				src: 'demos/ve/index.html.template',
				dest: 'demos/ve/index.html',
				modules: modules,
				pathPrefix: '../../',
				indent: '\t\t',
				placeholders: {
					menu: function ( callback ) {
						var html = [],
							files = grunt.file.expand( 'demos/ve/pages/*.html' );
						files.forEach( function ( file ) {
							file = file.replace( /^.*(pages\/.+.html)$/, '$1' );
							var name = file.slice( 6, -5 );
							html.push(
								'\t\t\t<li><a href="./#!/src/' + file + '" data-page-src="' + file +
									'">' + name + '</a></li>'
							);
						} );
						callback( html.join( '\n' ) );
					}
				}
			},
			test: {
				src: 'modules/ve/test/index.html.template',
				dest: 'modules/ve/test/index.html',
				modules: modules,
				pathPrefix: '../../../',
				indent: '\t\t'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'*.js',
				'{.docs,build,demos}/**/*.js',
				'modules/**/*.js'
			]
		},
		jscs: {
			src: [
				'<%= jshint.all %>',
				'!modules/ve/test/ce/imetests/*.js'
			]
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			all: [
				'demos/**/*.css',
				'modules/{ve,ve-mw}/**/*.css'
			],
		},
		qunit: {
			ve: 'modules/ve/test/index.html',
			unicodejs: 'modules/unicodejs/index.html'
		},
		watch: {
			files: [
				'.{jshintrc,jscs.json,jshintignore,csslintrc}',
				'<%= jshint.all %>',
				'<%= csslint.all %>',
				'<%= qunit.ve %>',
				'<%= qunit.unicodejs %>'
			],
			tasks: ['test']
		}
	} );

	grunt.registerTask( 'lint', ['jshint', 'jscs', 'csslint'] );
	grunt.registerTask( 'unit', ['qunit'] );
	grunt.registerTask( 'test', ['lint', 'unit'] );
	grunt.registerTask( 'build', ['buildloader'] );
	grunt.registerTask( 'default', ['build', 'test'] );
};
