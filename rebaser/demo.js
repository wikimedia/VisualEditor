/*!
 * VisualEditor rebaser demo
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

new ve.init.sa.Platform( ve.messagePaths ).initialize().done( function () {
	var synchronizer, authorList,
		$editor = $( '.ve-demo-editor' ),
		$menu = $( '.ve-pad-menu' ),
		// eslint-disable-next-line new-cap
		target = new ve.demo.target();

	$editor.append( target.$element );

	target.addSurface( ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( '' ) ) );
	synchronizer = new ve.dm.SurfaceSynchronizer( target.surface.model, ve.docName );
	target.surface.view.setSynchronizer( synchronizer );

	authorList = new ve.ui.AuthorListWidget( synchronizer );

	$menu.append( authorList.$element );
} );
