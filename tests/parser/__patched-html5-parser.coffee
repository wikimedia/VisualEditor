module.exports = (HTML5) ->
  htmlparser = new HTML5.Parser

  htmlparser.tree.elementInActiveFormattingElements = (name) ->
    els = @activeFormattingElements
    i = els.length - 1
    while i >= 0
      break  if els[i].type is HTML5.Marker.type
      return els[i]  if els[i].tagName.toLowerCase() is name
      i--
    return false

  htmlparser.tree.reconstructActiveFormattingElements = ->
    return  if @activeFormattingElements.length is 0
    i = @activeFormattingElements.length - 1
    entry = @activeFormattingElements[i]
    return  if entry.type is HTML5.Marker.type or @open_elements.indexOf(entry) isnt -1
    while entry.type isnt HTML5.Marker.type and @open_elements.indexOf(entry) is -1
      i -= 1
      entry = @activeFormattingElements[i]
      break  unless entry
    loop
      i += 1
      clone = @activeFormattingElements[i].cloneNode()
      element = @insert_element(clone.tagName, clone.attributes)
      @activeFormattingElements[i] = element
      break  if element is @activeFormattingElements.last()
    return

  return htmlparser
