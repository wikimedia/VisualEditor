/*!
 * VisualEditor rebaser demo
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

new ve.init.sa.Platform( ve.messagePaths ).initialize().done( function () {
	var synchronizer,
		$editor = $( '.ve-demo-editor' ),
		$sidebar = $( '<div>' ),
		nameInput = new OO.ui.TextInputWidget(),
		changeNameButton = new OO.ui.ButtonWidget( { label: 'Change name' } ),
		authorList = new OO.ui.SelectWidget(),
		// eslint-disable-next-line new-cap
		target = new ve.demo.target();

	function updateName() {
		synchronizer.changeName( nameInput.getValue() );
	}

	$sidebar.append(
		// FIXME FieldLayouts exist for this purpose
		nameInput.$element
			.css( { display: 'inline-block', width: 'auto' } ),
		changeNameButton.$element,
		authorList.$element
	);

	$editor
		.append(
			$( '<div>' )
				.css( { display: 'table', width: '100%' } )
				.append(
					$( '<div>' )
						.css( { display: 'table-row' } )
						.append(
							$( '<div>' )
								.css( { display: 'table-cell', width: '80%' } )
								.append( target.$element ),
							$sidebar
								.css( { display: 'table-cell', 'padding-left': '1em' } )
						)
				)
		);
	target.addSurface( ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( '' ) ) );
	synchronizer = new ve.dm.SurfaceSynchronizer( target.surface.model, ve.docName );
	target.surface.view.setSynchronizer( synchronizer );

	synchronizer.on( 'authorNameChange', function ( authorId ) {
		var color,
			authorLabel = authorList.getItemFromData( String( authorId ) );
		if ( !authorLabel ) {
			// FIXME: Duplicated from SurfaceSynchronizer
			color = '#' +
				( 8 * ( 1 - Math.sin( 5 * authorId ) ) ).toString( 16 ).slice( 0, 1 ) +
				( 6 * ( 1 - Math.cos( 3 * authorId ) ) ).toString( 16 ).slice( 0, 1 ) +
				'0';

			// FIXME use something more suitable than DecoratedOptionWidget
			authorLabel = new OO.ui.DecoratedOptionWidget( {
				data: String( authorId ),
				// HACK: force the icon to show, but override the background with a color
				icon: 'none'
			} );
			authorLabel.$icon.css( 'background', color );
			authorList.addItems( [ authorLabel ] );
		}
		authorLabel.setLabel( String( synchronizer.authorNames[ authorId ] ) );
		if ( String( authorId ) === String( synchronizer.author ) ) {
			nameInput.setValue( String( synchronizer.authorNames[ authorId ] ) );
		}
	} );

	synchronizer.on( 'authorDisconnect', function ( authorId ) {
		var authorLabel = authorList.getItemFromData( String( authorId ) );
		if ( authorLabel ) {
			authorList.removeItems( [ authorLabel ] );
		}
	} );

	changeNameButton.on( 'click', updateName );
	nameInput.on( 'enter', updateName );
} );
