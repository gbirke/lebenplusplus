# Personal blog of Gabriel Birke

## Running in a Docker container

There are two scripts that contain Docker commands, which will generate the page or run the server in the background with the [`gbirke/spress`](https://hub.docker.com/r/gbirke/spress/) Docker image.

Regenerate the site with

    scripts/build_site

Serve the site on port 4000 (including drafts):

    scripts/serve_site

To stop the server, run the command

    docker stop -t 0 lebenplusplus

All the command are also reachable via composer commands:

    composer site:build
    composer site:serve
    composer site:stop-server

## Local Development without Docker

Download Spress and make it executable:

    curl -LOS https://github.com/spress/Spress/releases/download/v2.1.3/spress.phar
    chmod a+x spress.phar

Optionally: Rename the executable to `spress` and move into into your `$PATH`.

Run

    $ cd /your-site-dir
    $ spress site:build --server --watch

    # Browse to localhost:4000

Design by [Michael Rose](https://mademistakes.com/)  
Powered by [Spress](http://spress.yosymfony.com), using the [Tinto](https://github.com/enzolutions/spress-tinto-theme/) theme.
