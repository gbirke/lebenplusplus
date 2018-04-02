# Personal blog of Gabriel Birke

## Running in a Docker container

There are two scripts that contain Docker commands, which will generate the page or run the server in the background with the [`gbirke/spress`](https://hub.docker.com/r/gbirke/spress/) Docker image.

Regenerate the site with

    scripts/build_site

Serve the site on port 1313 (including drafts):

    scripts/serve_site

## Local Development without Docker

Install [Hugo](https://gohugo.io).

Run

    $ cd /your-site-dir
    $ hugo server -Dv

    # Browse to http://localhost:1313
