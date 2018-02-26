/*!
 * VisualEditor UserInterface AuthorListPopupTool class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface AuthorListPopupTool
 *
 * @class
 * @extends OO.ui.PopupTool
 *
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config]
 */
ve.ui.AuthorListPopupTool = function VeUiAuthorListPopupTool( toolGroup, config ) {
	this.$authorList = $( '<div>' );

	// Parent constructor
	ve.ui.AuthorListPopupTool.super.call( this, toolGroup, ve.extendObject( {
		popup: {
			classes: [ 've-ui-authorListWidget-listPopup' ],
			$content: this.$authorList,
			padded: true,
			align: 'center'
		}
	}, config ) );

	// Events
	this.toolbar.connect( this, { surfaceChange: 'onSurfaceChange' } );

	this.$element.addClass( 've-ui-authorListPopupTool' );
};

/* Inheritance */

OO.inheritClass( ve.ui.AuthorListPopupTool, OO.ui.PopupTool );

/* Methods */

ve.ui.AuthorListPopupTool.prototype.onSurfaceChange = function ( oldSurface, newSurface ) {
	this.setup( newSurface );
};

/**
 * Setup the popup which a specific surface
 *
 * @param {ve.ui.Surface} surface Surface
 */
ve.ui.AuthorListPopupTool.prototype.setup = function ( surface ) {
	var debounceSynchronizerChangeName,
		tool = this,
		synchronizer = surface.getView().synchronizer,
		updatingName = false,
		oldName = '',
		authorItems = {};

	// TODO: Unbind from an existing surface if one is set

	function updateName() {
		if ( !updatingName ) {
			debounceSynchronizerChangeName();
		}
	}

	debounceSynchronizerChangeName = ve.debounce( function () {
		synchronizer.changeName( tool.selfItem.input.getValue() );
	}, 250 );

	function updateListCount() {
		tool.setTitle( ( Object.keys( authorItems ).length + 1 ).toString() );
	}

	this.selfItem = new ve.ui.AuthorItemWidget( synchronizer, this.popup.$element, { editable: true } );
	this.$authorList.prepend( this.selfItem.$element );
	this.selfItem.input.on( 'change', updateName );

	synchronizer.on( 'authorNameChange', function ( authorId ) {
		var authorItem = authorItems[ authorId ],
			newName = synchronizer.authorNames[ authorId ];

		if ( authorId !== synchronizer.getAuthorId() ) {
			if ( !authorItem ) {
				authorItem = new ve.ui.AuthorItemWidget( synchronizer, tool.popup.$element, { authorId: authorId } );
				authorItems[ authorId ] = authorItem;
				updateListCount();
				tool.$authorList.append( authorItem.$element );
			} else {
				authorItem.update();
			}
		} else {
			// Don't update nameInput if the author is still changing it
			if ( tool.selfItem.input.getValue() === oldName ) {
				// Don't send this "new" name back to the server
				updatingName = true;
				try {
					tool.selfItem.setAuthorId( synchronizer.getAuthorId() );
					tool.selfItem.update();
				} finally {
					updatingName = false;
				}
			}
		}
		oldName = newName;
	} );

	synchronizer.on( 'authorDisconnect', function ( authorId ) {
		var authorItem = authorItems[ authorId ];
		if ( authorItem ) {
			authorItem.$element.remove();
			delete authorItems[ authorId ];
			updateListCount();
		}
	} );
};

/* Static Properties */

ve.ui.AuthorListPopupTool.static.name = 'authorList';
ve.ui.AuthorListPopupTool.static.group = 'utility';
ve.ui.AuthorListPopupTool.static.icon = 'userAvatar';
ve.ui.AuthorListPopupTool.static.title = '1';
ve.ui.AuthorListPopupTool.static.autoAddToCatchall = false;
ve.ui.AuthorListPopupTool.static.autoAddToGroup = false;
ve.ui.AuthorListPopupTool.static.displayBothIconAndLabel = true;

/* Registration */

ve.ui.toolFactory.register( ve.ui.AuthorListPopupTool );
