/*!
 * VisualEditor DataModel InternalList tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.InternalList' );

/* Tests */

QUnit.test( 'getDocument', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList();
	assert.deepEqual( internalList.getDocument(), doc, 'Returns original document' );
} );

QUnit.test( 'queueItemHtml', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList();
	assert.deepEqual(
		internalList.queueItemHtml( 'reference', 'foo', 'Bar' ),
		{ index: 0, isNew: true },
		'First queued item returns index 0 and is new'
	);
	assert.deepEqual(
		internalList.queueItemHtml( 'reference', 'foo', 'Baz' ),
		{ index: 0, isNew: false },
		'Duplicate key returns index 0 and is not new'
	);
	assert.deepEqual(
		internalList.queueItemHtml( 'reference', 'bar', 'Baz' ),
		{ index: 1, isNew: true },
		'Second queued item returns index 1 and is new'
	);

	// Queue up empty data
	internalList.queueItemHtml( 'reference', 'baz', '' );
	assert.deepEqual(
		internalList.queueItemHtml( 'reference', 'baz', 'Quux' ),
		{ index: 2, isNew: true },
		'Third queued item is new because existing data in queue was empty'
	);

	assert.deepEqual( internalList.itemHtmlQueue, [ 'Bar', 'Baz', 'Quux' ], 'queue contains stored HTML items' );
} );

QUnit.test( 'convertToData', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		htmlDoc = doc.getHtmlDocument(),
		internalList = doc.getInternalList(),
		expectedData = [
			{ type: 'internalList' },
			{ type: 'internalItem', attributes: { originalHtml: 'Bar' } },
			{ type: 'paragraph', internal: { generated: 'wrapper', metaItems: [] } },
			...'Bar',
			{ type: '/paragraph' },
			{ type: '/internalItem' },
			{ type: 'internalItem', attributes: { originalHtml: 'Baz' } },
			{ type: 'paragraph', internal: { generated: 'wrapper', metaItems: [] } },
			...'Baz',
			{ type: '/paragraph' },
			{ type: '/internalItem' },
			{ type: '/internalList' }
		];

	// Mimic converter state setup (as done in ve.dm.ModelFromDomConverter#getDataFromDom)
	const converter = new ve.dm.ModelFromDomConverter( ve.dm.modelRegistry, ve.dm.nodeFactory, ve.dm.annotationFactory );
	converter.doc = htmlDoc;
	converter.store = doc.getStore();
	converter.internalList = internalList;
	converter.contextStack = [];

	internalList.queueItemHtml( 'reference', 'foo', 'Bar' );
	internalList.queueItemHtml( 'reference', 'bar', 'Baz' );
	assert.deepEqual( internalList.convertToData( converter, htmlDoc ), expectedData, 'Data matches' );
	assert.strictEqual( internalList.itemHtmlQueue.length, 0, 'queue is emptied after conversion' );
} );

QUnit.test( 'clone', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument( 'references' );
	const doc2 = ve.dm.example.createExampleDocument( 'references' );
	const internalList = doc.getInternalList();

	// Validate the test setup
	assert.deepEqual( internalList.keyIndexes, {}, '`keyIndexes` of original internalList is empty' );

	internalList.getNextUniqueNumber(); // =0
	const internalListClone = internalList.clone();
	internalList.getNextUniqueNumber(); // =1
	const internalListClone2 = internalList.clone( doc2 );
	internalList.getNextUniqueNumber(); // =2

	assert.deepEqual( internalListClone.keyIndexes, {}, '`keyIndexes` of first clone is empty' );
	assert.deepEqual( internalListClone2.keyIndexes, {}, '`keyIndexes` of second clone is empty' );

	assert.strictEqual( internalListClone.getDocument(), internalList.getDocument(), 'Documents match' );
	assert.strictEqual( internalListClone2.getDocument(), doc2, 'Cloning with document parameter' );

	assert.strictEqual( internalList.getNextUniqueNumber(), 3, 'Original internal list has nextUniqueNumber = 3' );
	assert.strictEqual( internalListClone.getNextUniqueNumber(), 4, 'Clone from original document has nextUniqueNumber = 4' );
	assert.strictEqual( internalListClone2.getNextUniqueNumber(), 0, 'Clone with different document has nextUniqueNumber = 0' );
} );

QUnit.test( 'getItemInsertion', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument();
	const internalList = doc.getInternalList();

	let insertion = internalList.getItemInsertion( 'group', 'literal/key', [] );
	const index = internalList.getItemNodeCount();
	assert.strictEqual( insertion.index, index, 'Insertion creates a new reference' );
	assert.deepEqual(
		insertion.transaction.getOperations(),
		[
			{ type: 'retain', length: 62 },
			{
				type: 'replace',
				remove: [],
				insert: [
					{ type: 'internalItem' },
					{ type: '/internalItem' }
				]
			},
			{ type: 'retain', length: 1 }
		],
		'New reference operations match' );

	insertion = internalList.getItemInsertion( 'group', 'literal/key', [] );
	assert.strictEqual( insertion.index, index, 'Insertion with duplicate key reuses old index' );
	assert.strictEqual( insertion.transaction, null, 'Insertion with duplicate key has null transaction' );
} );

QUnit.test( 'getUniqueListKey', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument( 'references' );
	const internalList = doc.getInternalList();

	let generatedName;
	generatedName = internalList.getUniqueListKey( 'g1', 'auto/0', 'literal/:' );
	assert.strictEqual( generatedName, 'literal/:0', '0 maps to 0' );
	generatedName = internalList.getUniqueListKey( 'g1', 'auto/1', 'literal/:' );
	assert.strictEqual( generatedName, 'literal/:1', '1 maps to 1' );
	generatedName = internalList.getUniqueListKey( 'g1', 'auto/2', 'literal/:' );
	assert.strictEqual( generatedName, 'literal/:2', '2 maps to 2' );
	generatedName = internalList.getUniqueListKey( 'g1', 'auto/3', 'literal/:' );
	assert.strictEqual( generatedName, 'literal/:4', '3 maps to 4 (because a literal :3 is present)' );
	generatedName = internalList.getUniqueListKey( 'g1', 'auto/4', 'literal/:' );
	assert.strictEqual( generatedName, 'literal/:5', '4 maps to 5' );

	generatedName = internalList.getUniqueListKey( 'g1', 'auto/0', 'literal/:' );
	assert.strictEqual( generatedName, 'literal/:0', 'Reusing a key reuses the name' );

	generatedName = internalList.getUniqueListKey( 'g2', 'auto/4', 'literal/:' );
	assert.strictEqual( generatedName, 'literal/:0', 'Different groups are treated separately' );
} );

QUnit.test( 'merge (no common element)', ( assert ) => {
	// Note: The internalLists in the example documents are not popuplated completely
	// so `keyIndexes` is empty in both cases
	const doc = ve.dm.example.createExampleDocument( 'references' );
	const otherDoc = ve.dm.example.createExampleDocument( 'references' );
	const internalList = doc.getInternalList();
	const otherInternalList = otherDoc.getInternalList();

	// Validate the test setup, see comment at the top
	assert.deepEqual( internalList.keyIndexes, {}, '`keyIndexes` is empty' );
	assert.deepEqual( otherInternalList.keyIndexes, {}, '`keyIndexes` is empty' );

	const merge = internalList.merge( otherInternalList, 0 );
	assert.deepEqual(
		merge.mapping,
		{ 0: 2, 1: 3 },
		'All nodes will be mapped to new indexes'
	);
	assert.deepEqual(
		merge.newItemRanges,
		[
			new ve.Range( 7, 14 ),
			new ve.Range( 14, 21 )
		],
		'All internal items will be merged into the list'
	);
} );

QUnit.test( 'merge (one common element)', ( assert ) => {
	// Note: The internalLists in the example documents are not popuplated completely
	// so `keyIndexes` is empty in both cases
	const doc = ve.dm.example.createExampleDocument( 'references' );
	const otherDoc = ve.dm.example.createExampleDocument( 'references' );
	const internalList = doc.getInternalList();
	const otherInternalList = otherDoc.getInternalList();

	// Validate the test setup, see comment at the top
	assert.deepEqual( internalList.keyIndexes, {}, '`keyIndexes` is empty' );
	assert.deepEqual( otherInternalList.keyIndexes, {}, '`keyIndexes` is empty' );

	const merge = internalList.merge( otherInternalList, 1 );
	assert.deepEqual(
		merge.mapping,
		{ 0: 0, 1: 2 },
		'One node will be mapped to an exisitng internal item'
	);
	assert.deepEqual(
		merge.newItemRanges,
		[
			new ve.Range( 14, 21 )
		],
		'Only one internal item will be merged into the list'
	);
} );
