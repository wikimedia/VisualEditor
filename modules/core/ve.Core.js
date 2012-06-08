/*
	VisualEditor Core Module for MediaWiki.org integration
*/
(function( mw, $ ){
	
	veCore = function(){
		var _this = this,
			pageName = mw.config.get( 'wgPageName' ),
			validNamespace = mw.config.get('wgCanonicalNamespace') === 'VisualEditor' ? true: false;

		this.mainEditor = null;
		// On VisualEditor namespace ?
		if ( validNamespace ) {
			this.$content = $('#content');
			this.setupTabs();
			// modify / stash content styles
			this.prepareContentStyles();
			$('#ca-edit > span > a').click( function( e ){
				// hijack the edit link
				e.preventDefault();
				// Load Editor if not already loaded
				if( _this.mainEditor === null ) {
					_this.selectTab( 'ca-edit' );
					_this.showSpinner();
					// async init
					mw.loader.using( 'ext.visualEditor.ve', function(){
						_this.init();
					});
					_this.getParsoidHTML( pageName, function( content ){
						_this.init( content );
					});
				}

			});
		} //valid namespace
	};

	// called once for each asnyc callback.
	// once ve is loaded and page has been parsed into html, continue init
	veCore.prototype.init = function( html ) {
		var _this = this,
			isMobileDevice =
				('ontouchstart' in window) ||
				window.DocumentTouch && document instanceof DocumentTouch ||
				false;

		// store the html
		if (typeof html !== 'undefined') {
			this.html = html;
		}
		// if html and ve are loaded
		if(
			typeof ve !== 'undefined' &&
			typeof this.html !== 'undefined'
		){
			$html = $("<div />")
				.html( this.html );

			// release this.html
			delete this.html;

			var options = {
				toolbars: {
					top: {
						// If mobile device, float false
						'float': !isMobileDevice,
						// Toolbar modes
						'modes': ['wikitext']
					}
				}
			};
			this.$editor = $('<div id="ve-editor"></div>');
			this.$spinner.hide();
	
			this.$content.css({
				'padding':'0px 0px 0px 1px'
			}).append( this.$editor );
				

			this.mainEditor = new ve.Surface( '#ve-editor', $html[0], options );

			this.$editor.find('.es-panes')
				.css('padding', this.contentStyles.padding );

			// Save BTN
			this.$editor.find('.es-modes')
				.append(
					$('<div />')
						.attr('class', 've-action-button es-inspector-savebutton')
						.text('Save')
						.click(function(){
							// show/hide dialog
							_this.$dialog.toggle();
						})
				).append(
					$('<div />')
						.attr('class', 've-action-button ve-closeBtn')
						.click(function(){
							// back to read mode
							_this.mainEditor = null;
							_this.cleanup();
						})
			);
			this.initSaveDialog();
		}
	};

	veCore.prototype.setupTabs = function(){
		//Non admins shouldn't have an edit button, only ca-viewsource
		var $viewsource;

		// If no edit button, user not sysop
		if ( $('#ca-edit').length === 0 ) {
			// Add Edit button
			mw.util.addPortletLink(
				'p-views',
				'#',
				mw.msg('edit'),
				'ca-edit',
				mw.msg('tooltip-ca-edit'),
				mw.msg('accesskey-ca-edit'),
				'#ca-history'
			);
			// Create 'View Source' link in sub menu from original.
			// Remove original
			$viewsource = $('#ca-viewsource');
			if ($viewsource.length > 0) {
				// if admin, move this to the p-cactions link
				mw.util.addPortletLink(
					'p-cactions',
					$viewsource.find('span > a').attr('href'),
					$viewsource.find('span > a').text(),
					$viewsource.attr('id')
				);
				$viewsource.remove();
			}
		} else {
			// admin user, create an edit source link
			mw.util.addPortletLink(
				'p-cactions',
				mw.util.wikiGetlink() + '?action=edit',
				'Edit Source', // TODO: i18n
				'ca-editsource'
			);

		}
	};

	// Reset tabs, select tab with tabID
	// #ca-view, #ca-edit, #ca-history
	veCore.prototype.selectTab = function( tabID ){
		// unselects all tabs, selects sel
		$('#p-views')
			.find('ul')
			.children()
			.each(function(){
				if( $(this).attr('id') === tabID ) {
					$(this).addClass('selected');
				} else {
					$(this).removeClass('selected');
				}
			});
	};

	veCore.prototype.save = function(){
		var _this = this;
		_this.showSpinner();
		// Save
		_this.getParsoidWikitextAndSave( function( content ){
			// cleanup
			_this.$dialog.slideUp();
			// load saved page
			_this.$content
				.find('#mw-content-text').html( content );
			_this.cleanup();
		});
	};

	veCore.prototype.initSaveDialog = function(){
		var _this = this;
		this.$dialog =
			$('<div />')
				.attr({
					'id': 've-saveDialog',
					'class': 'es-inspector'
				}).append(
					$('<div />')
						.attr('class', 'es-inspector-title')
						.text( mw.msg('tooltip-save') )
				).append(
					$('<div />')
						.attr('class', 'es-inspector-button ve-saveBtn')
						.click(function(){
							_this.$dialog.toggle();
						})
				).append(
					$('<div />')
						.attr('class', 've-dialog-divider')
						.append(
							$('<div />')
								.text("Describe what you changed")
								//.text( mw.msg('summary') )
						).append(
							$('<input />')
								.attr({
									'id': 'txtEditSummary',
									'type':'text'
								})
						).append(
							$('<br />')
						).append(
							$('<div />')
								.attr('class', 've-dialog-left')
								.append(
									$('<input />')
										.attr({
											'type': 'checkbox',
											'name': 'chkMinorEdit',
											'id': 'chkMinorEdit'
										})
								).append(
									$('<label />')
										.attr('for', 'chkMinorEdit')
										.text( mw.msg('minoredit') )
								).append(
									$('<br />')
								).append(
									$('<input />')
										.attr({
											'type': 'checkbox',
											'name': 'chkWatchlist',
											'id': 'chkWatchlist'
										}).prop(
											'checked',
											mw.config.get('vePageWatched')
										)
								).append(
									$('<label />')
										.attr('for', 'chkWatchlist')
										.text( mw.msg('watchthis') )
								)
							).append(
								$('<div />')
									.attr('class', 've-action-button es-inspector-savebutton doSaveBtn')
									.text( mw.msg('savearticle') )
									.click(function(){
										_this.save();
									})
									.append(
										$('<div />')
											.attr('class', 'doSaveBtnIcon')
									)
							).append(
								$('<br />')
							)
				).append(
					$('<div />')
						.attr('class', 've-dialog-divider')
						.append(
							$("<p />")
								// TODO: i18n
								.html(
									"By editing this page, you agree to irrevocably release your \
									contributions under the CC-By-SA 3.0 License.  If you don't \
									want your writing to be editied mercilessly and redistrubuted \
									at will, then don't submit it here.  <br /><br />You are also \
									confirming that you wrote this yourself, or copied it from a \
									public domain or similar free resource.  See Project:Copyright \
									for full details of the licenses used on this site.  \
									<b>DO NOT SUBMIT COPYRIGHTED WORK WITHOUT PERMISSION!</b>"
								)
						)
				);
		this.$editor
			.find('.es-inspector-savebutton')
			.after ( this.$dialog );

	};

	veCore.prototype.showSpinner = function(){
		var _this = this;
		
		this.$spinner = $('<div />')
			.attr({
				'id': 've-loader-spinner',
				'class': 'mw-ajax-loader'
			}).css({
				'height': this.$content.height() + 'px',
				'width': (this.$content.width() -20 ) + 'px'
			});

		_this.$spinner.remove();
		//hide all of the #content element children
		_this.$content
			.children()
			.each(function(){
				$(this).hide();
		});
		_this.$content.append(
			_this.$spinner.show()
		);
	};

	/*  Make a backup of the #content div styles
		In order to tuck the toolbar close under the tabs,
		We need to change the padding before inserting the toolbar
		Additionally, the transitions must be removed so that
		when adjusting the padding, there is no animated transition.
	*/
	veCore.prototype.prepareContentStyles = function(){
		// Store Padding and transitions
		this.contentStyles = {
			'padding': this.$content.css('padding'),
			'transition': this.$content.css('transition'),
			'transition-property': this.$content.css('transition-property'),
			'-moz-transition': this.$content.css('-moz-transition'),
			'-webkit-transition': this.$content.css('-webkit-transition'),
			'-o-transition': this.$content.css('-o-transition')
		};
		// Squash transitions
		this.$content.css({
			'transition': 'none',
			'transition-property': 'none',
			'-moz-transition': 'none',
			'-webkit-transition': 'none',
			'-o-transition': 'color 0 ease-in'
		});
	};

	//back to view
	veCore.prototype.cleanup = function(){
		this.mainEditor = null;
		this.selectTab( 'ca-view' );
		this.$content
			.find('#mw-content-text, #bodyContent, #firstHeading').show()
			.end()
			.find('#ve-editor, #ve-loader-spinner').remove()
			.end()
			//.css( this.contentStyles );
			// only put back padding for now, ideally restore transition css though
			.css('padding', this.contentStyles.padding);
	};

	veCore.prototype.getParsoidHTML = function (title, callback) {
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action': 've-parsoid',
				'paction': 'parse',
				'page': mw.config.get( 'wgPageName' ),
				'format': 'json'
			},
			dataType: 'json',
			type: 'GET',
			cache: 'false',
			timeout: 9000, //wait up to 9 seconds
			success: function( data ) {
				if (data && data['ve-parsoid'] && data['ve-parsoid'].parsed ) {
					if( typeof callback === 'function') {
						callback( data['ve-parsoid'].parsed );
					}
				}
			},
			error: function( error ) {}
		});
	};
/*
	Posts HTML to Parsoid Wrapper API
	API Posts HTML to Parsoid Service, receives Wikitext,
	API Saves Wikitext to page.
	Returns new page content
*/
	veCore.prototype.getParsoidWikitextAndSave = function( callback ) {
		var data = this.mainEditor.documentModel.getData(),
			html = ve.dm.converter.getDomFromData( data ),
			summary = $('#txtEditSummary').val(),
			minor = $('#chkMinorEdit').prop('checked'),
			watch = $('#chkWatchlist').prop('checked');

		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action': 've-parsoid',
				'paction': 'save',
				'page': mw.config.get( 'wgPageName' ),
				'html': html,
				'token': mw.user.tokens.get('editToken'),
				'summary': summary,
				'minor': minor,
				'watch': watch,
				'format': 'json'
			},
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				if (
					data &&
					data['ve-parsoid'] &&
					data['ve-parsoid'].result &&
					data['ve-parsoid'].result === 'success' &&
					data['ve-parsoid'].content
				) {
					//saved
					callback( data['ve-parsoid'].content );
				}
			},
			error: function( error ) {}
		});
	};

	/* Gets HTML for a page from MW API action parse */
	veCore.prototype.getParsedPage = function( title, callback ) {
		//currently using mw api to get
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action': 'parse',
				'format': 'json',
				'page': title
			},
			dataType: 'json',
			type: 'GET',
			cache: 'false',
			success: function( data ) {
				if ( data && data.parse && data.parse.text ) {
					// return pages to callback
					if( typeof callback === 'function') {
						callback( data.parse.text['*'] );
					}
				}
			},
			error: function() {
				if( typeof callback === 'function') {
					callback();
				}
			}
		});
	};

	var core = new veCore();

})( window.mw, jQuery );