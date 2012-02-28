app = function () {
	var	_this = this,
		$document = $( document );

	this.$editor = $('#editor');

	this.$editor.bind( {
		'focus': function( e ) {
			$document.unbind( '.surfaceView' );
			$document.bind( {
				'keydown.surfaceView': function( e ) {
					return _this.onKeyDown( e );
				},
				'keyup.surfaceView': function( e ) {
					return _this.onKeyUp( e );
				},
				'keypress.surfaceView': function( e ) {
					return _this.onKeyPress( e );
				}
			} );
		},
		'blur': function( e ) {
			$document.unbind( '.surfaceView' );
		}
	} );
	
	document.addEventListener( 'compositionstart', function( e ) {
		_this.onCompositionStart( e );
	} );
	document.addEventListener( 'compositionend', function( e ) {
		_this.onCompositionEnd( e );
	} );

	this.$editor.mousedown( function(e) {
		return _this.onMouseDown( e );
	} );

	// Set initial content for the "editor"
//	this.$editor.html("<b>Lorem Ipsum is simply dummy text</b> of the printing and typesetting industry. <b>Lorem Ipsum has been the <i>industry's</i> standard</b> dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it <u>to <b>make <i>a type</i> specimen</b> book.</u>... New text...");
	this.$editor.html("This is a <span style='direction: rtl; unicode-bidi: bidi-override;'>bidirectional text</span> page. Let's see if this damn thing works!");
//	this.$editor.html("... <b>w</b>");
	this.$editor.addClass('leafNode');

	this.prevText = app.getDOMText2(this.$editor[0]);
	this.prevHash = app.getDOMHash(this.$editor[0]);
	this.prevOffset = null;
	this.inIME = false;

	setInterval(function() {
		_this.loopFunc();
	}, 100);		
};

app.prototype.onCompositionStart = function( e ) {
	console.log('inIME', true);
	this.inIME = true;
};

app.prototype.onCompositionEnd = function( e ) {
	console.log('inIME', false);
	this.inIME = false;
};

app.prototype.onKeyDown = function( e ) {
};

app.prototype.onKeyUp = function( e ) {
};

app.prototype.onKeyPress = function( e ) {
};

app.prototype.onMouseDown = function( e ) {
};

app.prototype.loopFunc = function() {
	var selection = rangy.getSelection();

	if ( !selection.anchorNode || selection.anchorNode.nodeName === 'BODY' ) {
		return;
	}
	
	if ( this.inIME === true ) {
		return;
	}

	var	text = app.getDOMText2( this.$editor[0] ),
		hash = app.getDOMHash( this.$editor[0] ),
		offset = ( selection.anchorNode === selection.focusNode && selection.anchorOffset === selection.focusOffset ) ?  this.getOffset( selection.anchorNode, selection.anchorOffset ) : null;

	if ( text !== this.prevText ) {

		var	lengthDiff = text.length - this.prevText.length,
			offsetDiff = offset - this.prevOffset;

		if ( lengthDiff === offsetDiff && offset !== null && this.prevOffset !== null && this.prevText.substring( 0, this.prevOffset ) === text.substring( 0, this.prevOffset ) ) {
			console.log("new text", text.substring( this.prevOffset, offset ), this.prevOffset);
		} else {
			var	sameFromLeft = 0,
				sameFromRight = 0,
				l = text.length > this.prevText.length ? this.prevText.length : text.length; 

			while ( sameFromLeft < l && this.prevText[sameFromLeft] == text[sameFromLeft] ) {
				++sameFromLeft;
			}
			l = l - sameFromLeft;
            while ( sameFromRight < l && this.prevText[this.prevText.length - 1 - sameFromRight] == text[text.length - 1 - sameFromRight] ) {
                ++sameFromRight;
			}
			console.log('sameFromLeft', sameFromLeft);
			console.log('sameFromRight', sameFromRight);
			console.log('to delete', this.prevText.substring( sameFromLeft, this.prevText.length - sameFromRight), sameFromLeft );
			console.log('to insert', text.substring( sameFromLeft, text.length - sameFromRight ), sameFromLeft );			
		}
		this.prevText = text;
	}
	
	if ( hash !== this.prevHash ) {
		console.log("DOM hash is different");
		this.prevHash = hash;
	}
	
	this.prevOffset = offset;

};

app.getDOMText2 = function( elem ) {
	var regex = new RegExp("[" + String.fromCharCode(32) + String.fromCharCode(160) + "]", "g");		
	return app.getDOMText( elem ).replace( regex, " " );
};

app.getDOMText = function( elem ) {
    var nodeType = elem.nodeType,
        ret = '';

    if ( nodeType === 1 || nodeType === 9 ) {
        // Use textContent || innerText for elements
        if ( typeof elem.textContent === 'string' ) {
            return elem.textContent;
        } else if ( typeof elem.innerText === 'string' ) {
            // Replace IE's carriage returns
            return elem.innerText.replace( /\r\n/g, '' );
        } else {
            // Traverse it's children
            for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
                ret += app.getDOMText( elem );
            }
        }
    } else if ( nodeType === 3 || nodeType === 4 ) {
        return elem.nodeValue;
    }

    return ret;
};

app.getDOMHash = function( elem ) {
    var nodeType = elem.nodeType,
    	nodeName = elem.nodeName,
        ret = '';

	if ( nodeType === 3 || nodeType === 4 ) {
		return '#';
	} else if ( nodeType === 1 || nodeType === 9 ) {
		ret += '<' + nodeName + '>';
		for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
        	ret += app.getDOMHash( elem );
        }
        ret += '</' + nodeName + '>';
	}
	return ret;
};

app.prototype.getOffset = function( localNode, localOffset ) {
	var $node = $( localNode );

	if ( $node.hasClass( 'leafNode' ) ) {
		return localOffset;
	}
	
	while( !$node.hasClass( 'leafNode' ) ) {
		$node = $node.parent();
	}
	
	var current = [$node.contents(), 0];
	var stack = [current];
	
	var offset = 0;
	
	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		var item = current[0][current[1]];
		var $item = current[0].eq( current[1] );
		
		if ( item.nodeType === 3 ) {
			if ( item === localNode ) {
				offset += localOffset;
				break;
			} else {
				offset += item.textContent.length;
			}
		} else if ( item.nodeType === 1 ) {
			if ( $( item ).attr('contentEditable') === "false" ) {
				offset += 1;
			} else {
				if ( item === localNode ) {
					offset += localOffset;
					break;
				}
			
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}

	return offset;
};

$(function() {
	new app();
});
