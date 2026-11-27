/*!
 * VisualEditor UserInterface MediaSizeWidget tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.MediaSizeWidget' );

QUnit.test( 'Typing a custom size keeps the custom size', ( assert ) => {
	const makeWidget = () => {
		const scalable = new ve.dm.Scalable( {
			currentDimensions: { width: 200, height: 24 },
			originalDimensions: { width: 1360, height: 160 },
			defaultDimensions: { width: 180, height: 21 }
		} );
		const widget = new ve.ui.MediaSizeWidget( scalable );
		widget.setScalable( scalable );
		widget.setSizeType( 'custom' );
		return widget;
	};
	const typeInto = ( input, text ) => {
		for ( let i = 1; i <= text.length; i++ ) {
			input.setValue( text.slice( 0, i ) );
		}
	};

	let widget = makeWidget();
	// Backspace the width down to an empty field, then type a new one
	widget.dimensions.widthInput.setValue( '' );
	assert.strictEqual( widget.getSizeType(), 'custom', 'empty width field keeps custom size' );
	assert.false( widget.dimensions.widthInput.isDisabled(), 'width field stays editable' );
	typeInto( widget.dimensions.widthInput, '366' );
	assert.strictEqual( widget.getCurrentDimensions().width, 366, 'typed width applied' );

	widget = makeWidget();
	// First digit gives a height that rounds to 0 for this wide image
	widget.dimensions.widthInput.setValue( '3' );
	assert.strictEqual( widget.getSizeType(), 'custom', 'height rounded to 0 keeps custom size' );
	assert.false( widget.dimensions.widthInput.isDisabled(), 'width field stays editable' );
	typeInto( widget.dimensions.widthInput, '366' );
	assert.strictEqual( widget.getCurrentDimensions().width, 366, 'typed width applied' );

	widget = makeWidget();
	widget.sizeTypeSelect.chooseItem( widget.sizeTypeSelect.findItemFromData( 'default' ) );
	assert.strictEqual( widget.getSizeType(), 'default', 'Default button still selects default size' );
	assert.true( widget.getScalable().isDefault(), 'scalable is default' );
} );
