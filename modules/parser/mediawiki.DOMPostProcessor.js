/* Perform post-processing steps on an already-built HTML DOM. */

var isBlock = function isBlock (name) {
	switch (name.toLowerCase()) {
		case 'div':
		case 'table':
		case 'td':
		case 'tr':
		case 'tbody':
		case 'p':
		case 'ul':
		case 'ol':
		case 'li':
		case 'dl':
		case 'dt':
		case 'dd':
		case 'img': // hmm!
		case 'pre':
		case 'center':
		case 'blockquote':
			return true;
		default:
			return false;
	}
};

var process_inlines_in_p = function ( document ) {
		// document.body does not always work in jsdom
	var body = document.getElementsByTagName('body')[0],
		children = body.cloneNode(false),
		cnodes = body.childNodes,
		inlineStack = [];

	function wrapInlines (inlines) {
		var newp = document.createElement('p');
		for(var i = 0, length = inlines.length; i < length; i++) {
			newp.appendChild(inlines[i]);
		}
		body.appendChild(newp);
		inlineStack = [];
	}
	var i,
		length = cnodes.length;
	// Clear body
	for(i = 0; i < length; i++) {
		var cnode = body.firstChild;
		children.appendChild(cnode);
	}

	function isElementContentWhitespace ( e ) {
		return (e.data.match(/^[ \r\n\t]*$/) !== null);
	}

	// Now re-append all block elements and inline elements wrapped in
	// paragraphs.
	for(i = 0; i < length; i++) {
		var child = children.firstChild,
			ctype = child.nodeType;
		//console.log(child + ctype);
		if ((ctype === 3 && (inlineStack.length || !isElementContentWhitespace(child))) || 
					(ctype !== 3 && // text
					 ctype !== 8 && // comment
					 !isBlock(child.nodeName))) {
			// text node
			inlineStack.push(child);
		} else if (inlineStack.length) {
			wrapInlines(inlineStack);
			body.appendChild(child);
		} else {
			body.appendChild(child);
		}
	}

	if (inlineStack.length) {
		wrapInlines(inlineStack);
	}
};

function DOMPostProcessor () {
	this.processors = [process_inlines_in_p];
}

DOMPostProcessor.prototype.doPostProcess = function ( document ) {
	for(var i = 0; i < this.processors.length; i++) {
		this.processors[i](document);
	}
};


if (typeof module == "object") {
	module.exports.DOMPostProcessor = DOMPostProcessor;
}
