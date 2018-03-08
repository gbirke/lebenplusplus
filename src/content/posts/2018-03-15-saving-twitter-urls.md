---
layout: post
title: Build your own web automation with Node-RED on uberspace.de
tags: [javascript,automation,hosting,wikimedia]
description: How to set up the Node-RED software as a Tweet importer for pinboard.in, hosted on uberspace.de
draft: true
---

I'm a heavy user of the bookmarking site [pinboard.in](https://pinboard.in) (more than 17.000 links in my collection). Tagging makes it easy to find obscure topics I've researched before or to plainly wallow in nostalgia with my tool "[On this day ... on Pinboard](https://github.com/gbirke/pin-this-day)". Also, it has become my backup and inbox for all URLs coming in from my faved Tweets. However, the automated Pinboard Twitter importer imports all tweets and I only want tweets containing URLs. So I used the software **[Node-RED](https://nodered.org)** to connect the public APIs of Twitter and Pinboard to create my own importer.

Node-RED is a graphical "programming" environment where you can wire together event sources, processing steps and event receivers. If you want to come up with our own automation rule, some basic understanding of JSON data and maybe even some basic JavaScript might be needed. For the
I've published the  


Use newer GCC version to use native bcrypt package needed by node-red-admin

    export PATH=/package/host/localhost/gcc-5/bin:$PATH

    npm install -g node-red node-red-admin

Claim a TCP port for the websocket communication of the node RED editor.

    uberspace-add-port -p tcp --firewall


First start to init the user directory:

    node-red -p 64321

Create credential with

    node-red-admin hash-pw

edit adminAuth and port settings in ~/.node-red/settings.js

Set up as a background service

    uberspace-setup-service node-red ~/bin-node-red


Bonus: Reuse an existing letsencrypt certificate:

add

    https: {
       key: fs.readFileSync('/home/YOURNAME/.config/letsencrypt/live/YOURDOMAIN/privkey.pem'),
       cert: fs.readFileSync('/home/YOURNAME/.config/letsencrypt/live/YOURDOMAIN/cert.pem')
   },
   requireHttps: true,

to your configuration
