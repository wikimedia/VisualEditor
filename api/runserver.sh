#!/bin/sh
# redirect port 80 to unprivileged port 8000
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000

# run the server as non-privileged user
nohup sudo -u nobody node server.js &
