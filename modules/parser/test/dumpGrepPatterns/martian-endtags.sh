#!/bin/sh

# extension tag hooks enabled at en.wikipedia.org
exts="categorytree|charinsert|gallery|hiero|imagemap|inputbox|math|nowiki|poem|pre|ref|references|source|syntaxhighlight|timeline"

wiki="nowiki|includeonly|noinclude|onlyinclude"

# just the html5 elements
html5s="a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|data|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr"

htmlold="center|font|tt"

normaltags="$exts|$wiki|$html5s|$htmlold"

#regexp="<(?!\/|$exts|$htmls)[^>]*>.*?<!--([^<]+|<(\/|$exts|$htmls)[^>]*>)*<\/(?!$exts|$htmls)[^>]*>"
#regexp="&lt;(?!/|$normaltags)[^&]+&gt;[^&]+&lt;!--[^&-]*&lt;/(?!$normaltags)((?!&gt;).)+&gt;"
regexp="</(?=[a-z])(?!$normaltags)[^>]+>"
#regexp="<(?!\/|$exts|$htmls)[^>]*>"

#echo $regexp

if [ -z "$1" ];then
    echo "Usage: $0 <xmldump.gz>"
    exit 1
fi

zcat $1 | node ../dumpGrepper.js -i "$regexp"
