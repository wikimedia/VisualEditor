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

warnings=`jsduck --config=config.json 2>&1`
ec=$?

rm eg-iframe.html
cd - > /dev/null

# Re-colorize
NORMAL=$(tput sgr0); YELLOW=$(tput setaf 3); MEGANTA=$(tput setaf 5)
echo "$warnings" | perl -pe "s|^([^ ]+) ([^ ]+) (.*)$|${YELLOW}\1 ${MEGANTA}\2${NORMAL} \3|"

# JSDuck doesn't exit with an error code if there are warnings
# (only when there are fatal errors). We fixed all warnings
# in master so lets consider all warnings errors to ensure
# we don't introduce any new invalid jsduck syntax.
if [[ "$ec" == "0" && "$warnings" != "" ]]
then
	exit 1
fi

# Exit with exit code of jsduck command
exit $ec
