/**
 * CollabProcessDialog - Dialog for hosting or joining a collab session
 *
 * @param {Object} [config] Configuration options
 */
ve.ui.CollabProcessDialog = function VeUiCollabProcessDialog( config ) {
	ve.ui.CollabProcessDialog.super.call( this, config );
};

OO.inheritClass( ve.ui.CollabProcessDialog, OO.ui.ProcessDialog );

ve.ui.CollabProcessDialog.static.name = null;

ve.ui.CollabProcessDialog.static.title = OO.ui.deferMsg( 'visualeditor-collab-dialog-title' );

ve.ui.CollabProcessDialog.static.imageUri = 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiBzdHlsZT0ic3Ryb2tlOiNjY2NjY2M7c3Ryb2tlLXdpZHRoOjY7c3Ryb2tlLWxpbmVjYXA6cm91bmQiPg0KIDxyZWN0IHN0eWxlPSJmaWxsOndoaXRlO3N0cm9rZTp3aGl0ZSIgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIC8+DQogPHBhdGggZD0iTSAzMCwzMEggNzciIC8+DQogPHBhdGggZD0iTSA5MCwzMEggMTM0IiAvPg0KIDxwYXRoIGQ9Ik0gMTQ3LDMwSCAyMjAiIC8+DQogPHBhdGggZD0iTSAzMCw1MEggMTY4IiBzdHlsZT0ic3Ryb2tlOiNmZmNiMzMiIC8+DQogPHBhdGggZD0iTSAxODAsNTBIIDIyMCIgLz4NCiA8cGF0aCBkPSJNIDMwLDcwSCAxMTUiIHN0eWxlPSJzdHJva2U6I2U4NTdjOCIgLz4NCiA8cGF0aCBkPSJNIDEyOCw3MEggMjIwIiAvPg0KIDxwYXRoIGQ9Ik0gMzAsOTBIIDQ3IiAvPg0KIDxwYXRoIGQ9Ik0gNjAsOTBIIDEzOCIgLz4NCiA8cGF0aCBkPSJNIDE1MSw5MEggMjIwIiBzdHlsZT0ic3Ryb2tlOiMwMGFmODkiIC8+DQogPHBhdGggZD0iTSAzMCwxMTBIIDIyMCIgLz4NCiA8cGF0aCBkPSJNIDMwLDEzMEggOTgiIC8+DQogPHBhdGggZD0iTSAxMTEsMTMwSCAyMjAiIC8+DQo8L3N2Zz4=';

ve.ui.CollabProcessDialog.prototype.initialize = function () {
	ve.ui.CollabProcessDialog.super.prototype.initialize.apply( this, arguments );

	this.content = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false
	} );
	this.button = new OO.ui.ButtonWidget( {
		label: this.label,
		icon: this.icon,
		title: this.title,
		flags: [ 'primary', 'progressive' ]
	} );
	this.button.$element[ 0 ].style.display = 'block';
	this.button.$element[ 0 ].firstElementChild.style.minWidth = '100%';

	this.content.$element.append(
		$( '<img>' ).prop( 'src', ve.ui.CollabProcessDialog.static.imageUri )
			.css( { display: 'block', margin: '2em auto' } ),
		$( '<p>' ).text( this.summary )
			.css( { 'font-weight': 'bold' } ),
		$( '<p>' ).text( OO.ui.msg( 'visualeditor-collab-dialog-sharing' ) ),
		$( '<p>' ).text( OO.ui.msg( 'visualeditor-collab-dialog-sessionend' ) ),
		$( '<p>' ).text( OO.ui.msg( 'visualeditor-collab-dialog-privacy' ) ),
		$( '<div>' ).append( this.button.$element )
	);
	this.$body.append( this.content.$element );
	this.button.on( 'click', this.close.bind( this, 'accept' ) );
};

ve.ui.CollabProcessDialog.prototype.getBodyHeight = function () {
	return this.content.$element.outerHeight( true );
};

/**
 * HostCollabProcessDialog - Dialog for hosting a new collab session
 *
 * @param {Object} [config] Configuration options
 */
ve.ui.HostCollabProcessDialog = function VeUiHostCollabProcessDialog( config ) {
	ve.ui.HostCollabProcessDialog.super.call( this, config );
	this.label = OO.ui.msg( 'visualeditor-collab-hostbutton-label' );
	this.icon = 'userAdd';
	this.title = 'Host';
	this.summary = OO.ui.msg( 'visualeditor-collab-dialog-summary-host' );
};

OO.inheritClass( ve.ui.HostCollabProcessDialog, ve.ui.CollabProcessDialog );

ve.ui.HostCollabProcessDialog.static.name = 'hostCollabDialog';

ve.ui.windowFactory.register( ve.ui.HostCollabProcessDialog );

/**
 * JoinCollabProcessDialog - Dialog for joining an existing collab session
 *
 * @param {Object} [config] Configuration options
 */
ve.ui.JoinCollabProcessDialog = function VeUiJoinCollabProcessDialog( config ) {
	ve.ui.JoinCollabProcessDialog.super.call( this, config );
	this.label = OO.ui.msg( 'visualeditor-collab-joinbutton-label' );
	this.icon = 'userGroup';
	this.title = 'Join';
	this.summary = OO.ui.msg( 'visualeditor-collab-dialog-summary-join' );
};

OO.inheritClass( ve.ui.JoinCollabProcessDialog, ve.ui.CollabProcessDialog );

ve.ui.JoinCollabProcessDialog.static.name = 'joinCollabDialog';

ve.ui.windowFactory.register( ve.ui.JoinCollabProcessDialog );
