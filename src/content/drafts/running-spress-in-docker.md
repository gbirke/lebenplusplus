---
layout: post
title: Running Spress in Docker
tags: [docker,spress,meta,tutorial]
---
My last PHP update broke [Spress](http://spress.yosymfony.com/), the static site generator I use for this blog. I decided to move my blog generation to a more stable and portable environment - a Docker container. I've documented what I did and what I learned with this blog post. This is my first attempt to do something with Docker, please excuse any bad practices.

You can find the finished Dockerfile at https://github.com/gbirke/spress-docker.

## Writing the Dockerfile {#dockerfile-writing}

	FROM php:alpine

As the base image I'm using the [alpine variant of the official PHP Docker image][https://hub.docker.com/_/php/] to keep the storage space for the image as small as possible.

RUN curl -L -o /usr/local/bin/spress https://github.com/spress/Spress/releases/download/v2.1.3/spress.phar && \
	chmod +x /usr/local/bin/spress

Installation of Spress is fairly simple: After downloading the Spress PHAR file, I move it to a specified location and make it executable. The commands are chained with `&&` instead of being individual `RUN` commands, because Docker internally creates a new image for every `RUN` command and I don't want to clutter my hard disk with too many intermediary images.

	WORKDIR /var/www
	ENTRYPOINT [ "/usr/local/bin/spress" ]
	CMD [ "site:build", "--watch", "--server" ]

`WORKDIR` is pretty self-explanatory: It's the directory where all the following commands will be run.

`ENTRYPOINT` specifies the command the will always be run when the container is started.

`CMD` specifies what parameters will be passed to the command in `ENTRYPOINT`. They can be overwritten when starting the container. By default, a development server is started.

The Dockerfile is complete. Now a Docker image needs to be built with the command

	docker build -t gbirke/spress:latest .

The option `-t gbirke/spress:latest` tags it for later submission to DockerHub. This will allow me to skip the build step when using it on other machines.

## Runnning Spress  {#running-the-image}

The `docker run` command takes a [Docker *image*](https://docs.docker.com/engine/reference/glossary/#image) and runs it in a [Docker *container*](https://docs.docker.com/engine/reference/glossary/#container).
The full command is

	docker run -v .:/var/www -p 4000 --name serve_my_blog -t gbirke/spress

Let's have a look at all the parameters

- `-v .:/var/www` mounts the current directory as a volume inside the running container. If the Dockerfile were outside the current directory, I'd have to specify an absolute path.
- `-p 4000` exposes port 4000 of the container to my host computer so I can reach the blog at http://localhost:4000/ from my browser.
- `--name serve_my_blog` applies the name `serve_my_blog` to the image. If this parameter is missing, Docker will [generate](https://github.com/docker/docker/blob/master/pkg/namesgenerator/names-generator.go) an arbitrary name like `optimistic_payne` or `modest_agnesi`.
- `-t` assigns the running process a "[pseudo-tty](https://en.wikipedia.org/wiki/Pseudoterminal)". If I leave this parameter out, I wouldn't be able to detach myself from the docker image with Control-C. Using a pseudo-tty also means that Spress can use its colored output.

While the image is running, I can go to `localhost:4000/` and browse my blog.

## Stopping and restarting {#stop-restart}

If I want to detach myself from the running Spress web server I can press Control-C. The image will still be running, but in a detached state.

With the command `docker ps` I can see a list of images, their names and their status. To attach my console back to the process to see its output I can use `docker attach serve_my_blog` (for full console access which is not needed here) or `docker logs -f serve_my_blog` for just reading the output.

A running image can be stopped the command `docker stop serve_my_blog` which will wait for 10 seconds an then stop the image. To stop immediately, I use `docker stop -t 0 serve_my_blog`.

When I've stopped a container, `docker ps` will not show it anymore. But it still exists, in a stopped state. I can see that with `docker ps -a`, which will show all containers. If I try to start the container again with `docker run` and the same name, I will get the error message `the container name "/serve_my_blog" is already in use by container`.

If I want to restart the container with the same parameters, I could use the command `docker restart serve_my_blog`.

If I want to start the image with different parameters, I'd first have to remove the stopped image. Removing all stopped images can be done with the command

	docker rm $(docker ps -q -f "status=exited")

By adding the `--rm` parameter to the `docker run` command, the image will be removed automatically when the container stops.

By adding the `-d` parameter to the `docker run` command, the image will start in a detached state.

## Usage without the web server {#just-building}

When I just want to build my blog with Spress, without having a web server or watching for file changes, I append the Spress command line options to the `docker run` command:

	docker run -v .:/var/www --rm -t gbirke/spress site:build

Here is how I run it with my production configuration:

	docker run -v .:/var/www --rm -t gbirke/spress site:build --env=prod

## Conclusion

This was a fun little project. I've long dreaded looking into Docker, especially because until July 2016 you'd have to run it in a VM on macOS, my primary work OS. Now I've boarded the Docker hype train and will continue exploring the possibilities. I've already experimented with running MySQL in a docker image for running tests for my "[Remember me](https://github.com/gbirke/rememberme/)" library ...
