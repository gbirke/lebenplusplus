---
layout: post
title: How to use your vagrant box SSH credentials
tags: [ansible,security,cryptography,vagrant,ssh,wikimedia]
description: How to SSH login into your Vagrant box without using 'vagrant ssh'
---
By default, many Vagrant boxes install a SSH key for the default user of a virtual machine image. This is fully transparent and you can log in to the machine with the `vagrant ssh` command. But what if you want to log in with the standard `ssh` command, connect with `rsync` or run an Ansible playbook? This article shows how to find and reuse the connection parameters for your Vagrant box.

The SSH configuration of your vagrant machine can be displayed with the command

    vagrant ssh-config

The output of the command will look like this:

    Host default
      HostName 127.0.0.1
      User vagrant
      Port 2222
      UserKnownHostsFile /dev/null
      StrictHostKeyChecking no
      PasswordAuthentication no
      IdentityFile /home/username/vms/test/.vagrant/machines/default/virtualbox/private_key
      IdentitiesOnly yes
      LogLevel FATAL

The important information is `HostName`, `User`, `Port` and `IdentityFile`. Those can be used as connection information for your custom SSH connection. The following examples show how to use these parameters in various connections:

## Examples

All following examples don't use the absolute path for the identity file but a relative path, starting with the `.vagrant` directory. Adjust your examples as needed.

### Using a regular SSH client

    ssh -i .vagrant/machines/default/virtualbox/private_key -l vagrant -p 2222 localhost

### Creating an SSH tunnel for MySQL
For creating a SSH tunnel from the MySQL server inside your Vagrant box to your local machine (where you can use it with GUI SQL client)

    ssh -l vagrant -i .vagrant/machines/default/virtualbox/private_key -p 2222 \
        -N -L 3306:localhost:3306 localhost

### Copy files from the Vagrant box with rsync

    rsync -Pav -e "ssh -i .vagrant/machines/default/virtualbox/private_key -p 2222" \
        vagrant@localhost:/var/log  /tmp/vagrant_logs

### Configure Ansible inventory to use Vagrant SSH configuration
Create a file that contains the following information:

    [web]
    127.0.0.1

    [web:vars]
    ansible_port=2222
    ansible_user=vagrant
    ansible_ssh_private_key_file=.vagrant/machines/default/virtualbox/private_key

## How to copy your public SSH key to the Vagrant image
All of the above commands are useful if you have an existing Vagrant box and want to access it. If you are setting up a new box with your own `Vagrantfile`, consider adding your own public SSH key to the default user (usually `vagrant`). Then you can omit the identity file configuration from the commands.

The shortest solution for that comes from user [**sekrett** on StackOverflow](https://stackoverflow.com/a/36865927/130121), whco recommends adding the following lines to your `Vagrantfile`:

    ssh_pub_key = File.readlines("#{Dir.home}/.ssh/id_rsa.pub").first.strip
    config.vm.provision 'shell', inline: "echo #{ssh_pub_key} >> /home/vagrant/.ssh/authorized_keys", privileged: false
