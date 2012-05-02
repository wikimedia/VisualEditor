module( 've.ce.BranchNode' );

/* Stubs */

ve.ce.BranchNodeStub = function( model, $element ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, $element );
};

ve.extendClass( ve.ce.BranchNodeStub, ve.ce.BranchNode );

ve.ce.factory.register( 'branch-stub', ve.ce.BranchNodeStub );

/* Tests */

test( 'replaceDomWrapper', 4, function() {
	var $oldWrapper = $( '<h1 class="test">hello</h1>' ),
		$newWrapper = $( '<h2></h2>' ),
		node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub(), $oldWrapper );
	equal( node.$, $oldWrapper, 'this.$ references wrapper given to constructor' );
	node.replaceDomWrapper( $newWrapper );
	equal( node.$, $newWrapper, 'this.$ references new wrapper after replaceDomWrapper is called' );
	equal( node.$.attr( 'class' ), 'test', 'old classes are added to new wrapper' );
	equal( node.$.text(), 'hello', 'contents are added to new wrapper' );
} );

test( 'onSplice', 5, function() {
	var modelA = new ve.dm.BranchNodeStub(),
		modelB = new ve.dm.BranchNodeStub(),
		modelC = new ve.dm.BranchNodeStub(),
		viewA = new ve.ce.BranchNodeStub( modelA );

	modelA.splice( 0, 0, modelB, modelC );
	equal( viewA.getChildren().length, 2 );
	deepEqual( viewA.getChildren()[0].getModel(), modelB );
	deepEqual( viewA.getChildren()[1].getModel(), modelC );

	modelA.splice( 0, 1 );
	equal( viewA.getChildren().length, 1 );
	deepEqual( viewA.getChildren()[0].getModel(), modelC );

} );
