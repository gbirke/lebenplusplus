---
title: "Check out your GitHub pull request with an interactive shell menu"
date: "2019-04-04"
tags:
  - github
  - regex
  - shell
  - ui
  - version control
categories:
  - wikimedia
description: How to select a GitHub pull request from a list in the shell, with a checkout when you hit Enter
---

When I want to check out a GitHub pull request of my colleagues on my local machine, I usually have to open my browser, go to the pull request page on GitHub, copy the branch name, do a `git fetch` in my terminal, followed by a `git checkout`, pasting the branch name. Annoyed by this context switch between terminal and browser and all that mouse movement, I devised a way to select the pull request from a list in the terminal, with a checkout when I hit Enter:

```shell
hub pr list | fzf | egrep -o '[[:digit:]]+' | head -n 1 | xargs hub pr checkout
```

In the rest of the article I'll explain the parts of the command line. At the end explain how to create a short command so I don't have to type the whole thing every time I want to check out a pull request.

*Prerequisites / System requirements:* I already have the command line programs [`hub`][1] and [`fzf`][2] installed on my system.

[`hub`][1] is a command line tool for interacting with GitHub. `hub pr list` uses the GitHub API to download the pull requests for the current repository and print the issue IDs and descriptions of all pull requests.

I don't want the list of pull requests printed on my screen, although that would already avoid having to switch to my browser window. Instead, I want to select from the list. To achieve that, I use the [pipe operator](https://ryanstutorials.net/linuxtutorial/piping.php) of the shell to send the the output of `hub pr list` as the input of the program `fzf`.

[`fzf`][2] is a "fuzzy finder" for the command line. It displays its input text as a selectable list. If I press Enter, it outputs the text of the line that is currently under the selection cursor. I've been using `fzf` as a tool to search through my shell history when pressing Ctrl-R.

The output of `hub pr list` is in the format

```
    #1235 Pull Request Title
```

`#1234` is the numeric issue id, the rest of the line is the title of the pull request.

The final command - `hub pr checkout` - needs the numeric issue id and will fail if it receives the whole line I selected. That's why I use another pipe operator to send the output of `fzf` to the command `egrep -o '[[:digit:]]+'`, which extracts the numeric issue id with a regular expression that matches a sequence of digits. With the `-o` argument, `egrep` restricts the output of the command to the matched characters instead of printing the whole line.

If the pull request description contains numbers, like "`#12345 Fixed 99 bugs`", the `egrep` command will output each sequence of digits on its own line. For the final command I need to restrict the output to the first matched number, the issue id, so I pipe the output of `egrep` to another command: `head -n 1`

`head` reads the first `n` lines of input and omits the rest. `-n 1` restricts the output to one line, the issue id.

Finally, I use another pipe operator and the `xargs` command to convert command line *input* to a positional command line *argument*. `xargs` appends the issue id to the `hub pr checkout` command, e.g. `hub pr checkout 1235`. The checkout command fetches the branch of the pull request from GitHub and checks it out as a local branch that tracks the remote branch so I can do `git push` without the `--set-upstream` argument.

To avoid having to remember and type that 80-character command line I have created a [function](https://ryanstutorials.net/bash-scripting-tutorial/bash-functions.php):

```shell
# Pull Request Check Out - check out pull request branches from GitHub
prco() {
    hub pr list             | # Download list of pull requests
    fzf                     | # Show list as selectable menu
    egrep -o '[[:digit:]]+' | # extract sequences of digits
    head -n 1               | # drop all but the first sequence (PR id)
    xargs hub pr checkout     # convert pro ID input to argument & check out
}
```

If I put this snippet into my [`.bashrc`](https://unix.stackexchange.com/questions/129143/what-is-the-purpose-of-bashrc-and-how-does-it-work), I can type the new command `prco` to get to my selection.

The next optimization step could be be error checking to avoid executing `hub pr checkout` when I did not not select anything in `fzf` by pressing Escape.

[1]: https://github.com/github/hub
[2]: https://github.com/junegunn/fzf
