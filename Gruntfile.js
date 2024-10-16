/*!
 * Grunt file
 *
 * @package VisualEditor
 */

'use strict';

/**
 * Grunt configuration
 *
 * @param {Object} grunt The grunt object
 */
module.exports = function ( grunt ) {
	const modules = grunt.file.readJSON( 'build/modules.json' ),
		moduleUtils = require( './build/moduleUtils' ),
		path = require( 'path' ),
		fg = require( 'fast-glob' ),
		rebaserBuildFiles = moduleUtils.makeBuildList( modules, [ 'rebaser.build' ] ),
		veRebaseFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.rebase.build' ] ),
		coreBuildFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.build' ] ),
		coreBuildFilesApex = moduleUtils.makeBuildList( modules, [ 'visualEditor.build.apex' ] ),
		coreBuildFilesWikimediaUI = moduleUtils.makeBuildList( modules, [ 'visualEditor.build.wikimediaui' ] ),
		testFiles = moduleUtils.makeBuildList( modules, [ 'visualEditor.test' ] ).scripts,
		demoPages = ( function () {
			const files = grunt.file.expand( 'demos/ve/pages/*.html' );
			return files.map( ( file ) => file.match( /^.*pages\/(.+).html$/ )[ 1 ] );
		}() );

	const distLessFiles = {
		'dist/visualEditor-apex.css': 'dist/visualEditor-apex.less',
		'dist/visualEditor-wikimediaui.css': 'dist/visualEditor-wikimediaui.less',
		'dist/visualEditor-rebase.css': 'dist/visualEditor-rebase.less'
	};

	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-css-url-embed' );
	grunt.loadNpmTasks( 'grunt-cssjanus' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-karma' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.loadNpmTasks( 'grunt-tyops' );
	grunt.loadTasks( 'build/tasks' );

	// We want to use `grunt watch` to start this and karma watch together.
	grunt.renameTask( 'watch', 'runwatch' );

	/**
	 * Build an object of required coverage percentages
	 *
	 * @param {number} pc Percentage coverage required (for all aspects)
	 * @return {Object} required coverage percentages
	 */
	function coverAll( pc ) {
		return {
			functions: pc,
			branches: pc,
			statements: pc,
			lines: pc
		};
	}

	function fixPaths( src, filepath ) {
		const makeRelative = ( target ) => {
			const currentDir = path.dirname( path.resolve( filepath ) );
			const targetAbsolute = path.resolve( currentDir, target );
			return path.relative( 'dist', targetAbsolute );
		};

		src = src.replace(
			/@import ["'](.*)["']/g,
			( ...args ) => `@import '${ makeRelative( args[ 1 ] ) }'`
		);
		src = src.replace(
			/url\([\s]*["']?([^)]*)["']?[\s]*\)/g,
			( ...args ) => args[ 1 ].includes( 'data:' ) ? args[ 0 ] : `url('${ makeRelative( args[ 1 ] ) }')`
		);

		return src;
	}

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		clean: {
			dist: [ 'dist/*', 'coverage/*' ],
			less: Object.values( distLessFiles )
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
					banner: grunt.file.read( 'build/banner.txt' ),
					sourceMap: true
				},
				dest: 'dist/visualEditor-rebase.js',
				src: veRebaseFiles.scripts
			},
			'visualEditor.rebase.styles': {
				options: {
					banner: grunt.file.read( 'build/banner.txt' ),
					process: fixPaths
				},
				dest: 'dist/visualEditor-rebase.less',
				src: veRebaseFiles.styles
			},
			js: {
				options: {
					banner: grunt.file.read( 'build/banner.txt' ),
					sourceMap: true
				},
				dest: 'dist/visualEditor.js',
				src: coreBuildFiles.scripts
			},
			'css-apex': {
				options: {
					banner: grunt.file.read( 'build/banner.txt' ),
					process: fixPaths
				},
				dest: 'dist/visualEditor-apex.less',
				src: coreBuildFilesApex.styles
			},
			'css-wikimediaui': {
				options: {
					banner: grunt.file.read( 'build/banner.txt' ),
					process: fixPaths
				},
				dest: 'dist/visualEditor-wikimediaui.less',
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
		less: {
			options: {
				// Throw errors if we try to calculate mixed units, like `px` and `em` values.
				strictUnits: true,
				// Force LESS v3.0.0+ to let us use mixins before we later upgrade to @plugin
				// architecture.
				javascriptEnabled: true
			},
			dist: {
				files: distLessFiles
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
		buildloader: {
			desktopDemoApex: {
				targetFile: 'demos/ve/desktop-apex.html',
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
				targetFile: 'demos/ve/desktop-apex-dist.html',
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
				targetFile: 'demos/ve/desktop.html',
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
				targetFile: 'demos/ve/desktop-dist.html',
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
					'visualEditor.standalone.wikimediaui.dist',
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
					'visualEditor.standalone.wikimediaui.dist',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.minimal.standalone.demo' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				dir: 'rtl',
				langList: false
			},
			performanceTest: {
				targetFile: 'demos/ve/performance.html',
				template: 'demos/ve/performance.html.template',
				modules: modules,
				load: [
					'visualEditor.standalone.wikimediaui.dist',
					'visualEditor.standalone.read'
				],
				run: [ 'visualEditor.test.performance' ],
				pathPrefix: '../../',
				i18n: [ 'dist/i18n/', 'lib/oojs-ui/i18n/' ],
				indent: '\t\t',
				dir: 'ltr',
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
			src: fg.globSync( [
				'**/*.{js,json,less,css,txt,md,sh}',
				'!**/package-lock.json',
				'!build/typos.json',
				'!lib/**',
				'!**/i18n/**/*.json',
				'!**/{coverage,dist,docs,node_modules}/**',
				'!.git/**'
			] )
				// Overwrite ignores
				.concat( fg.globSync( [
					'**/i18n/**/en.json',
					'**/i18n/**/qqq.json',
					'!**/{coverage,dist,docs,node_modules}/**'
				] ) )
		},
		eslint: {
			options: {
				cache: true,
				fix: grunt.option( 'fix' )
			},
			all: fg.globSync( [
				'**/*.{js,json}',
				'**/.*.{js,json}',
				'demos/**/*.html',
				'!lib/**',
				'!**/{coverage,dist,docs,node_modules}/**'
			] )
		},
		stylelint: {
			options: {
				reportNeedlessDisables: true
			},
			all: fg.globSync( [
				'**/*.{css,less}',
				'!lib/**',
				'!**/{coverage,dist,docs,node_modules}/**'
			] )
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
						flags: process.env.CHROMIUM_FLAGS ?
							process.env.CHROMIUM_FLAGS.split( ' ' ) :
							undefined
					}
				},
				autoWatch: false
			},
			chrome: {
				browsers: [ 'ChromeCustom' ],
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
						global: coverAll( 60 ),
						each: {
							functions: 20,
							branches: 20,
							statements: 20,
							lines: 20,
							excludes: [
								'rebaser/src/dm/ve.dm.DocumentStore.js',
								'rebaser/src/dm/ve.dm.PeerTransportServer.js',
								'rebaser/src/dm/ve.dm.ProtocolServer.js',
								'rebaser/src/dm/ve.dm.RebaseDocState.js',
								'rebaser/src/dm/ve.dm.TransportServer.js',
								'src/ve.track.js',
								'src/ve.ext-peer.js',
								'src/init/**/*.js',
								// DM
								'src/dm/ve.dm.InternalList.js',
								'src/dm/ve.dm.SourceSurfaceFragment.js',
								'src/dm/ve.dm.SurfaceSynchronizer.js',
								'src/dm/ve.dm.TableSlice.js',
								'src/dm/annotations/ve.dm.CommentAnnotation.js',
								'src/dm/nodes/ve.dm.GeneratedContentNode.js',
								'src/dm/nodes/ve.dm.HeadingNode.js',
								'src/dm/nodes/ve.dm.ImageNode.js',
								'src/dm/nodes/ve.dm.InternalItemNode.js',
								// CE
								'src/ce/ve.ce.DragDropHandler.js',
								'src/ce/ve.ce.SelectionManager.js',
								'src/ce/annotations/ve.ce.DeleteAnnotation.js',
								'src/ce/annotations/ve.ce.InsertAnnotation.js',
								'src/ce/nodes/ve.ce.CheckListItemNode.js',
								'src/ce/nodes/ve.ce.GeneratedContentNode.js',
								'src/ce/nodes/ve.ce.InternalItemNode.js',
								'src/ce/keydownhandlers/ve.ce.TableDeleteKeyDownHandler.js',
								// UI
								'src/ui/*.js',
								'src/ui/actions/*.js',
								'src/ui/commands/*.js',
								'src/ui/contextitems/*.js',
								'src/ui/contexts/*.js',
								'src/ui/datatransferhandlers/*.js',
								'src/ui/dialogs/*.js',
								'src/ui/inspectors/ve.ui.CommentAnnotationInspector.js',
								'src/ui/layouts/*.js',
								'src/ui/pages/*.js',
								'src/ui/tools/*.js',
								'src/ui/widgets/*.js',
								'src/ui/windowmanagers/*.js'
							],
							overrides: {
								// Core
								// TODO: Fix a few cases for 80% coverage
								'src/*.js': coverAll( 50 ),
								// DM
								'src/dm/*.js': coverAll( 50 ),
								'src/dm/annotations/*.js': coverAll( 100 ),
								'src/dm/lineardata/*.js': coverAll( 95 ),
								// TODO: Fix AlienMetaItem for 100% coverage
								'src/dm/metaitems/*.js': coverAll( 50 ),
								// TODO: Fix a few cases for 80% coverage
								'src/dm/nodes/*.js': coverAll( 50 ),
								// TODO: Fix a few cases for 95% coverage
								'src/dm/selections/*.js': coverAll( 50 ),
								// CE
								'src/ce/*.js': coverAll( 50 ),
								// TODO: Fix a few cases for 80% coverage
								'src/ce/annotations/*.js': coverAll( 50 ),
								'src/ce/keydownhandlers/*.js': coverAll( 80 ),
								'src/ce/nodes/*.js': coverAll( 50 ),
								// TODO: Fix a few cases for 80% coverage
								'src/ce/selections/*.js': coverAll( 50 ),
								// UI
								'src/ui/elements/*.js': coverAll( 50 ),
								'src/ui/inspectors/*.js': coverAll( 50 )
							}
						}
					}
				}
			},
			// Separate job for Firefox as we don't want a second coverage report.
			firefox: {
				browsers: [ 'FirefoxHeadless' ]
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
		const done = this.async();
		// Are there unstaged changes?
		require( 'child_process' ).exec( 'git ls-files --modified', ( err, stdout, stderr ) => {
			const ret = err || stderr || stdout;
			if ( ret ) {
				grunt.log.error( 'Unstaged changes in these files:' );
				grunt.log.error( ret );
				// Show a condensed diff
				require( 'child_process' ).exec( 'git diff -U1 | tail -n +3', ( err2, stdout2, stderr2 ) => {
					const message = err2 || stderr2 || stdout2;
					grunt.log.write( message );
					if ( message.includes( 've.availableLanguages' ) ) {
						grunt.log.subhead( 'CI likely failed because L10n-bot recently added data for a new language, and self +2\'d the change.' );
						grunt.log.writeln( 'To fix this issue, run "grunt build" locally, then create a commit with the resulting changes.' );
					}
					done( false );
				} );
			} else {
				grunt.log.ok( 'No unstaged changes.' );
				done();
			}
		} );
	} );

	grunt.registerTask( 'build', [ 'clean:dist', 'concat', 'less', 'clean:less', 'cssjanus', 'cssUrlEmbed', 'copy', 'buildloader' ] );
	grunt.registerTask( 'lint', [ 'tyops', 'eslint', 'stylelint', 'banana' ] );
	grunt.registerTask( 'unit', [ 'karma:chrome', 'karma:firefox' ] );
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
