---
title: How to run npm install as non-root from a Docker container
tags:
  - docker
  - npm
  - javascript
  - containers
date: '2018-03-15'
categories:
  - wikimedia
---
Suppose you don't want to install Node.js and npm on your local machine and already run your application in a Docker container. How do you install your dependencies from `package.json`? For deployment, the most common way is to create your own Docker image, where `npm install` is part of the Dockerfile. But what do you do on your development machine, where you don't want to build a new image all the time and use the [vanilla `node` image](https://hub.docker.com/_/node/) ? Where you want to create a `node_modules` directory inside your project directory, with the correct permissions? Jump to the end of the article to get a solution, or follow me on my journey ...

## First try: running as root

    docker run -it --rm -v $(pwd):/app -w /app npm install

A short little command line, that mounts the current directory into the container and runs `npm install` as root. It works, but the resulting `node_modules` directory will belong to `root:root`. Also, npm scripts might throw strange errors or will complain, because npm should not be run as root. If you're ok with running it as root, you could add the parameter `--unsafe-perm`.

## Second try: running as unprivileged user

[The official Node image](https://hub.docker.com/_/node/) comes with the user `node`

    docker run -it --rm -u node -v $(pwd):/app -w /app npm install

This will install the packages, but you still might run into permission problems if the `node` user from the docker image (with UID and GID 1000) do not exactly match the UID of the user running the docker command or if the `node_modules` directory already exists with different permissions.

## Third try: running as the current user

    docker run -it --rm -u $(id -u):$(id -g) -v $(pwd):/app -w /app npm install

This will cause `npm install` to fail. Judging from the error messages, the cause of failure is that npm tries to run subshells, but there is no entry in `/etc/passwd` for the UID and GID you provided. npm will then assume `/` as the home directory of that user, failing miserably because the user has no write permissions.

## Finally, permission nirvana
A solution for the npm permission problem is to fake the `passwd` user entry and its home directory. First, you create a minimal `passwd` file for the current user on our host system:

    echo "node:x:$(id -u):$(id -g)::/home/node:/bin/bash" > /tmp/fake-passwd

Then you mount the passwd file and a writeable directory of the current user:

    docker run -it --rm -u $(id -u):$(id -g) -v /tmp/fake-passwd:/etc/passwd \
        -v ~/tmp:/home/node -v $(pwd):/app -w /app npm install

This will install the dependencies with the current user as owner into `node_modules`.

## Alternative approaches
I don't like having to create a passwd file and having to mount two additional things, but for my very specific use case - replacing a locally installed `npm` with `npm` running inside a container from an unmodified Node image - this seems like the best I can do.

I wish Docker would provide a UID mapping between host and container volumes. [There once was an issue for that](https://github.com/moby/moby/issues/7198), but the developers decided that the many workarounds would suffice. There is a [new issue](https://github.com/moby/moby/issues/22258), with more workarounds, so there is hope that some day Docker might get this functionality.

A very in-depth explanation of such a workaround is ["Handling permissions with docker volumes" by Deni Bertovic](https://denibertovic.com/posts/handling-permissions-with-docker-volumes/).

I'm open for alternative suggestions - contact me, if you like.

