/*!
 * VisualEditor DataModel TableMatrix tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.TableMatrix' );

/* Tests */

QUnit.test( 'update (metadata row children)', ( assert ) => {
	const doc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml(
		'<table><tbody>' +
			'<tr><td>A</td><td>B</td></tr>' +
			'<tr><!-- comment --><td>C</td><td>D</td></tr>' +
		'</tbody></table>'
	) );
	const matrix = doc.getDocumentNode().children[ 0 ].getMatrix();

	assert.strictEqual( matrix.getMaxColCount(), 2, 'comment does not add a column' );
	assert.deepEqual(
		[ 0, 1 ].map( ( row ) => matrix.getColCount( row ) ),
		[ 2, 2 ],
		'comment occupies no column'
	);
	const cell = matrix.getCell( 1, 0 );
	assert.strictEqual(
		cell && doc.data.getText( false, cell.node.getRange() ),
		'C',
		'cell after a comment is in the first column'
	);
} );

QUnit.test( 'update (rendering non-cell row children)', ( assert ) => {
	// A style tag is not fostered out of the row, and CSS gives it an
	// anonymous cell. It must keep its column, unlike metadata.
	const doc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml(
		'<table><tbody>' +
			'<tr><style>td{}</style><td>A</td><td>B</td></tr>' +
			'<tr><td>C</td><td>D</td></tr>' +
		'</tbody></table>'
	) );
	const matrix = doc.getDocumentNode().children[ 0 ].getMatrix();

	assert.strictEqual( matrix.getMaxColCount(), 3, 'non-cell child keeps a column' );
	assert.deepEqual(
		[ 0, 1 ].map( ( row ) => matrix.getColCount( row ) ),
		[ 3, 2 ],
		'only the row with the non-cell child is 3 columns wide'
	);
	assert.strictEqual( matrix.getCell( 0, 0 ), null, 'non-cell child has no matrix cell' );
} );
