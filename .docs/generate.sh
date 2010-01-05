#!/usr/bin/env bash
cd $(cd $(dirname $0); pwd)

(
	while IFS='' read -r l
	do
		if [[ "$l" == "{{VE-LOAD-HEAD}}" ]]
		then
			php ../maintenance/makeStaticLoader.php --section=head --ve-path=../modules/
		elif [[ "$l" == "{{VE-LOAD-BODY}}" ]]
		then
			php ../maintenance/makeStaticLoader.php --section=body --ve-path=../modules/
		else
			echo "$l"
		fi
	done
) < eg-iframe.tpl | php > eg-iframe.html

jsduck --config=config.json
rm eg-iframe.html
cd - > /dev/null
