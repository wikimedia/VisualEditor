
module.exports = function(HTML5) {
  var htmlparser;
  htmlparser = new HTML5.Parser;
  htmlparser.tree.elementInActiveFormattingElements = function(name) {
    var els, i;
    els = this.activeFormattingElements;
    i = els.length - 1;
    while (i >= 0) {
      if (els[i].type === HTML5.Marker.type) break;
      if (els[i].tagName.toLowerCase() === name) return els[i];
      i--;
    }
    return false;
  };
  htmlparser.tree.reconstructActiveFormattingElements = function() {
    var clone, element, entry, i;
    if (this.activeFormattingElements.length === 0) return;
    i = this.activeFormattingElements.length - 1;
    entry = this.activeFormattingElements[i];
    if (entry.type === HTML5.Marker.type || this.open_elements.indexOf(entry) !== -1) {
      return;
    }
    while (entry.type !== HTML5.Marker.type && this.open_elements.indexOf(entry) === -1) {
      i -= 1;
      entry = this.activeFormattingElements[i];
      if (!entry) break;
    }
    while (true) {
      i += 1;
      clone = this.activeFormattingElements[i].cloneNode();
      element = this.insert_element(clone.tagName, clone.attributes);
      this.activeFormattingElements[i] = element;
      if (element === this.activeFormattingElements.last()) break;
    }
  };
  return htmlparser;
};
