---
layout: post
title: How to pass the sudo password from the Mac OS keychain to the Ansible command line
tags: [ansible,security,mac_os]
draft: true
---

introduce the `security` command

Create new entry in the keychain

access it once from the comman line to check if it works and allow access

    security find-generic-password -wl unique-label

explain `-w` (print password only) and `-l` param (look for label)

Add it as an extra parameter:
    ansible-playbook -i servers.ini --extra-vars "ansible_become_pass=`security find-generic-password -wl unique-label`" -b playbook.yml
