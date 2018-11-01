/*!
 * VisualEditor ContentEditable ResizableNode tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.ResizableNode' );

/* Tests */

QUnit.test( 'updateSizeLabel', function ( assert ) {
	var view = ve.test.utils.createSurfaceViewFromHtml( ve.dm.example.blockImage.html ),
		documentNode = view.getDocument().getDocumentNode(),
		resizableNode = documentNode.children[ 0 ];

	resizableNode.setOriginalDimensions( {
		width: 100,
		height: 30
	} );
	resizableNode.updateSizeLabel();

	// Position is too fragile to assert
	resizableNode.$sizeLabel.css( { top: '', left: '' } );
	assert.equalDomElement(
		resizableNode.$sizeLabel[ 0 ],
		$( '<div class="ve-ce-resizableNode-sizeLabel ve-ce-resizableNode-sizeLabel-resizing" style="width: 100px; height: 30px; line-height: 30px;">' +
			'<span class="ve-ce-resizableNode-sizeText">' +
				'<span class="ve-ce-resizableNode-sizeText-size">100 × 50</span>' +
				'<span class="ve-ce-resizableNode-sizeText-scale">100%</span>' +
			'</span>' +
		'</div>' )[ 0 ],
		'Size label'
	);

	view.destroy();
} );
