---
layout: post
title: How to pass the sudo password from the Mac OS keychain to the Ansible command line
tags: [ansible,security,mac_os]
draft: true
---
Tired of having to open your password manager whenever you run an Ansible playbook that needs a sudo (or rather `become` password)? This guide shows how to keep your passwords securely in the Mac OS keychain, without the need to copy and paste them.

The guide assumes a host name of `www.example.com`, the username for ansible to be `deploy_user` with a sudo password of `s33cr337`. Please replace all occurences of these strings with your own credentials.

To access the keychain, we use `security`, a Mac OS command line program that comes with the standard Mac OS installation.

Create a new entry in the keychain:

    security add-generic-password -a deploy_user -s www.example.com -w s33cr337

If you want to be extra secure, put a space in front of the command so it doesn't show up in your shell history.

Alternatively, you can create a new entry with the "Keychain Access" application from your "Applications/Utilities" folder.

You can retrieve a password from the command line like this:

    security find-generic-password -w -s www.example.com

Explanation of the options: `-w` prints the password, `-s` searches for passwords.

If you've created the password with the "Keychain Access" application, a dialog pops up where you have to confirm the permission for the Terminal application to access this keychain entry.

Now you can use this command line to pass an additional parameter to `ansible-playbook`:

    ansible-playbook --become -i servers.ini \
    --extra-vars "ansible_become_pass=`security find-generic-password -w -s www.example.com`" \
    playbook.yml
