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
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-jscs-checker' );
	grunt.loadTasks( 'build/tasks' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		buildloader: {
			iframe: {
				targetFile: '.docs/eg-iframe.html',
				template: '.docs/eg-iframe.html.template',
				modules: modules,
				load: [ 'visualEditor.desktop' ],
				pathPrefix: '../',
				indent: '\t\t'
			},
			demo: {
				targetFile: 'demos/ve/index.html',
				template: 'demos/ve/index.html.template',
				modules: modules,
				load: [ 'visualEditor.desktop' ],
				env: {
					debug: true
				},
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
				targetFile: 'modules/ve/test/index.html',
				template: 'modules/ve/test/index.html.template',
				modules: modules,
				load: [ 'visualEditor.standalone', 'visualEditor.core' ],
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
				'{.docs,build,demos,modules}/**/*.js'
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
				'{.docs,build,demos,modules}/**/*.css'
			],
		},
		banana: {
			all: 'modules/ve/i18n/'
		},
		qunit: {
			ve: 'modules/ve/test/index.html',
			unicodejs: 'modules/unicodejs/index.html'
		},
		watch: {
			files: [
				'.{csslintrc,jscsrc,jshintignore,jshintrc}',
				'<%= jshint.all %>',
				'<%= csslint.all %>',
				'<%= qunit.ve %>',
				'<%= qunit.unicodejs %>'
			],
			tasks: ['test']
		}
	} );

	grunt.registerTask( 'lint', ['jshint', 'jscs', 'csslint', 'banana'] );
	grunt.registerTask( 'unit', ['qunit'] );
	grunt.registerTask( 'build', ['buildloader'] );
	grunt.registerTask( 'test', ['build', 'lint', 'unit'] );
	grunt.registerTask( 'default', ['test'] );
};
