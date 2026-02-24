/*!
 * VisualEditor UserInterface FragmentInspector test utilities.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Runs all fragment inspector tests.
 *
 * Tests are grouped by platform and run sequentially to avoid
 * interference due to the global mocking.
 *
 * @param {Object} assert
 * @param {Object[]} cases
 * @return {Promise}
 */
ve.test.utils.runFragmentInspectorTests = function ( assert, cases ) {
	let promise = Promise.resolve();
	[ true, false ].forEach( ( isMobile ) => {
		promise = promise.then( () => ve.test.utils.runFragmentInspectorTestsByPlatform(
			assert,
			cases.filter( ( caseItem ) => !!caseItem.isMobile === isMobile ),
			isMobile
		) );
	} );
	return promise;
};

/**
 * Runs all fragment inspector tests for a given platform in parallel.
 *
 * @param {Object} assert
 * @param {Object[]} cases
 * @param {boolean} isMobile
 * @return {Promise}
 */
ve.test.utils.runFragmentInspectorTestsByPlatform = function ( assert, cases, isMobile ) {
	const isMobileOrig = OO.ui.isMobile;
	// Mock isMobile
	OO.ui.isMobile = () => isMobile;
	// Surface will try to append the overlay but this is not necessary
	const getTeleportTargetOrig = OO.ui.getTeleportTarget;
	OO.ui.getTeleportTarget = () => $( [] );

	const promises = cases.map( ( caseItem ) => {
		const surface = ve.test.utils.createSurfaceFromHtml( caseItem.html || ve.dm.example.singleLine`
			<p>Foo <a href="bar">bar</a> baz  x</p>
			<p><!-- comment --> comment</p>
			<p>Fo<a href="bar">o bar</a></p>
		`, caseItem.config || {} );
		surface.getView().showSelectionState = () => {};
		return surface.context.inspectors.getWindow( caseItem.name ).then( ( inspector ) => {
			const surfaceModel = surface.getModel();
			const linearData = ve.copy( surfaceModel.getDocument().getFullData() );

			surfaceModel.setLinearSelection( caseItem.range );
			const setupData = ve.extendObject( { surface, fragment: surfaceModel.getFragment() }, caseItem.setupData );
			return inspector.setup( setupData ).then( () => inspector.ready( setupData ).then( () => {
				const deferred = ve.createDeferred();
				if ( caseItem.input ) {
					// Some fragment inspectors (e.g. link) need to wait for some async validation before
					// critical values are updated (e.g. LinkAnnotationWidget.annotation). Give the input
					// function a done callback to signal when it's safe to proceed with teardown and assertions.
					const done = () => deferred.resolve();
					caseItem.input.call( inspector, done );
				} else {
					deferred.resolve();
				}

				// TODO: Skips ActionProcess
				return deferred.promise().then( () => inspector.teardown( caseItem.actionData || { action: 'done' } ).then( () => {
					assert.equalRange( surfaceModel.getSelection().getRange(), caseItem.expectedRange, caseItem.msg + ': range' );
					if ( caseItem.expectedData ) {
						caseItem.expectedData( linearData );
						assert.equalLinearData(
							surfaceModel.getDocument().getFullData(),
							linearData,
							caseItem.msg + ': data'
						);
					}
					if ( caseItem.expectedInsertionAnnotations ) {
						assert.deepEqual(
							surfaceModel.getInsertionAnnotations().getHashes(),
							caseItem.expectedInsertionAnnotations,
							caseItem.msg + ': insertion annotations'
						);
					}
					while ( surfaceModel.canUndo() ) {
						surfaceModel.undo();
					}
					// Insertion annotations are not cleared by undo
					surfaceModel.setInsertionAnnotations( null );
				} ) );
			} ) );
		} );
	} );
	return Promise.all( promises ).then( () => {
		// Restore mocks
		OO.ui.isMobile = isMobileOrig;
		OO.ui.getTeleportTarget = getTeleportTargetOrig;
	} );
};
