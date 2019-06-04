/*!
 * VisualEditor rebaser demo
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

( function () {
	function RebaserTarget() {
		RebaserTarget.super.apply( this, arguments );

		// HACK: Disable redo command until supported (T185706)
		ve.ui.commandRegistry.unregister( 'redo' );
	}

	OO.inheritClass( RebaserTarget, ve.init.sa.Target );

	RebaserTarget.static.toolbarGroups = ve.copy( RebaserTarget.static.toolbarGroups );
	RebaserTarget.static.toolbarGroups.splice( 4, 0, {
		name: 'commentAnnotation',
		include: [ 'commentAnnotation' ]
	} );

	RebaserTarget.static.actionGroups = ve.copy( RebaserTarget.static.actionGroups );
	RebaserTarget.static.actionGroups.push(
		{
			name: 'authorList',
			include: [ 'authorList' ]
		}
	);

	new ve.init.sa.Platform( ve.messagePaths ).initialize().done( function () {
		var surfaceModel, dummySurface,
			progressDeferred = ve.createDeferred(),
			panel = new OO.ui.PanelLayout( {
				// eslint-disable-next-line no-jquery/no-global-selector
				$element: $( '.ve-demo-editor' ),
				expanded: false,
				framed: true
			} ),
			target = new RebaserTarget();

		panel.$element.append( target.$element );

		// Add a dummy surface while the doc is loading
		dummySurface = target.addSurface( ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( '' ) ) );
		dummySurface.setReadOnly( true );

		// TODO: Create the correct model surface type (ve.ui.Surface#createModel)
		surfaceModel = new ve.dm.Surface( ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( '' ) ) );
		surfaceModel.createSynchronizer(
			ve.docName,
			{ server: this.rebaserUrl }
		);

		dummySurface.createProgress( progressDeferred.promise(), ve.msg( 'visualeditor-rebase-client-connecting' ), true );

		surfaceModel.synchronizer.once( 'initDoc', function () {
			progressDeferred.resolve();
			target.clearSurfaces();
			// Don't add the surface until the history has been applied
			target.addSurface( surfaceModel );
			target.getSurface().getView().focus();
		} );

	} );
}() );
