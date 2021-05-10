---
title: "PHPUnit auto-test without an IDE"
date: 2021-05-10
tags:
  - PHP
  - testing
  - automation
  - command line
  - collaboration
  - terminal
categories:
  - wikimedia
description: "How to use command line tools to generate a continuously
updated report of your PHPUnit test results"
---

In this article you'll learn how to run your PHPUnit tests whenever a PHP file
changes. This is useful if you don't use an IDE that does this or want to
share the results during a pairing session where only one party has access
to a PHP execution environment.

With the command line tool [`entr`](http://eradman.com/entrproject/) you
can watch for changes in a list of files and run a command whenever one of
the files changes. You must provide `entr` with a list of files. To
generate the list of files, you can use the `find` command. Combining
`find`, `entr` and `phpunit` in a typical PHP project (with files in `src`
and `test`) looks like this:

```shell
find -f tests src -name '*.php' | entr -s 'vendor/bin/phpunit'
```

`entr` will react to *any* file change, so if you have a big project with
long-running tests, you might want to use the `--filter` parameter for the
PHPUnit command and use more specific directories in the `find` command.

Additionalliy to its terminal output, PHPUnit can also generate an HTML
report with the argument `--testdox-html report/index.html`. You can name
this anything you want, but make sure you avoid checking in the report in
your version control.

You can open the HTML file in ypur browser, but if you want to refrest it
autuomaticlly after eauch run of PHPUnit, you need a web server that sends
a "refresh" signal to the browser the file `report/index.html` changes.
I recommend using [browser-sync](https://browsersync.io/) for that. After
installing with `npm install -g browser-sync`, you can serve the report with

```shell
browser-sync start --server --serveStatic web --files report/index.html
```

You'll need two terminal windows or a terminal multiplexer like
[`tmux`](https://github.com/tmux/tmux/wiki) to run both `entr` and
`browser-sync` at the same time.

### Sharing the output with a pairing partner

I like to use [VS Code](https://code.visualstudio.com/) for my pairing
sessions, together with the [LiveShare
plugin](https://marketplace.visualstudio.com/items?itemName=ms-vsliveshare.vsliveshare).
Additionally to sharing your code, Liveshare
allows to share terminal contents.

Other options for sharing a read-only terminal are
[tmate](https://tmate.io/), a tmux fork that allows sharing of interactive
and read-only terminals via an SSH proxy, and
[streamhut](https://streamhut.io/) which "streams" your terminal output to
a web page.

You can also use the "Share Server" feature of VS Code LiveShare or a tool
like [ngrok](https://ngrok.com/) or
[localtunnel](https://localtunnel.github.io/www/) to share your local web
server with the PHPUnit HTML report for the duration of your pairing
session. The automatic refresh of `browser-sync` might break for your
coding partner, though.


