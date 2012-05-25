/*
	ve.Core.js
*/
(function( mw, $ ){
	
	veCore = function(){
		var _this = this,
			pageName = mw.config.get( 'wgPageName' ),
			validNamespace = mw.config.get('wgCanonicalNamespace') === 'VisualEditor' ? true: false;

		this.$content = $('#content');

		this.$spinner = $('<div />')
			.attr({
				'id': 've-loader-spinner',
				'class': 'mw-ajax-loader'
			}).css({
				'height': this.$content.height() + 'px',
				'width': (this.$content.width() -20 ) + 'px'
			});

		// On VisualEditor namespace ?
		if ( validNamespace ) {
			$('#ca-edit > span > a').click( function( e ){
				// hijack the edit link
				e.preventDefault();
				$('#ca-view').removeClass('selected');
				$('#ca-edit').addClass('selected');

				_this.showSpinner();
				// async init
				mw.loader.using( 'ext.visualEditor.ve', function(){
					_this.init();
				});
				_this.parsoidGetHTML( pageName, function( content ){
					_this.init( content );
				});

			});
		} //valid namespace
	};

	veCore.prototype.init = function( html ) {
		var _this = this;
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
						/* What modes this toolbar will have */
						modes: ['wikitext']
					}
				}
			};
			$editor = $('<div id="ve-editor"></div>');
			this.$spinner.hide();
			this.$content.append( $editor );
			this.mainEditor = new ve.Surface( '#ve-editor', $html[0], options );

			// Save BTN
			$editor.find('.es-modes').append(
				$('<div />')
					.text('Save')
					.click(function(){
						_this.showSpinner();
						// Save
						_this.parsoidGetWikitextAndSave(function( content ){
							// cleanup
							_this.cleanup();
							// load saved page
							_this.$content
								.find('#mw-content-text').html( content );
						});
					})
			);
		}
	};

	veCore.prototype.showSpinner = function(){
		var _this = this;
		//remove it
		_this.$spinner.remove();
		//hide all of the #content element children
		_this.$content.children().each(function(){
			$(this).hide();
		});
		_this.$content.append(
			_this.$spinner.show()
		);
	};

	veCore.prototype.cleanup = function(){
		$('#ve-editor').remove();
		$('#ve-loader-spinner').remove();
		$('#ca-view').addClass('selected');
		$('#ca-edit').removeClass('selected');
		this.$content
			.find('#mw-content-text, #bodyContent, #firstHeading').show();
	};

	veCore.prototype.parsoidGetHTML = function (title, callback) {
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
	veCore.prototype.parsoidGetWikitextAndSave = function (callback) {
		// TODO: get html from linmod converter
		var data = this.mainEditor.documentModel.getData(),
			html = "<p>Visual Editor test page</p>",
			summary = 'Page edit by Visual Editor';

		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action': 've-parsoid',
				'paction': 'save',
				'page': mw.config.get( 'wgPageName' ),
				'html': html,
				'token': mw.user.tokens.get('editToken'),
				'summary': summary,
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

})(window.mw, jQuery);