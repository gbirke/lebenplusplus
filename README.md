# Personal blog of Gabriel Birke

## Cloning the page

The theme of this page -
[blackburn](https://github.com/yoshiharuyamashita/blackburn) is a [Git
submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules). When cloning
the repository, you need to clone it together with the theme submodule.
If you're cloning the repository for the first time, you use the command

    git clone --recursive REPO_NAME

If you've already cloned it, use the command

    git submodule update --init

## Running in a Docker container

The two scripts in `scripts` contain Docker commands, which will generate the page or run the server in the background with the [`jojomi/hugo`](https://hub.docker.com/r/jojomi/hugo) Docker image (quite outdated version of Hugo, approx version 0.80).

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

## Building and running with the [Nix package manager](https://nixos.org/)

Run with

    nix run nixpkgs#hugo build

Build locally with

    nix build .

This will create an entry in the nix store with the built site and a
symlink pointing to the build

Build the repository without checking out with the command

    nix build github:gbirke/lebenplusplus

Build a branch with

    nix build github:gbirke/lebenplusplus/some-branch-name

Build to a different directory with the `-o` (`--out-link`) parameter

    nix build -o /var/lib/www/lebenplusplus/htdocs github:gbirke/lebenplusplus

