test :: parserTests.txt
	node ./parserTests.js --cache parserTests.txt

TESTS_URL = http://svn.wikimedia.org/svnroot/mediawiki/trunk/phase3/tests/parser/parserTests.txt
parserTests.txt ::
	-if [ ! -e parserTests.txt ] ; then curl -O $(TESTS_URL) || wget $(TESTS_URL) ; fi

.PHONY: test
