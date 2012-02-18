module.exports = function (HTML5) {
    var htmlparser = new HTML5.Parser();
    htmlparser.tree.elementInActiveFormattingElements = function(name) {
        var els = this.activeFormattingElements;
        for(var i = els.length - 1; i >= 0; i--) {
                if(els[i].type == HTML5.Marker.type) break;
                if(els[i].tagName.toLowerCase() == name) return els[i];
        }
        return false;
    };
    htmlparser.tree.reconstructActiveFormattingElements = function() {
	// Within this algorithm the order of steps decribed in the specification
	// is not quite the same as the order of steps in the code. It should still
	// do the same though.

	// Step 1: stop if there's nothing to do
	if(this.activeFormattingElements.length == 0) return;

	// Step 2 and 3: start with the last element
	var i = this.activeFormattingElements.length - 1;
	var entry = this.activeFormattingElements[i];
	if(entry.type == HTML5.Marker.type || this.open_elements.indexOf(entry) != -1) return;

	while(entry.type != HTML5.Marker.type && this.open_elements.indexOf(entry) == -1) {
		i -= 1;
		entry = this.activeFormattingElements[i];
		if(!entry) break;
	}

	while(true) {
		i += 1;
		var clone = this.activeFormattingElements[i].cloneNode();

		var element = this.insert_element(clone.tagName, clone.attributes);

		this.activeFormattingElements[i] = element;

		if(element == this.activeFormattingElements.last()) break;
	}
    };

    return htmlparser;
};
