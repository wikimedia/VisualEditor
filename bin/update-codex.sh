#!/bin/bash -eu

# This script generates a commit that updates our copy of Codex Design Tokens

if [ -n "${2:-}" ]
then
	# Too many parameters
	echo >&2 "Usage: $0 [<version>]"
	exit 1
fi

REPO_DIR=$(cd "$(dirname $0)/.."; pwd) # Root dir of the git repo working tree
TARGET_DIR="lib/codex-design-tokens/" # Destination relative to the root of the repo
NPM_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'update-codex-design-tokens') # e.g. /tmp/update-oojs.rI0I5Vir

# Prepare working tree
cd "$REPO_DIR"
git reset -- $TARGET_DIR
git checkout -- $TARGET_DIR
git fetch origin
git checkout -B upstream-codex-design-tokens origin/master

# Fetch upstream version
cd $NPM_DIR
if [ -n "${1:-}" ]
then
	npm install "@wikimedia/codex-design-tokens@$1"
else
	npm install @wikimedia/codex-design-tokens
fi

CODEX_VERSION=$(node -e 'console.log(require("./node_modules/@wikimedia/codex-design-tokens/package.json").version);')
if [ "$CODEX_VERSION" == "" ]
then
	echo 'Could not find CODEX version'
	exit 1
fi

# Copy file(s)
rsync --force ./node_modules/@wikimedia/codex-design-tokens/dist/theme-wikimedia-ui.less "$REPO_DIR/$TARGET_DIR"

# Clean up temporary area
rm -rf "$NPM_DIR"

# Generate commit
cd $REPO_DIR

COMMITMSG=$(cat <<END
Update Codex Design Tokens to v$CODEX_VERSION

Release notes:
  https://gerrit.wikimedia.org/r/plugins/gitiles/design/codex/+/refs/tags/$CODEX_VERSION/CHANGELOG.md
END
)

# Stage deletion, modification and creation of files. Then commit.
git add --update $TARGET_DIR
git add $TARGET_DIR
git commit -m "$COMMITMSG"
