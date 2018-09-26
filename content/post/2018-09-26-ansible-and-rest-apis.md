---
title: Using Ansible to call REST APIs
date: "2018-09-26"
tags:
  - ansible
  - REST
  - greylog
categories:
  - wikimedia
---
In the Fundraising Team of Wikimedia Germany we maintain our own infrastructure, using the principle of [Infrastructure as Code](https://en.wikipedia.org/wiki/Infrastructure_as_Code): We write every configuration change, every installed package, every other server setup tweak as part of some text file that we check into our version control system and do a peer-review on. This way, we can replicate our setups, share knowledge and track changes and their context.

While setting up a [Graylog](https://www.graylog.org) instance I discovered that its configuration file does not contain all the information. The log inputs, the alerts, the streams, the dashboards, the searches - we need to configure all those through the web UI.
