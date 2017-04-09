---
layout: post
title: Creating users and their passwords with Ansible
tags: [] #ansible,linux,security,wikimedia
---
This article will introduce you how create user accounts on remote servers with Ansible. You will leran how the various parameters of the Ansible `user` task affect the password of the generated user and how to create users with locked passwords and temporary passwords that must be changed.

## Some background on passwords on Linux
The file `/etc/passwd` hints at passwords, but stores only an "x" or other character where the password has been stored [historically](https://en.wikipedia.org/wiki/Passwd#History).
On current Unix-based systems account passwords are stored in the file `/etc/shadow`. That file also contains information about the date when the password was last set and when it expires. The password can also be "locked", meaning that the user can't authenticate for logging in or doing a `sudo` command with a password.

## Creating users with passwords

A basic task for creating a user with a password in Ansible looks like this

```
- name: Create a user with hashed password
  user:
    name: kjaneway
    comment: "Kathryn Janeway"
    password: $6$RV7f88WJHCuZxb.t$aczWN9g22e4LqoycW687iq4LYMMOZY6ST/ClOCYa165RY56j.L7KLQTLhEDsOIyux4RSfUKRY67iLIXGwHFYO1
```

The `password` field must contain a hashed password in a format for `/etc/shadow`, meaning it contains the hash algorithm and a [salt](https://en.wikipedia.org/wiki/Salt_%28cryptography%29). The [Ansible documentation](http://docs.ansible.com/ansible/faq.html#how-do-i-generate-crypted-passwords-for-the-user-module) suggests using the `mkpasswd` command or the Python `passlib` library for generating the password.

## Creating a locked, SSH-only user

A more secure way to create an unprivileged user that can log in to a machine with his SSH key looks like this:

{% raw %}
```
- name: Create user
  user:
    name: sevenof9
    comment: "Seven of Nine"

- name: Add public ssh key to user
  authorized_key:
    user: sevenof9
    state: present
    key: "{{ lookup('file', 'files/ssh/id_rsa.pub') }}"
```
{% endraw %}

As you can see, the `password` parameter can be left out when creating a user. This will cause Ansible to create a user with a "locked" password. To enable a SSH login for that user, a public key is added to the list of allowed public keys of that user.

The public key file can be stored together with the playbook, since it's useless without the private key file, which you should **not** check in.

## Forcing users to create a password on first login

If you want to force your users to set a password on the first login, you need to have a user account with an empty password (so the user is not asked for the previous one) which is also marked as expired. This can be achieved with the following playbook steps:

```
- name: Create user with locked password
  user:
    name: tuvok
    comment: "Tuvok"

- name: Unlock password and set it to empty
  command: passwd -d tuvok

- name: Expire password
  command: chage -d 0 tuvok
```

## Checking if a specific user exists

Most of the time, the `user` commands will put the user accounts in the desired state. But sometimes, you don't want to create or change a user account but do a task depending on the existence of a user. In that case you can use the `getent` command to check if the user oder user id exists in `/etc/passwd`. If the user does not exist, `getent` will have a non-zero return code:

```
- name: Check if user exists
  command: getent passwd neelix
  register: neelix_on_board
  ignore_errors: yes # continue with the playbook

- name: Add user to list of active users
  lineinfile:
    name: /etc/docking_bay/allowed_users
    line: Neelix
  when: neelix_on_board.rc == 0
```
