/*!
 * Grunt file
 *
 * @package VisualEditor
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-csslint' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-cssjanus' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-karma' );
	grunt.loadTasks( 'build/tasks' );

	// We want to use `grunt watch` to start this and karma watch together.
	grunt.renameTask( 'watch', 'runwatch' );

	var modules = grunt.file.readJSON( 'build/modules.json' ),
		moduleUtils = require( './build/moduleUtils' ),
		introBuildFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.buildfiles.intro' ] ),
		coreBuildFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.build' ] ),
		testFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.test' ] ).scripts;

	function demoMenu( callback ) {
		var pages = {},
			files = grunt.file.expand( 'demos/ve/pages/*.html' );
		files.forEach( function ( file ) {
			var matches = file.match( /^.*(pages\/(.+).html)$/ ),
				path = matches[1],
				name = matches[2];

			pages[name] = path;
		} );
		callback( JSON.stringify( pages, null, '\t' ).split( '\n' ).join( '\n\t\t' ) );
	}

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		clean: {
			dist: [ 'dist/*', 'test-coverage/*' ]
		},
		concat: {
			buildJs: {
				dest: 'dist/visualEditor.js',
				src: introBuildFiles.scripts
					.concat( coreBuildFiles.scripts )
			},
			buildCss: {
				dest: 'dist/visualEditor.css',
				src: introBuildFiles.styles
					.concat( coreBuildFiles.styles )
			}
		},
		cssjanus: {
			dist: {
				src: 'dist/visualEditor.css',
				dest: 'dist/visualEditor.rtl.css'
			}
		},
		copy: {
			images: {
				src: 'modules/ve/ui/styles/images/**/*.*',
				strip: 'modules/ve/ui/styles/',
				dest: 'dist/'
			},
			i18n: {
				src: 'modules/ve/i18n/*.json',
				strip: 'modules/ve/',
				dest: 'dist/'
			}
		},
		buildloader: {
			iframe: {
				targetFile: '.docs/eg-iframe.html',
				template: '.docs/eg-iframe.html.template',
				modules: modules,
				load: [ 'visualEditor.desktop.standalone' ],
				pathPrefix: '../',
				i18n: [ 'modules/ve/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t'
			},
			desktopDemo: {
				targetFile: 'demos/ve/desktop.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [ 'visualEditor.desktop.standalone.demo' ],
				env: {
					debug: true
				},
				pathPrefix: '../../',
				i18n: [ 'modules/ve/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				placeholders: { menu: demoMenu }
			},
			desktopDemoDist: {
				targetFile: 'demos/ve/desktop-dist.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [ 'visualEditor.desktop.standalone.demo.dist' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				placeholders: { menu: demoMenu }
			},
			mobileDemo: {
				targetFile: 'demos/ve/mobile.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [ 'visualEditor.mobile.standalone.demo' ],
				env: {
					debug: true
				},
				pathPrefix: '../../',
				i18n: [ 'modules/ve/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				placeholders: { menu: demoMenu }
			},
			mobileDemoDist: {
				targetFile: 'demos/ve/mobile-dist.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [ 'visualEditor.mobile.standalone.demo.dist' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				placeholders: { menu: demoMenu }
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'*.js',
				'{.docs,build,demos,modules}/**/*.js'
			]
		},
		jscs: {
			src: [
				'<%= jshint.all %>',
				'!modules/ve/tests/ce/imetests/*.js'
			]
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			all: '{.docs,build,demos,modules}/**/*.css'
		},
		banana: {
			all: 'modules/ve/i18n/'
		},
		karma: {
			options: {
				frameworks: [ 'qunit' ],
				reporters: [ 'dots' ],
				singleRun: true,
				autoWatch: false
			},
			// FIXME: OMG ARGH DIE DIE DIE PLEASE MOVE TO A DIFFERENT REPO
			unicodejs: {
				browsers: [ 'PhantomJS' ],
				options: {
					files: [
						'lib/jquery/jquery.js',
						'modules/unicodejs/unicodejs.js',
						'modules/unicodejs/unicodejs.textstring.js',
						'modules/unicodejs/unicodejs.graphemebreakproperties.js',
						'modules/unicodejs/unicodejs.graphemebreak.js',
						'modules/unicodejs/unicodejs.wordbreakproperties.js',
						'modules/unicodejs/unicodejs.wordbreak.js',
						'modules/unicodejs/tests/unicodejs.test.js',
						'modules/unicodejs/tests/unicodejs.graphemebreak.test.js',
						'modules/unicodejs/tests/unicodejs.wordbreak.test.js'
					]
				},
				preprocessors: {
					'modules/unicodejs/*.js': [ 'coverage' ]
				},
				reporters: [ 'dots', 'coverage' ],
				coverageReporter: { reporters: [
					{ type: 'html', dir: 'test-coverage/unicodejs' },
					{ type: 'text-summary', dir: 'test-coverage/unicodejs' }
				] }
			},
			visualeditor: {
				browsers: [ 'PhantomJS' ],
				options: {
					files: testFiles
				},
				preprocessors: {
					'modules/ve/**/*.js': [ 'coverage' ]
				},
				reporters: [ 'dots', 'coverage' ],
				coverageReporter: { reporters: [
					{ type: 'html', dir: 'test-coverage/visualeditor' },
					{ type: 'text-summary', dir: 'test-coverage/visualeditor' }
				] }
			},
			local: {
				options: {
					files: testFiles
				},
				browsers: [ 'Firefox', 'Chrome' ]
			},
			bg: {
				options: {
					files: testFiles
				},
				browsers: [ 'PhantomJS', 'Firefox', 'Chrome' ],
				singleRun: false,
				background: true
			}
		},
		runwatch: {
			files: [
				'.{csslintrc,jscsrc,jshintignore,jshintrc}',
				'<%= jshint.all %>',
				'<%= csslint.all %>'
			],
			tasks: [ 'test', 'karma:bg:run' ]
		}
	} );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs', 'csslint', 'banana' ] );
	grunt.registerTask( 'unit', [ 'karma:unicodejs', 'karma:visualeditor' ] );
	grunt.registerTask( 'build', [ 'clean', 'git-build', 'concat', 'cssjanus', 'copy', 'buildloader' ] );
	grunt.registerTask( 'test', [ 'build', 'lint', 'karma:unicodejs', 'karma:visualeditor' ] );
	grunt.registerTask( 'watch', [ 'karma:bg:start', 'runwatch' ] );
	grunt.registerTask( 'default', 'test' );
};
