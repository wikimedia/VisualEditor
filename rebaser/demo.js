/*!
 * VisualEditor rebaser demo
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

new ve.init.sa.Platform( ve.messagePaths ).initialize().done( function () {
	var synchronizer,
		updatingName = false,
		$editor = $( '.ve-demo-editor' ),
		$menu = $( '.ve-pad-menu' ),
		nameInput = new OO.ui.TextInputWidget(),
		editNameLayout = new OO.ui.FieldLayout( nameInput, { align: 'right', label: 'Name' } ),
		oldName = '',
		$authorList = $( '<div>' ),
		authorLabels = {},
		userPopup = new OO.ui.PopupButtonWidget( {
			label: 'Users',
			indicator: 'down',
			popup: {
				label: 'Users',
				$content: $authorList,
				padded: true,
				align: 'center'
			}
		} ),
		// eslint-disable-next-line new-cap
		target = new ve.demo.target();

	function updateName() {
		if ( !updatingName ) {
			synchronizer.changeName( nameInput.getValue() );
		}
	}

	$menu.append(
		editNameLayout.$element,
		userPopup.$element
	);

	$editor.append( target.$element );

	target.addSurface( ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( '' ) ) );
	synchronizer = new ve.dm.SurfaceSynchronizer( target.surface.model, ve.docName );
	target.surface.view.setSynchronizer( synchronizer );

	synchronizer.on( 'authorNameChange', function ( authorId ) {
		var authorLabel = authorLabels[ authorId ],
			newName = synchronizer.authorNames[ authorId ];

		if ( !authorLabel ) {
			// FIXME use something more suitable than DecoratedOptionWidget
			authorLabel = new OO.ui.DecoratedOptionWidget( {
				classes: [ 've-pad-menu-author' ],
				// HACK: force the icon to show, but override the background with a color
				icon: 'none'
			} );
			authorLabel.$icon.css( 'background', '#' + synchronizer.constructor.static.getAuthorColor( authorId ) );
			authorLabels[ authorId ] = authorLabel;
			$authorList.append( authorLabel.$element );
		}
		authorLabel.setLabel( newName );
		if ( authorId === synchronizer.author ) {
			// Ensure you are at the top of the list
			$authorList.prepend( authorLabel.$element.addClass( 've-pad-menu-author-self' ) );
			// Don't update nameInput if the user is still changing it
			if ( nameInput.getValue() === oldName ) {
				// Don't send this "new" name back to the server
				updatingName = true;
				nameInput.setValue( newName );
				updatingName = false;
			}
		}
		oldName = newName;
	} );

	synchronizer.on( 'authorDisconnect', function ( authorId ) {
		var authorLabel = authorLabels[ authorId ];
		if ( authorLabel ) {
			authorLabel.$element.remove();
			delete authorLabels[ authorId ];
		}
	} );

	nameInput.on( 'change', ve.debounce( updateName, 250 ) );
} );
