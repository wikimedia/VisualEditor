'use strict';

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

module.exports = function ( config ) {
	config.set( {
		coverageReporter: {
			dir: 'coverage/',
			subdir: '.',
			reporters: [
				{ type: 'clover' },
				{ type: 'html' },
				{ type: 'json-summary' },
				{ type: 'text-summary' }
			],
			check: {
				global: coverAll( 73 ),
				each: {
					functions: 20,
					branches: 20,
					statements: 20,
					lines: 20,
					excludes: [
						'rebaser/src/dm/ve.dm.ProtocolServer.js',
						'rebaser/src/dm/ve.dm.RebaseDocState.js',
						'src/ve.track.js',
						'src/init/**/*.js',
						// DM
						'src/dm/ve.dm.Converter.js',
						'src/dm/ve.dm.InternalList.js',
						'src/dm/ve.dm.InternalListNodeGroup.js',
						'src/dm/ve.dm.SourceSurfaceFragment.js',
						'src/dm/ve.dm.SurfaceSynchronizer.js',
						'src/dm/ve.dm.TableSlice.js',
						'src/dm/annotations/ve.dm.CommentAnnotation.js',
						// TODO: Fix AlienMetaItem for 100% coverage
						'src/dm/metaitems/ve.dm.AlienMetaItem.js',
						'src/dm/nodes/ve.dm.DocumentNode.js',
						'src/dm/nodes/ve.dm.GeneratedContentNode.js',
						'src/dm/nodes/ve.dm.ImageNode.js',
						'src/dm/nodes/ve.dm.InternalItemNode.js',
						'src/dm/nodes/ve.dm.SectionNode.js',
						// CE
						'src/ce/ve.ce.DragDropHandler.js',
						'src/ce/ve.ce.SelectionManager.js',
						'src/ce/ve.ce.SurfaceSynchronizer.js',
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
						'src/ui/inspectors/ve.ui.FragmentInspector.js',
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
						'src/dm/*.js': coverAll( 75 ),
						'src/dm/annotations/*.js': coverAll( 100 ),
						'src/dm/lineardata/*.js': coverAll( 95 ),
						'src/dm/metaitems/*.js': coverAll( 100 ),
						// TODO: Fix a few cases for 80% coverage
						'src/dm/nodes/*.js': coverAll( 70 ),
						// TODO: Fix a few cases for 95% coverage
						'src/dm/selections/*.js': coverAll( 80 ),
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
	} );
};
