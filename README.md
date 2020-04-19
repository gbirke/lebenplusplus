# Personal blog of Gabriel Birke

## Cloning the page

The theme of this page -
[blackburn](https://github.com/yoshiharuyamashita/blackburn) is a [Git
submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules). When cloning
the repository, you need to clone it together with the theme submodule.
If you're cloning the repository for the first time, you use the command

    git clone --recursive REPO_NAME

if you've already cloned it, use the command

    git submodule update --init

## Running in a Docker container

There are two scripts that contain Docker commands, which will generate the page or run the server in the background with the [`jojomi/hugo`](https://hub.docker.com/r/jojomi/hugo) Docker image.

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
