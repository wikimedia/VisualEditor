/* Perform post-processing steps on an already-built HTML DOM. */

var events = require('events'),
	util = require('./ext.Util.js'),
	Util = new util.Util();

// Quick HACK: define Node constants
// https://developer.mozilla.org/en/nodeType
var Node = {
	TEXT_NODE: 3,
	COMMENT_NODE: 8
};

var isElementContentWhitespace = function ( e ) {
	return (e.data.match(/^[ \r\n\t]*$/) !== null);
};

// [..., T1[T2[*x]], T2[*y], ...] ==> [..., T2[T1[*x], *y], ...]
// [..., T2[*x], T1[T2[*y]], ...] ==> [..., T2[*x, T1[*y]], ...]
// where T1 and T2 are different and can be one of [i, b]
//
// Strictly speaking, we can rewrite even when T1 has more than one child as long as all of them are T2's
// but for now, we are going to restrict ourselves to a single child.
var tag_pair_map = null;
var rewrite_nested_tag_pairs = function(document, tag_pairs, node) {
	function init_tag_pairs(tag_pairs) {
		tag_pair_map = {};
		for (var i = 0, n = tag_pairs.length; i < n; i++) {
			// Ex: t1 = 'b', t2 = 'i'
			var p   = tag_pairs[i];
			var t1 = p[0];
			var t2 = p[1];

			// Update map with {t1: t2}
			var t1_tags = tag_pair_map[t1];
			if (t1_tags === undefined) {
				t1_tags = [];
				tag_pair_map[t1] = t1_tags;
			}
			t1_tags.push(t2);

			// Update map with {t2: t1}
			var t2_tags = tag_pair_map[t2];
			if (t2_tags === undefined) {
				t2_tags = [];
				tag_pair_map[t2] = t2_tags;
			}
			t2_tags.push(t1);
		}
	}

	function migrate_all_children(src, tgt) {
		var children = src.childNodes;
		for (var i = 0, n = children.length; i < n; i++) {
			// IMPORTANT: Always use index 0 to get the item at the top of the list.
			// Do not use children[i] because as you append a child to 'tgt', they
			// also get pulled out of the children list!
			tgt.appendChild(children.item(0));
		}
	}

	function copy_attributes(src, tgt) {
		var attrs = src.attributes;
		for (var i = 0, n = attrs.length; i < n; i++) {
			var a = attrs.item(i);
			tgt.setAttribute(a.nodeName, a.nodeValue);
		}
	}

	function rewriteable_tag_pair(t1, t2) {
		// SSS FIXME: I dont think this check is sufficient.  We also need to
		// verify that nodes having these tags t1 and t2 are deletable as well.
		var t1_tags = tag_pair_map[t1];
		if (t1_tags !== undefined) {
			for (var i = 0, n = t1_tags.length; i < n; i++)
				if (t1_tags[i] === t2) return true;
		}
		return false;
	}

	// Initialization
	if (tag_pair_map === null) init_tag_pairs(tag_pairs);

	var children     = node.childNodes;
	var num_children = children.length;

	// no re-writing possible
	if (num_children < 2) return;

	// look for the pattern
	for (var i = 0, n = num_children-1; i < n; i++) {
		var child   = children[i];
		var sibling = children[i+1];
		var t1 = child.nodeName.toLowerCase();
		var t2 = sibling.nodeName.toLowerCase();
		if (rewriteable_tag_pair(t1, t2)) {
			var newChild = null, newGrandChild = null;
			if (child.childNodes.length == 1 && child.childNodes[0].nodeName.toLowerCase() == t2) {
				// rewritable
				newChild      = document.createElement(t2);
				newGrandChild = document.createElement(t1);

				newChild.appendChild(newGrandChild);
				migrate_all_children(sibling, newChild);
				migrate_all_children(child.childNodes[0], newGrandChild);

				copy_attributes(child, newGrandChild);
				copy_attributes(sibling, newChild);
			} else if (sibling.childNodes.length == 1 && sibling.childNodes[0].nodeName.toLowerCase() == t1) {
				// rewritable
				newChild      = document.createElement(t1);
				newGrandChild = document.createElement(t2);

				migrate_all_children(child, newChild);
				migrate_all_children(sibling.childNodes[0], newGrandChild);
				newChild.appendChild(newGrandChild);

				copy_attributes(child, newChild);
				copy_attributes(sibling, newGrandChild);
			}

			// modify DOM here
			if (newChild !== null) {

				node.insertBefore(newChild, child);
				node.removeChild(child);
				node.removeChild(sibling);

				// modify indexes
				n--;

				// Reprocess newChild
				rewrite_nested_tag_pairs(document, tag_pairs, newChild);

				// Revisit the new node and see if it will merge with its sibling.
				// Hence the decrement.
				i--;
			}
		}
	}
};

// Rewrite rules currently implemented:
// 1. [..., T1[T2[*x]], T2[*y], ...] ==> [..., T2[T1[*x], *y], ...]
//
// Other possible rewrite rules:
// 2. [..., T1[T2[*x]], ...]   ==> [..., T2[T1[*x], ...]
// 3. [..., T[*x], T[*y], ...] ==> [..., T[*x,*y], ...]
//
// Note: Rewriting 2. and 3. in that sequence will effectively yield 1.
// but implementing 1. directly is faster
//
// Not sure we want to implement all kinds of rewriting rules yet.
// We have to figure out what rules are worth implementing.
var normalize_subtree = function(node, rewrite_rules) {
	if (rewrite_rules.length === 0) return;

	var children = node.childNodes;
	for(var i = 0, length = children.length; i < length; i++) {
		normalize_subtree(children[i], rewrite_rules);
	}

	for (var j = 0, num_rules = rewrite_rules.length; j < num_rules; j++) {
		rewrite_rules[j](node);
	}
};

var normalize_document = function(document) {
	normalize_subtree(document.body, [rewrite_nested_tag_pairs.bind(null, document, [['b','i'], ['b','u'], ['i','u']])]);
};

// Wrap all top-level inline elements in paragraphs. This should also be
// applied inside block-level elements, but in that case the first paragraph
// usually remains plain inline.
var process_inlines_in_p = function ( document ) {
	var body = document.body,
		newP = document.createElement('p'),
		cnodes = body.childNodes,
		inParagraph = false,
		deleted = 0;

	for(var i = 0, length = cnodes.length; i < length; i++) {
		var child = cnodes[i - deleted],
			ctype = child.nodeType;
		//console.warn(child + ctype);
		if ((ctype === 3 && (inParagraph || !isElementContentWhitespace( child ))) || 
			(ctype === Node.COMMENT_NODE && inParagraph ) ||
			(ctype !== Node.TEXT_NODE && 
				ctype !== Node.COMMENT_NODE &&
				!Util.isBlockTag(child.nodeName.toLowerCase()))
			) 
		{
			// wrap in paragraph
			newP.appendChild(child);
			inParagraph = true;
			deleted++;
		} else if (inParagraph) {
			body.insertBefore(newP, child);
			deleted--;
			newP = document.createElement('p');
			inParagraph = false;
		}
	}

	if (inParagraph) {
		body.appendChild(newP);
	}
};

function DOMPostProcessor () {
	this.processors = [process_inlines_in_p, normalize_document];
}

// Inherit from EventEmitter
DOMPostProcessor.prototype = new events.EventEmitter();
DOMPostProcessor.prototype.constructor = DOMPostProcessor;

DOMPostProcessor.prototype.doPostProcess = function ( document ) {
	for(var i = 0; i < this.processors.length; i++) {
		this.processors[i](document);
	}
	this.emit( 'document', document );
};


/**
 * Register for the 'document' event, normally emitted from the HTML5 tree
 * builder.
 */
DOMPostProcessor.prototype.addListenersOn = function ( emitter ) {
	emitter.addListener( 'document', this.doPostProcess.bind( this ) );
};

if (typeof module == "object") {
	module.exports.DOMPostProcessor = DOMPostProcessor;
}
