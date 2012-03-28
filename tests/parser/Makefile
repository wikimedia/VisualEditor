COFFEE = $(shell find . -name '*.coffee' -a ! -regex '.*node_modules.*' | sed 's/\.coffee/\.js/')

all :: $(COFFEE)

test :: parserTests.txt all
	node ./parserTests.js --cache parserTests.txt

TESTS_URL = https://gerrit.wikimedia.org/r/gitweb?p=mediawiki/core.git;a=blob_plain;hb=HEAD;f=tests/parser/parserTests.txt
parserTests.txt ::
	-if [ ! -e parserTests.txt ] ; then curl -O "$(TESTS_URL)" || wget -O parserTests.txt "$(TESTS_URL)" ; fi

.PHONY: test all

.SUFFIXES: .coffee .js

.coffee.js:
	coffee -c -b $<
