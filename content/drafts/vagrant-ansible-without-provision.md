---
title: Using Ansible on Vagrant VM without provisioning
tags: []
date: 2017-6-12
---
Wehn developing Ansible playbooks you want them to be as general as possible, mostly independent from the environment they are used in. If you want to test-drive them you could use Vagrant and its provisioning feature. However, some vagrant images are not compatible with Ansible provisioning ...

TODO more explanations why you should not use provisioning.

TODO example Vagrantfile, with jessie minimal, private network and shell provisioning of Python

    ansible-playbook -b -e ansible_ssh_private_key_file=.vagrant/machines/default/virtualbox/private_key -u vagrant -i 192.168.33.3, test.yml

TODO explanation of each parameter

