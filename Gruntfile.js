/*!
 * Grunt file
 *
 * @package VisualEditor
 */

/* eslint-env node, es6 */

module.exports = function ( grunt ) {
	var modules = grunt.file.readJSON( 'build/modules.json' ),
		moduleUtils = require( './build/moduleUtils' ),
		rebaserBuildFiles = moduleUtils.makeBuildList( modules, [ 'rebaser.build' ] ),
		veRebaseFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.rebase.build' ] ),
		coreBuildFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.build' ] ),
		coreBuildFilesApex = moduleUtils.makeBuildList( modules, [ 'visualEditor.build.apex' ] ),
		coreBuildFilesWikimediaUI = moduleUtils.makeBuildList( modules, [ 'visualEditor.build.wikimediaui' ] ),
		testFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.test' ] ).scripts,
		demoPages = ( function () {
			var pages = [],
				files = grunt.file.expand( 'demos/ve/pages/*.html' );
			pages = files.map( function ( file ) {
				return file.match( /^.*pages\/(.+).html$/ )[ 1 ];
			} );
			return pages;
		}() );

	grunt.loadNpmTasks( 'grunt-jsonlint' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-css-url-embed' );
	grunt.loadNpmTasks( 'grunt-cssjanus' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-karma' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.loadNpmTasks( 'grunt-svgmin' );
	grunt.loadNpmTasks( 'grunt-tyops' );
	grunt.loadTasks( 'build/tasks' );

	// We want to use `grunt watch` to start this and karma watch together.
	grunt.renameTask( 'watch', 'runwatch' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		clean: {
			dist: [ 'dist/*', 'coverage/*' ]
		},
		concat: {
			'rebaser.build': {
				options: {
					banner: grunt.file.read( 'build/rebaser-banner.txt' ),
					footer: grunt.file.read( 'build/rebaser-footer.txt' )
				},
				dest: 'dist/ve-rebaser.js',
				src: rebaserBuildFiles.scripts
			},
			'visualEditor.rebase.scripts': {
				options: {
					banner: grunt.file.read( 'build/banner.txt' )
				},
				dest: 'dist/visualEditor-rebase.js',
				src: veRebaseFiles.scripts
			},
			'visualEditor.rebase.styles': {
				options: {
					banner: grunt.file.read( 'build/banner.txt' )
				},
				dest: 'dist/visualEditor-rebase.css',
				src: veRebaseFiles.styles
			},
			js: {
				options: {
					banner: grunt.file.read( 'build/banner.txt' )
				},
				dest: 'dist/visualEditor.js',
				src: coreBuildFiles.scripts
			},
			'css-apex': {
				options: {
					banner: grunt.file.read( 'build/banner.txt' )
				},
				dest: 'dist/visualEditor-apex.css',
				src: coreBuildFilesApex.styles
			},
			'css-wikimediaui': {
				options: {
					banner: grunt.file.read( 'build/banner.txt' )
				},
				dest: 'dist/visualEditor-wikimediaui.css',
				src: coreBuildFilesWikimediaUI.styles
			},
			// HACK: Ideally these libraries would provide their own distribution files (T95667)
			'jquery.i18n': {
				dest: 'dist/lib/jquery.i18n.js',
				src: modules[ 'jquery.i18n' ].scripts
			},
			'jquery.uls.data': {
				dest: 'dist/lib/jquery.uls.data.js',
				src: modules[ 'jquery.uls.data' ].scripts
			}
		},
		cssjanus: {
			apex: {
				dest: 'dist/visualEditor-apex.rtl.css',
				src: 'dist/visualEditor-apex.css'
			},
			wikimediaui: {
				dest: 'dist/visualEditor-wikimediaui.rtl.css',
				src: 'dist/visualEditor-wikimediaui.css'
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
					'dist/visualEditor-apex.css': 'dist/visualEditor-apex.css',
					'dist/visualEditor-apex.rtl.css': 'dist/visualEditor-apex.rtl.css',
					'dist/visualEditor-wikimediaui.css': 'dist/visualEditor-wikimediaui.css',
					'dist/visualEditor-wikimediaui.rtl.css': 'dist/visualEditor-wikimediaui.rtl.css'
				}
			}
		},
		copy: {
			i18n: {
				src: 'i18n/*.json',
				dest: 'dist/',
				expand: true
			},
			lib: {
				src: [ 'lib/**', '!lib/jquery.i18n/**', '!lib/jquery.uls/**' ],
				dest: 'dist/',
				expand: true
			}
		},
		// SVG Optimization
		svgmin: {
			options: {
				js2svg: {
					indent: '\t',
					pretty: true
				},
				multipass: true,
				plugins: [ {
					cleanupIDs: false
				}, {
					removeDesc: false
				}, {
					removeRasterImages: true
				}, {
					removeTitle: false
				}, {
					removeViewBox: false
				}, {
					removeXMLProcInst: false
				}, {
					sortAttrs: true
				} ]
			},
			all: {
				files: [ {
					expand: true,
					cwd: 'src/ui',
					src: [
						'**/*.svg'
					],
					dest: 'src/ui/',
					ext: '.svg'
				} ]
			}
		},
		buildloader: {
			iframe: {
				targetFile: '.jsduck/eg-iframe.html',
				template: '.jsduck/eg-iframe.html.template',
				modules: modules,
				load: [
					'visualEditor.standalone.apex.dist',
					'visualEditor.standalone.read'
				],
				pathPrefix: '../',
				i18n: [ 'i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				dir: 'ltr'
			},
			desktopDemoApex: {
				targetFile: 'demos/ve/desktop.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.desktop.standalone.apex',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.desktop.standalone.apex.demo' ],
				env: {
					debug: true
				},
				pathPrefix: '../../',
				i18n: [ 'i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				demoPages: demoPages
			},
			desktopDemoApexDist: {
				targetFile: 'demos/ve/desktop-dist.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.desktop.standalone.apex.dist',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.desktop.standalone.apex.demo' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				demoPages: demoPages
			},
			desktopDemoWikimediaUI: {
				targetFile: 'demos/ve/desktop-wikimediaui.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.desktop.standalone.wikimediaui',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.desktop.standalone.wikimediaui.demo' ],
				env: {
					debug: true
				},
				pathPrefix: '../../',
				i18n: [ 'i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				demoPages: demoPages
			},
			desktopDemoWikimediaUIDist: {
				targetFile: 'demos/ve/desktop-wikimediaui-dist.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.desktop.standalone.wikimediaui.dist',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.desktop.standalone.wikimediaui.demo' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				demoPages: demoPages
			},
			mobileDemo: {
				targetFile: 'demos/ve/mobile.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.mobile.standalone',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.mobile.standalone.demo' ],
				env: {
					debug: true
				},
				pathPrefix: '../../',
				i18n: [ 'i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				demoPages: demoPages
			},
			mobileDemoDist: {
				targetFile: 'demos/ve/mobile-dist.html',
				template: 'demos/ve/demo.html.template',
				modules: modules,
				load: [
					'visualEditor.mobile.standalone.dist',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.mobile.standalone.demo' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				demoPages: demoPages
			},
			minimalDemo: {
				targetFile: 'demos/ve/minimal.html',
				template: 'demos/ve/minimal.html.template',
				modules: modules,
				load: [
					'visualEditor.standalone.apex.dist',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.minimal.standalone.demo' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				dir: 'ltr',
				langList: false
			},
			minimalDemoRtl: {
				targetFile: 'demos/ve/minimal-rtl.html',
				template: 'demos/ve/minimal.html.template',
				modules: modules,
				load: [
					'visualEditor.standalone.apex.dist',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.minimal.standalone.demo' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				dir: 'rtl',
				langList: false
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
		tyops: {
			options: {
				typos: 'build/typos.json'
			},
			src: [
				'**/*.{js,json,less,css,txt}',
				'!package-lock.json',
				'!build/typos.json',
				'!lib/**',
				'!i18n/**',
				'!{coverage,dist,docs,node_modules,rebaser/node_modules}/**',
				'!.git/**'
			]
		},
		eslint: {
			options: {
				reportUnusedDisableDirectives: true
			},
			main: [
				'*.{js,html}',
				'{bin,build,demos,src,tests,rebaser}/**/*.{js,html}',
				'!rebaser/node_modules/**'
			]
		},
		stylelint: {
			all: [
				'**/*.css',
				'!coverage/**',
				'!dist/**',
				'!docs/**',
				'!lib/**',
				'!node_modules/**'
			]
		},
		jsonlint: {
			all: [
				'.eslintrc.json',
				'**/*.json',
				'!dist/**',
				'!docs/**',
				'!lib/**',
				'!node_modules/**'
			]
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
				browserNoActivityTimeout: 30000,
				customLaunchers: {
					ChromeCustom: {
						base: 'ChromeHeadless',
						// Chrome requires --no-sandbox in Docker/CI.
						flags: ( process.env.CHROMIUM_FLAGS || '' ).split( ' ' )
					}
				},
				autoWatch: false
			},
			main: {
				browsers: [ 'ChromeCustom' ], // T200347: Temporarily disabled `, 'Firefox'*/ ],`
				preprocessors: {
					'rebaser/src/**/*.js': [ 'coverage' ],
					'src/**/*.js': [ 'coverage' ]
				},
				reporters: [ 'mocha', 'coverage' ],
				coverageReporter: {
					dir: 'coverage/',
					subdir: '.',
					reporters: [
						{ type: 'clover' },
						{ type: 'html' },
						{ type: 'text-summary' }
					],
					// https://github.com/karma-runner/karma-coverage/blob/v1.1.2/docs/configuration.md#check
					check: {
						global: {
							functions: 60,
							branches: 60,
							statements: 60,
							lines: 60
						},
						each: {
							functions: 20,
							branches: 20,
							statements: 20,
							lines: 20,
							excludes: [
								'rebaser/src/dm/ve.dm.DocumentStore.js',
								'rebaser/src/dm/ve.dm.ProtocolServer.js',
								'rebaser/src/dm/ve.dm.RebaseDocState.js',
								'rebaser/src/dm/ve.dm.TransportServer.js',
								'src/ve.track.js',
								'src/init/**/*.js',
								'src/ce/**/*.js',
								'src/ui/**/*.js',
								'src/dm/ve.dm.SurfaceSynchronizer.js',
								'src/dm/ve.dm.TableSlice.js',
								'src/dm/annotations/ve.dm.BidiAnnotation.js',
								'src/dm/metaitems/ve.dm.CommentMetaItem.js',
								'src/dm/nodes/ve.dm.GeneratedContentNode.js'
							]
						}
					}
				}
			},
			bg: {
				browsers: [ 'Chrome', 'Firefox' ],
				singleRun: false,
				background: true
			}
		},
		runwatch: {
			files: [
				'.{stylelintrc,eslintrc}.json',
				'**/*.js',
				'!coverage/**',
				'!dist/**',
				'!docs/**',
				'!node_modules/**',
				'<%= stylelint.all %>'
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
				grunt.log.error( 'Unstaged changes in these files:' );
				grunt.log.error( ret );
				// Show a condensed diff
				require( 'child_process' ).exec( 'git diff -U1 | tail -n +3', function ( err, stdout, stderr ) {
					grunt.log.write( err || stderr || stdout );
					done( false );
				} );
			} else {
				grunt.log.ok( 'No unstaged changes.' );
				done();
			}
		} );
	} );

	grunt.registerTask( 'build', [ 'clean', 'concat', 'cssjanus', 'cssUrlEmbed', 'copy', 'buildloader' ] );
	grunt.registerTask( 'lint', [ 'tyops', 'eslint', 'stylelint', 'jsonlint', 'banana' ] );
	grunt.registerTask( 'unit', [ 'karma:main' ] );
	grunt.registerTask( '_test', [ 'lint', 'git-build', 'build', 'unit' ] );
	grunt.registerTask( 'ci', [ '_test', 'svgmin', 'git-status' ] );
	grunt.registerTask( 'watch', [ 'karma:bg:start', 'runwatch' ] );

	if ( process.env.JENKINS_HOME ) {
		grunt.registerTask( 'test', 'ci' );
	} else {
		grunt.registerTask( 'test', '_test' );
	}

	grunt.registerTask( 'default', 'test' );
};
