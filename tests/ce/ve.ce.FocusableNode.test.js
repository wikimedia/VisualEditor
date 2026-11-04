/*!
 * VisualEditor ContentEditable FocusableNode tests.
 *
 * @copyright See AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.ce.FocusableNode' );

QUnit.test( 'flushInvisibleIconChecks batches reads and skips destroyed nodes', ( assert ) => {
	const pending = ve.ce.FocusableNode.static.pendingInvisibleIconChecks;
	pending.clear();
	// Mock focusable nodes that log the order of detach/measure/apply operations.
	const log = [];
	const makeNode = ( id, hasRendering, options = {} ) => {
		const node = {
			hasRendering: () => {
				log.push( 'read:' + id );
				return hasRendering;
			},
			updateInvisibleIconSync: ( show ) => {
				log.push( 'apply:' + id );
				node.applied = show;
			},
			getModel: () => options.destroyed ? null : {}
		};
		if ( options.hasIcon ) {
			node.icon = { $element: { detach: () => log.push( 'detach:' + id ) } };
		}
		return node;
	};
	const invisible = makeNode( 'invisible', false, { hasIcon: true } );
	const visible = makeNode( 'visible', true );
	const destroyed = makeNode( 'destroyed', false, { destroyed: true } );
	pending.add( invisible );
	pending.add( visible );
	pending.add( destroyed );

	ve.ce.FocusableNode.static.flushInvisibleIconChecks();

	assert.strictEqual( pending.size, 0, 'queue is drained' );
	assert.strictEqual( invisible.applied, true, 'node without a rendering is given an icon' );
	assert.strictEqual( visible.applied, false, 'node with a rendering is not' );
	assert.strictEqual( destroyed.applied, undefined, 'destroyed node is skipped' );
	// All detaches precede all reads, and all reads precede all applies, so the batch forces
	// a single reflow rather than one per node.
	assert.deepEqual(
		log,
		[ 'detach:invisible', 'read:invisible', 'read:visible', 'apply:invisible', 'apply:visible' ],
		'writes and reads are grouped (detach all, then measure all, then apply all)'
	);
} );

QUnit.test( 'updateInvisibleIcon queues instead of measuring synchronously', ( assert ) => {
	const pending = ve.ce.FocusableNode.static.pendingInvisibleIconChecks;
	pending.clear();
	let reads = 0,
		scheduled = 0;
	const realRaf = window.requestAnimationFrame;
	// Capture scheduling without letting the flush run
	window.requestAnimationFrame = () => {
		scheduled++;
		return 0;
	};
	try {
		const iconNode = () => ( {
			constructor: { static: { iconWhenInvisible: 'puzzle' } },
			hasRendering: () => {
				reads++;
				return true;
			}
		} );
		const a = iconNode(),
			b = iconNode();
		const plain = { constructor: { static: { iconWhenInvisible: null } } };
		ve.ce.FocusableNode.prototype.updateInvisibleIcon.call( a );
		ve.ce.FocusableNode.prototype.updateInvisibleIcon.call( a ); // same node again
		ve.ce.FocusableNode.prototype.updateInvisibleIcon.call( b );
		ve.ce.FocusableNode.prototype.updateInvisibleIcon.call( plain ); // no icon type: ignored

		assert.strictEqual( reads, 0, 'nothing is measured synchronously' );
		assert.strictEqual( pending.size, 2, 'distinct icon nodes are queued; plain node ignored' );
		assert.strictEqual( scheduled, 1, 'a single flush is scheduled for the whole batch' );
	} finally {
		window.requestAnimationFrame = realRaf;
		pending.clear();
	}
} );

QUnit.test( 'MathML', ( assert ) => {
	const mathNS = 'http://www.w3.org/1998/Math/MathML';
	const math = document.createElementNS( mathNS, 'math' );
	// Firefox ignores CSS width/height on MathML elements, so size the content with mspace
	const mspace = document.createElementNS( mathNS, 'mspace' );
	mspace.setAttribute( 'width', '20px' );
	mspace.setAttribute( 'height', '20px' );
	math.appendChild( mspace );
	// eslint-disable-next-line no-jquery/no-global-selector
	$( '#qunit-fixture' ).append( math );
	const mockViewNode = { $element: $( math ) };

	assert.strictEqual( math.offsetWidth, undefined, 'MathML element has no offsetWidth' );
	assert.true( ve.ce.FocusableNode.prototype.hasRendering.call( mockViewNode ), 'MathML element has a rendering' );

	mspace.setAttribute( 'width', '0' );
	assert.false( ve.ce.FocusableNode.prototype.hasRendering.call( mockViewNode ), 'zero-width MathML element has no rendering' );

	mockViewNode.$element.remove();
} );
