== Installation on Ubuntu VM ==

apt-get update
apt-get install nodejs npm git build-essential
npm install -g express html5 lru-cache jquery pegjs async jshashes
adduser --system --home /var/lib/parsoid parsoid
cd /var/lib/parsoid
git clone
https://gerrit.wikimedia.org/r/p/mediawiki/extensions/VisualEditor.git
cd VisualEditor/api
./runserver.sh
