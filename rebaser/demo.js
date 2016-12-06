/*!
 * VisualEditor rebaser demo
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

new ve.init.sa.Platform( ve.messagePaths ).initialize().done( function () {
	var synchronizer,
		$editor = $( '.ve-demo-editor' ),
		// eslint-disable-next-line new-cap
		target = new ve.demo.target();

	$editor.append( target.$element );
	target.addSurface( ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( '' ) ) );
	synchronizer = new ve.dm.SurfaceSynchronizer( target.surface.model );
	target.surface.view.setSynchronizer( synchronizer );
} );
