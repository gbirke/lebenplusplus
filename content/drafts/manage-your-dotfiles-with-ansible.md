---
title: Manage your dotfiles with Ansible
tags: []
date: 2017-6-12
---
In the course of my nerd career I collected a set of default configurations - Vim environment, Git configuration, favorite shell aliases -  that I miss dearly when working on a new production server or VM environment. I've looked for various ways to easily copy my configuration files to a new machine and to keep the files in sync across machines.

The first attempt at this was  a Git repository, which solved the syncing and copying part. I checked out the repository into a `.dotfiles` folder and installed the dot files as symbolic links into my home directory with the help of the `stow` utility. Thanks to Brandon Invergo who [introduced me to this method of managing the dotfiles](http://brandon.invergo.net/news/2012-05-26-using-gnu-stow-to-manage-your-dotfiles.html?round=two).

There is one shortcoming to this method, however - I have to install `git` and `stow` on every machine where I want my environment. Enter Ansible, where the only thing that's needed on the remote machine is a Python interpreter.

For those who don't know Ansible, here is an introduction: Ansible is a command line tool that enables you to execute administration commands on a remote machine (or a whole fleet of machines). A collection of administration commands is called a "playbook" and works just like a regular shell script, only that the playbook is written in YAML, is much more readable than a shell script and is idempotent, meaning that you can run the same playbook over and over without changing or destroying anything on the remote machine. Only commands that will change the remote machine will be executed.

Let's have a look at each task (step) of the playbook to see what Ansible features we can learn from it:

```
- name: Check out dotfile repository
  git: repo=https://github.com/gbirke/dotfiles.git dest=dotfiles
  delegate_to: 127.0.0.1
```
The Ansible `git` module is great: It automatically clones the repository if it does not exist and pulls changes if it does. Normally, the instruction would have been executed on the remote machine, but then I would need to have Git installed there. So instead I use the `delegate_to` modifier with my local IP address to execute the Git commands on my local machine.

{% raw %}
```
- name: Copy dotfile repo to remote home
  synchronize: src=dotfiles/ dest={{ ansible_env.HOME }}/.dotfiles recursive=yes
```
{% endraw %}

`synchronize` is a wrapper around the `rsync` command. As usual with `rsync`,  slashes at the end of path names are important - without the slash at the end of `dotfiles/`, the path on the remote machine would look like `.dotfiles/dotfiles` instead of `.dotfiles`.   `synchronize` will also copy the contents of the hidden `.git` directory inside of the repository. I could suppress that by providing `rsync_options` to the `synchronize` task, but opted to leave it in to retain the ability to update my dot files with a `git pull` on machines where Git is installed.  
`ansible_env`  is a variable provided by ansible and contains all environment variables of the user you execute the playbook with, for example `HOME`, the path of your home directory. To use a variable, you need to put it in curly braces.

```
- name: Store dotfile names
  command: find .dotfiles -type f -name ".*"
  register: found_dotfiles
  changed_when: False
```

This task is just for collecting information. It executes the `find` command in the regular shell environment. `find`  will list all files in the `.dotfiles` folder that start with a dot. The `register` part of the task writes the output, the return code and some other information in a variable called `found_dotfiles` that can be used later.   
`changed_when: False`  changes how Ansible displays the task when it's run: Normally, all `command` tasks show up in orange as "changed". However, this task does not modify information on the remote machine, so I make it show up as green (not changed). When running the task on a machine that has the dot files already installed, all tasks will show up as green and will give me an instant feedback.

{% raw %}
```
- name: Symlink dotfiles from dotfile dir
  file: src={{ item }} dest={{ ansible_env.HOME }}/{{ item | basename }} state=link
  with_items: "{{found_dotfiles.stdout_lines}}"
```
{% endraw %}

I'm using lines of the stdout output of the previous command as input here. `with_items` is the Ansible way to iterate over a list of items in an array variable. With each iteration the  current value is assigned tp the variable `item` .  
`basename` is a variable modifier. If you've used template languages like Jinja, Smarty or Twig you might recognize the pattern, also called filter. `basename` cuts the directory portion from a path and leaves the file name.

TODO research what happens when a file already exists.

