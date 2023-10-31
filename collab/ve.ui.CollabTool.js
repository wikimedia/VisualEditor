/*!
 * VisualEditor collab tool class.
 *
 * @copyright 2011-2023 VisualEditor Team and others; see http://ve.mit-license.org
 */

ve.ui.CollabTool = function VeUiCollabTool() {
	ve.ui.CollabTool.super.apply( this, arguments );
};

OO.inheritClass( ve.ui.CollabTool, OO.ui.Tool );

ve.ui.CollabTool.static.name = 'collab';

ve.ui.CollabTool.static.group = 'collab';

ve.ui.CollabTool.static.icon = 'userGroup';

ve.ui.CollabTool.static.title = 've.collab';

ve.ui.CollabTool.static.autoAddToCatchall = false;

ve.ui.CollabTool.static.displayBothIconAndLabel = true;

ve.ui.CollabTool.prototype.onUpdateState = function () {
};

ve.ui.CollabTool.prototype.onToolbarResize = function () {
};

ve.ui.CollabTool.prototype.onSelect = function () {
	this.setActive( false );
	ve.collab.start();
};

ve.ui.toolFactory.register( ve.ui.CollabTool );
