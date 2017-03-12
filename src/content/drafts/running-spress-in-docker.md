---
layout: post
title: Running Spress in Docker
tags: [docker,spress,meta]
---
After my last PHP update broke my Spress installation, I decided to move my blog generation to a more stable and portable environment - a Docker container. And to document the process with a blog post - how meta. This is my first attempt to do something with Docker, please excuse any bad practices.

You can find the finished Dockerfile at XXX and I've provided the Spress project with a pull request. In this blog post I'll go through the Dockerfile line by line and explain what I've done.


	FROM php:alpine

I'm using the [alpine distribution of PHP][alpinephp] to keep the storage space for my Docker image down.

	RUN apk update && apk install curl
	RUN curl -L -o /usr/local/bin/spress https://github.com/spress/Spress/releases/download/v2.1.3/spress.phar && 
		chmod +x /usr/local/bin/spress
	
I need curl to download the Spress. After downloading the PHAR file, I move it to a speicifed location and make it executable. The commands are chained with `&&` instead of being individual `RUN` commands because Docker internally creates a new image for every `RUN` command and I don't want to clutter my hard disk with intermediary images.

	WORKDIR /var/www
	ENTRYPROINT [ "/usr/local/bin/spress" ]
	CMD [ "site:build", "--watch", "--server" ] 

TODO ENTRYPOINT vs CMD

That is all for the Dockerfile. The new image with Spress inside can now be built with the command 

	docker build -t gbirke/spress .

Now let's have a look at the parameters for the `run` command

	$ docker run -v .:/var/www -p 4000 gbirke/spress

`-v .:/var/www` mounts the current directory as a volume inside the running container.  
`-p 4000` exposes port 4000 of the container to my host computer so I can reach the blog at http://localhost:4000/ from my browser. 


TODO Build the site without starting the server, detached and stopped processes.


TODO explore run vs exec, draft and no draft, environment, 
TODO docker-compose to avoid volume and network parameters


# TODO / Reseearch

* working directory of CMD command?
* Should we really run spress continously? exec vs run, draft vs no draft, environment, etc
* docker run vs build - what to use when, etc

[alpinephp]: TODO