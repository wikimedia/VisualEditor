#!/bin/sh
# Simple test runner with result archival in results git repository
# Usage:
#  ./runtests.sh -c    # wikitext -> HTML DOM tests and commit results
#  ./runtests.sh -r -c # round-trip tests; commit
#  ./runtests.sh       # wikitext -> HTML DOM; only show diff (no commit)
#  ./runtests.sh -r    # round-trip tests; only show diff (no commit)

if [ ! -d results ];then
    git init results
    touch results/html.txt
    touch results/roundtrip.txt
    ( cd results;
      git add html.txt
      git add roundtrip.txt
      git commit -a -m 'init to empty test output' )
else
    ( cd results && git checkout -f )
fi

if [ "$1" = "-r" ];then
    time node parserTests.js --cache --roundtrip \
        > results/roundtrip.txt 2>&1 || exit 1

else
    time node parserTests.js --cache --printwhitelist \
        > results/html.txt 2>&1 || exit 1
fi

cd results || exit 1
if [ "$1" != '-c' -a "$2" != '-c' ];then
    git diff | less -R
else
    if [ "$1" = '-r' ];then
        git commit -a -m "rt: `tail -4 roundtrip.txt`" || exit 1
    else
        git commit -a -m "html: `tail -4 html.txt`" || exit 1
    fi
    git diff HEAD~1 | less -R || exit 1
fi
