---
layout: post
title: Creating users and their passwords with Ansible
tags: [] #ansible,linux,security,wikimedia
---
This article will introduce you how create user accounts on remote servers with Ansible. The article will describe in detail how the various parameters of the ansible `user` task affect the password of the generated user and how to create users with locked passwords and temporary passwords that must be changed.

## Some background on passwords on Linux
The file `/etc/passwd` hints at passwords, but stores only an "x" or other character where the password has been stored [historically](https://en.wikipedia.org/wiki/Passwd#History).
On current Unix-based systems account passwords are stored in the file `/etc/shadow`. That file also contains information about the date when the password was last set and when it expires. The password can also be "locked", meaning that the user can't authentify to for login or `sudo` with a password.

## Creating users with passwords

A basic task for creating a user with a password in Ansible looks like this

- user:
    name: kjaneway
    comment: "Kathryn Janeway"
    password:

The [Ansible documentation](http://docs.ansible.com/ansible/faq.html#how-do-i-generate-crypted-passwords-for-the-user-module) 

## Creating a locked, SSH-only user

## Forcing users to create a password on first login



https://github.com/gbirke/ansible-create-users
