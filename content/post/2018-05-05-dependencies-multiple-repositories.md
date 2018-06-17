---
title: Working with PHP dependencies in multiple repositories
tags:
  - PHP
  - composer
  - version control
  - workflow
  - docker
  - git
date: '2018-05-05'
categories:
  - wikimedia
description: How to synchronize changes between two dependent PHP code bases in two Git repositories.
---
Imagine yourself working on a PHP code base that is distributed into two or more Git repositories, for example a library and an application part. Ideally, the two repositories should be independent, but sometimes that lofty goal can't be achieved. And having two repositories open in your editor and doing `git commit`, `git push`, `composer update` all the time becomes tedious. This article shows how to work faster with two dependent PHP code bases.

## Edit composer.json to use local repository
Regardless if your library is on packagist or in a GitHub repository, put something like this in the `composer.json` file of your application:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../relative/path/to/your/library"
        }
    ]
}
```

When you run `composer install`, composer will try to create a symbolic link to the library. That means when you change the library, the change will be immediately available in the code of the application. If a symlink can't be created, you'll need to run `composer update your/library` for every change you make in the library.

If the `composer.json` of your library does *not* have a `version` entry that matches the version in the requirements of the application, you can change the `require` entry in the `composer.json` of your application to `"your/library": "@dev"`.

When you're finished coordinating your code bases, create a new release of your library and remove the `path` repository from the `composer.json` of your application.

The composer-based approach only works, if the PHP environment supports symbolic links. If you're using a virtual machine or a Docker container, the target of the symbolic link may be outside of the file system that's exposed from your host machine to the guest VM/container. In these cases you can to mount the dependency into the `vendor` folder instead.

## Mounting the dependency into a Docker container
Docker allows you to *mount* directories into your image. The mounts will overlay the existing content. To overlay the contents of the `vendor/your/library` in the docker container, you add the parameter

    -v /path/to/your/library:vendor/your/library

to your `docker` command.

If you're using `docker-compose`, add the directory to your `volumes` list:

```yaml
services:
    php:
        image: php:7.1-fpm-alpine
        volumes:
            - .:/code
            - /path/to/your/library:code/vendor/your/library
```

Make sure that when you run `composer` commands, you're not running them inside the container where the library is mounted. Running them in a separate container that changes only the original `vendor` directory on your host machine, will have no effect.
