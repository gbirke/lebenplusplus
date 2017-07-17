---
layout: post
title: How to use your vagrant box SSH credentials
tags: [ansible,security,cryptography,vagrant,ssh,wikimedia]
description: How to SSH login into your Vagrant box without using 'vagrant ssh'
---
By default, many Vagrant boxes install a SSH key for the default user of a virtual machine image. This is fully transparent and you can easily log in to the machine with the `vagrant ssh` command. But what if you want to log in with a different SSH client, for example with `rsync` or with Ansible, without using the `vagrant provision` command?

The answer is that Vagrant stores the encryption key in the hidden `.vagrant` folder of a running machine. For example for a VirtualBox image, the key file is in `.vagrant/machines/default/virtualbox/private_key`

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

### Using a regular SSH client

    ssh -i .vagrant/machines/default/virtualbox/private_key -l vagrant -p 2222 localhost

### Creating an SSH tunnel for MySQL
For creating a SSH tunnel from the MySQL server inside your Vagrant box to your local machine (where you can use it with GUI SQL client)

    ssh -l vagrant -i .vagrant/machines/default/virtualbox/private_key -p 2222 -N -L 3306:localhost:3306 localhost

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

Add the following lines to your `Vagrantfile`:

    ssh_pub_key = File.readlines("#{Dir.home}/.ssh/id_rsa.pub").first.strip
    config.vm.provision 'shell', inline: "echo #{ssh_pub_key} >> /home/vagrant/.ssh/authorized_keys", privileged: false

Thanks to [**sekrett** on StackOverflow](https://stackoverflow.com/a/36865927/130121)
