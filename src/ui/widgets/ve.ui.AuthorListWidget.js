/*!
 * VisualEditor AuthorInterface AuthorListWidget class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates a ve.ui.AuthorListWidget object.
 *
 * @class
 * @extends OO.ui.Element
 *
 * @constructor
 * @param {ve.dm.SurfaceSynchronizer} synchronizer Surface synchronizer
 * @param {Object} [config] Configuration options
 */
ve.ui.AuthorListWidget = function VeUiAuthorListWidget( synchronizer, config ) {

	var updatingName = false,
		nameInput = new OO.ui.TextInputWidget(),
		editNameLayout = new OO.ui.FieldLayout( nameInput, {
			classes: [ 've-ui-authorListWidget-editName' ],
			align: 'right',
			label: 'Name'
		} ),
		oldName = '',
		$authorList = $( '<div>' ),
		authorLabels = {},
		listPopup = new OO.ui.PopupButtonWidget( {
			classes: [ 've-ui-authorListWidget-listPopup' ],
			label: 'Users',
			indicator: 'down',
			popup: {
				label: 'Users',
				$content: $authorList,
				padded: true,
				align: 'center'
			}
		} );

	// Parent constructor
	ve.ui.AuthorListWidget.super.call( this, config );

	function updateName() {
		if ( !updatingName ) {
			synchronizer.changeName( nameInput.getValue() );
		}
	}

	synchronizer.on( 'authorNameChange', function ( authorId ) {
		var authorLabel = authorLabels[ authorId ],
			newName = synchronizer.authorNames[ authorId ];

		if ( !authorLabel ) {
			// FIXME use something more suitable than DecoratedOptionWidget
			authorLabel = new OO.ui.DecoratedOptionWidget( {
				classes: [ 've-ui-authorListWidget-author' ],
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
			$authorList.prepend( authorLabel.$element.addClass( 've-ui-authorListWidget-author-self' ) );
			// Don't update nameInput if the author is still changing it
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

	this.$element.addClass( 've-ui-authorListWidget' ).append(
		editNameLayout.$element,
		listPopup.$element
	);
};

/* Inheritance */

OO.inheritClass( ve.ui.AuthorListWidget, OO.ui.Widget );
