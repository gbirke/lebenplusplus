---
title: Creating users and their passwords with Ansible
tags:
  - ansible
  - linux
  - security
date: '2017-04-19'
categories:
  - wikimedia
---
This article will teach you how create user accounts with the configuration management software [Ansible](https://www.ansible.com). You will learn how to create users with passwords, SSH-only users and users with temporary passwords that must be changed.

## Some background on passwords on Linux
The file `/etc/passwd` hints at passwords, but stores only an "x" or other character where the password has been stored [historically](https://en.wikipedia.org/wiki/Passwd#History).
The real passwords are stored in the file `/etc/shadow`, in a hashed format. `/etc/shadow` also contains information about the date when the password was last set and when it expires. If the password is a special character instead of a hash, that means the password is "locked", meaning that the user can't use it for logging in or running a `sudo` command that needs a password.

## Creating users with passwords

A basic task for creating a user with a password in Ansible looks like this

```yaml
- name: Create a user with hashed password
  user:
    name: kjaneway
    comment: "Kathryn Janeway"
    password: $6$RV7f88WJHCuZxb.t$aczWN9g22e4LqoycW687iq4LYMMOZY6ST/ClOCYa165RY56j.L7KLQTLhEDsOIyux4RSfUKRY67iLIXGwHFYO1
```

The `password` field must contain a hashed password in a format for `/etc/shadow`, meaning it contains the hash algorithm and a [salt](https://en.wikipedia.org/wiki/Salt_%28cryptography%29). The [Ansible documentation](http://docs.ansible.com/ansible/faq.html#how-do-i-generate-crypted-passwords-for-the-user-module) suggests using the `mkpasswd` command or the Python `passlib` library for generating the password.

If you need to generate lots of user accounts with default secure passwords, e.g. from a script or a CSV file, have a look at [ansible-create-users](https://github.com/gbirke/ansible-create-users), a Python script I wrote. It will create an Ansible variable file with password hashes.

## Creating a locked, SSH-only user

A more secure way of user creation is to create an unprivileged user with no password. This user must log in with his SSH key:

```yaml
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

As you can see, the `password` parameter can be left out when creating a user. This will cause Ansible to create a user with a "locked" password. To enable a SSH login for that user, a public key is added to the list of allowed public keys of that user.

The public key file can be stored together with the playbook, since it's useless without the private key file, which you should **not** check in.

## Forcing users to create a password on first login

If you want to force your users to set a password on the first login, you need to have a user account with an empty password (so the user is not asked for the previous one) which is also marked as expired. This can be achieved with the following playbook steps:

```yaml
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

Most of the time, the `user` task will put the user account in the desired state. But sometimes, you don't want to create or change a user account, but execute a task depending on the existence of a user. In that case you can use the `getent` command to check if the user oder user id exists in `/etc/passwd`. If the user does not exist, `getent` will have a non-zero return code:

```yaml
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

## Conclusion
Think carefully about what kind of user you want to create on your servers. Users that are just for running internal services are best created as locked users, without SSH access. Deployment and maintenance users are best created as users with SSH access. When setting up a local machine, you'll probably set initial passwords.

Whichever method of user creation you choose is highly dependent on your security requirements and your use case. Ansible is a valuable tool, but beware of the old saying: "If all you have is a hammer, everything looks like a nail." If you have many users across different machines maybe you should use LDAP for user management instead of creating them with Ansible.
