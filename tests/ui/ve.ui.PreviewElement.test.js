/*!
 * VisualEditor PreviewElement tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.PreviewElement' );

/* Tests */

QUnit.test( 'Basic tests', ( assert ) => {
	const done = assert.async(),
		doc = ve.dm.example.createExampleDocument(),
		modelNode = doc.getDocumentNode().getChildren()[ 0 ];

	const simplePreview = new ve.ui.PreviewElement();
	assert.deepEqual( simplePreview.isGenerating(), false, 'not isGenerating if constructed without model' );
	simplePreview.setModel( modelNode );
	assert.strictEqual( simplePreview.model, modelNode, 'setModel' );
	assert.true( simplePreview.isGenerating(), 'isGenerating after setModel' );

	simplePreview.once( 'render', () => {
		assert.deepEqual( simplePreview.isGenerating(), false, 'not isGenerating after render' );
		assert.equalDomElement(
			simplePreview.$element[ 0 ],
			$.parseHTML( '<div class="ve-ui-previewElement"><h1>a<b>b</b><i>c</i></h1></div>' )[ 0 ],
			'Simple node render'
		);
		done();
	} );

	const useViewPreview = new ve.ui.PreviewElement( modelNode, { useView: true } );
	assert.true( useViewPreview.isGenerating(), 'isGenerating after construction with model' );
	useViewPreview.once( 'render', () => {
		assert.deepEqual( simplePreview.isGenerating(), false, 'not isGenerating after useView render' );
		assert.equalDomElement(
			simplePreview.$element[ 0 ],
			$.parseHTML( '<div class="ve-ui-previewElement"><h1>a<b>b</b><i>c</i></h1></div>' )[ 0 ],
			'Simple useView render'
		);
	} );

	// TODO test:
	// * awaitGeneratedContent branch (useView & !useView)
	// * attribute resolution in replaceWithModelDom
	// * targetLinksToNewWindow
} );
