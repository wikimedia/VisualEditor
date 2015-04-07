/*!
 * Grunt file
 *
 * @package VisualEditor
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-csslint' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-css-url-embed' );
	grunt.loadNpmTasks( 'grunt-cssjanus' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-karma' );
	grunt.loadTasks( 'build/tasks' );

	// We want to use `grunt watch` to start this and karma watch together.
	grunt.renameTask( 'watch', 'runwatch' );

	var modules = grunt.file.readJSON( 'build/modules.json' ),
		moduleUtils = require( './build/moduleUtils' ),
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
			options: {
				banner: grunt.file.read( 'build/banner.txt' )
			},
			js: {
				dest: 'dist/visualEditor.js',
				src: coreBuildFiles.scripts
			},
			css: {
				dest: 'dist/visualEditor.css',
				src: coreBuildFiles.styles
			}
		},
		cssjanus: {
			dist: {
				dest: 'dist/visualEditor.rtl.css',
				src: 'dist/visualEditor.css'
			}
		},
		cssUrlEmbed: {
			options: {
				// TODO: A few image paths aren't relative to src/ui/styles
				failOnMissingUrl: false,
				baseDir: 'src/ui/styles'
			},
			dist: {
				files: {
					'dist/visualEditor.css': 'dist/visualEditor.css',
					'dist/visualEditor.rtl.css': 'dist/visualEditor.rtl.css'
				}
			}
		},
		copy: {
			i18n: {
				src: 'i18n/*.json',
				dest: 'dist/',
				expand: true
			}
		},
		buildloader: {
			iframe: {
				targetFile: '.jsduck/eg-iframe.html',
				template: '.jsduck/eg-iframe.html.template',
				modules: modules,
				load: [ 'visualEditor.desktop.standalone' ],
				pathPrefix: '../',
				i18n: [ 'i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t'
			},
			desktopDemo: {
				targetFile: 'demos/ve/desktop.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.standalone.read',
					'visualEditor.desktop.standalone.demo'
				],
				env: {
					debug: true
				},
				pathPrefix: '../../',
				i18n: [ 'i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				placeholders: { menu: demoMenu }
			},
			desktopDemoDist: {
				targetFile: 'demos/ve/desktop-dist.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.standalone.read',
					'visualEditor.desktop.standalone.demo.dist'
				],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				placeholders: { menu: demoMenu }
			},
			mobileDemo: {
				targetFile: 'demos/ve/mobile.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.standalone.read',
					'visualEditor.mobile.standalone.demo'
				],
				env: {
					debug: true
				},
				pathPrefix: '../../',
				i18n: [ 'i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				placeholders: { menu: demoMenu }
			},
			mobileDemoDist: {
				targetFile: 'demos/ve/mobile-dist.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.standalone.read',
					'visualEditor.mobile.standalone.demo.dist'
				],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				placeholders: { menu: demoMenu }
			},
			test: {
				targetFile: 'tests/index.html',
				template: 'tests/index.html.template',
				modules: modules,
				env: {
					test: true
				},
				load: [ 'visualEditor.test' ],
				pathPrefix: '../',
				indent: '\t\t'
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'*.js',
				'{.jsduck,build,demos,src,tests}/**/*.js'
			]
		},
		jscs: {
			src: [
				'<%= jshint.all %>',
				'!tests/ce/imetests/*.js'
			]
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			all: '{.jsduck,build,demos,src,tests}/**/*.css'
		},
		banana: {
			all: 'i18n/'
		},
		karma: {
			options: {
				files: testFiles,
				frameworks: [ 'qunit' ],
				reporters: [ 'dots' ],
				singleRun: true,
				browserDisconnectTimeout: 5000,
				browserDisconnectTolerance: 2,
				autoWatch: false
			},
			main: {
				browsers: [ 'Chrome' ],
				preprocessors: {
					'src/**/*.js': [ 'coverage' ]
				},
				reporters: [ 'dots', 'coverage' ],
				coverageReporter: { reporters: [
					{ type: 'html', dir: 'coverage/' },
					{ type: 'text-summary', dir: 'coverage/' }
				] }
			},
			others: {
				browsers: [ 'Firefox' ]
			},
			bg: {
				browsers: [ 'Chrome', 'Firefox' ],
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

	grunt.registerTask( 'git-status', function () {
		var done = this.async();
		// Are there unstaged changes?
		require( 'child_process' ).exec( 'git ls-files --modified', function ( err, stdout, stderr ) {
			var ret = err || stderr || stdout;
			if ( ret ) {
				grunt.log.write( ret );
				grunt.log.error( 'Unstaged changes.' );
				done( false );
			} else {
				grunt.log.ok( 'No unstaged changes.' );
				done();
			}
		} );
	} );

	grunt.registerTask( 'build', [ 'clean', 'concat', 'cssjanus', 'cssUrlEmbed', 'copy', 'buildloader' ] );
	grunt.registerTask( 'lint', [ 'jshint', 'jscs', 'csslint', 'banana' ] );
	grunt.registerTask( 'unit', [ 'karma:main' ] );
	grunt.registerTask( '_test', [ 'lint', 'git-build', 'build', 'unit' ] );
	grunt.registerTask( 'ci', [ '_test', 'git-status' ] );
	grunt.registerTask( 'watch', [ 'karma:bg:start', 'runwatch' ] );

	if ( process.env.JENKINS_HOME ) {
		grunt.registerTask( 'test', 'ci' );
	} else {
		grunt.registerTask( 'test', '_test' );
	}

	grunt.registerTask( 'default', 'test' );
};
