'use strict';

const fg = require( 'fast-glob' );

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
					excludes: fg.globSync( [
						'rebaser/src/dm/ve.dm.ProtocolServer.js',
						'rebaser/src/dm/ve.dm.RebaseDocState.js',
						'src/ve.track.js',
						'src/init/**/*.js',
						// DM
						'!src/init/ve.init.ConflictableStorage.js',
						'!src/init/ve.init.SupportCheck.js',
						'!src/init/ve.init.js',
						'!src/init/sa/ve.init.sa.js',
						'src/dm/ve.dm.Converter.js',
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
						'!src/ui/ve.ui.Action.js',
						'!src/ui/ve.ui.DataTransferHandlerFactory.js',
						'!src/ui/ve.ui.DataTransferItem.js',
						'!src/ui/ve.ui.FragmentWindow.js',
						'!src/ui/ve.ui.Overlay.js',
						'!src/ui/ve.ui.SequenceRegistry.js',
						'!src/ui/ve.ui.ToolFactory.js',
						'!src/ui/ve.ui.Trigger.js',
						'!src/ui/ve.ui.TriggerRegistry.js',
						'!src/ui/ve.ui.js',
						'src/ui/actions/*.js',
						'!src/ui/actions/ve.ui.AnnotationAction.js',
						'!src/ui/actions/ve.ui.FormatAction.js',
						'!src/ui/actions/ve.ui.IndentationAction.js',
						'!src/ui/actions/ve.ui.LinkAction.js',
						'!src/ui/actions/ve.ui.TableAction.js',
						'src/ui/commands/*.js',
						'src/ui/contextitems/*.js',
						'!src/ui/contextitems/ve.ui.CommentContextItem.js',
						'!src/ui/contextitems/ve.ui.LanguageContextItem.js',
						'src/ui/contexts/*.js',
						'src/ui/datatransferhandlers/*.js',
						'!src/ui/datatransferhandlers/ve.ui.DSVFileTransferHandler.js',
						'!src/ui/datatransferhandlers/ve.ui.UrlStringTransferHandler.js',
						'src/ui/dialogs/*.js',
						'src/ui/inspectors/ve.ui.CommentAnnotationInspector.js',
						'src/ui/inspectors/ve.ui.FragmentInspector.js',
						'src/ui/layouts/*.js',
						'src/ui/pages/*.js',
						'src/ui/tools/*.js',
						'src/ui/widgets/*.js',
						'!src/ui/widgets/ve.ui.NoFocusButtonWidget.js',
						'src/ui/windowmanagers/*.js'
					] ),
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
						'src/ce/selections/*.js': coverAll( 80 ),
						// UI
						'src/ui/elements/*.js': coverAll( 50 ),
						'src/ui/inspectors/*.js': coverAll( 50 )
					}
				}
			}
		}
	} );
};
