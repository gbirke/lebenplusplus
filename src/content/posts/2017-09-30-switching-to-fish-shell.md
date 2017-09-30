---
layout: post
title: Four weeks of fish shell - first impressions
tags: [shell,software,review,mac-os,wikimedia]
description: My experiences switching from zsh to fish shell
---

At the [SoCraTes conference](/2017/08/27/impressions-from-socrates-2017) I attended a demo of the [fish shell](https://fishshell.com) and was so impressed that I pledged to use `fish` instead of `zsh` as my main shell for 4 weeks. This is the result of the experiment and contains my collected experiences.

## Fish is awesome
I really like `fish` and will continue to use it. The syntax highlighting of the the commands gives immediate feedback (unknown commands are shown in red) and the command autosuggestions are a real time saver. There are even more features I like:

- Word navigation with `Alt+Left` and `Alt+Right`.
- Very pretty, informative prompts, with easy definition of "right prompt".
- Prompt definitions are readable functions and not a jumble of escape characters
- Configuration lives in a directory (`~/.config/fish`) instead of one single file. It is modular and can stretch multiple files, making it easy to keep it under source control.

## Stumbling blocks
Not everything was awesome from the start. Indeed, the transition from a souped-up `zsh` environment to `fish` was very painful, because I made one mistake: Using the [budspencer theme](https://github.com/oh-my-fish/theme-budspencer). It was not the fault of the theme, but entirely the fault of my lust for shiny features. `budspencer` was the theme I saw at SoCraTes, it was so pretty and its feature description so enticing I immediately installed it. However, it has one trait that got in the way: [vi mode](https://fishshell.com/docs/current/index.html#editor). Vim is my favorite editor, so it seemed only natural to fully embrace the familiar keyboard navigation when editing commands. But what sounded great in theory collided with 20+ years of muscle memory and shell knowledge: I'm always moving the cursor with `Ctrl+A` and `Ctrl+E`, I'm used to getting a nice, searchable history with `Ctrl+R`, I like to type `sudo !!`, `cd -` and frequently use the `$!` variable.`fish` support these things, but the `budspencer` theme interfered too much with the default behavior of the shell, especially by enforcing vi key bindings that were incompatible with the key bindings of the plugins. Lesson learned: **Start with the default configuration, add features slowly and only when you really need them and understand how they work!**

The other hurdle was my accumulated `zsh` history which contains long commands that I use almost weekly but that are too long to remember. There is a [node.js script to import `zsh` history into `fish`](https://gist.github.com/christopherstott/59a5e36b8d2f3f015bb7), but my `zsh` history also contains thousands of worthless `cd`, `ls` and `less` commands I did not want to import. This was the moment where i wrote my first `fish` function:

## Searching the `zsh` history from `fish`

I already installed the "command line fuzzy finder" [`fzf`](https://github.com/junegunn/fzf) for accessing my `fish` history with `Ctrl+R`. The `fzf` command takes multiple lines of text as input and offers a search interface where you can search through the whole text and use the cursor keys to select one line which is printed to stdout when pressing enter. My function converts the `zsh` history file format (consisting of timestamps and commands, separated by semicolon), pipe it to `fzf` and then create a new command line buffer with the selected line. Looking at the [code for the `fish` integration](https://github.com/junegunn/fzf/blob/master/shell/key-bindings.fish) I came up with a configurable function:

```
function zsh_history -d "Search through the zsh history with fzf"
    set -q ZSH_HISTFILE; or set ZSH_HISTFILE ~/.zsh_history
    set -q FZF_ZSH_HISTORY_SEARCH; or set FZF_ZSH_HISTORY_SEARCH --no-sort

    # remove duplicate history entries with awk and only output commands
    awk -F\; '{ if( a[$2] == 0) print $2; a[$2]++ }' $ZSH_HISTFILE | fzf $FZF_ZSH_HISTORY_SEARCH | read -l result
    and commandline -- $result
end
```

The `awk` command is not perfect because it will mangle multiline commands, but overall the function works very well. It's storing every command as a key in the hash `a`, counting up its value whenever it encounters the command and only printing the command when the counter is zero. Suggestions for improving the parsing of multiline commands are welcome.

In the future I'll try to bind the function to `Alt+Z` (or rather `Esc+Z` on my Mac where `Esc` takes the role of the `Alt` key by default).

## My current setup
I'm using [oh-my-fish](https://github.com/oh-my-fish/oh-my-fish) as a "package manager" for plugins and themes, but at the moment I'm only using the
[`bang-bang` plugin](https://github.com/oh-my-fish/plugin-bang-bang) for repeating the last argument/command. I use [`bobthefish`](https://github.com/oh-my-fish/theme-bobthefish) as my theme. Using such a fancy prompt needs to have special fonts in macOS Terminal. I have replaced the default "Menlo" font with "Meslo LG S DZ Regular for Powerline" from the [Powerline fonts repository](https://github.com/powerline/fonts). "LG S" is for "small line gap", resembling the original Terminal font as closely as possible.

[I've configured my Terminal to accept `Alt+Up` keystrokes](https://coderwall.com/p/ygcaqg/get-alt-arrow-keys-working-in-fish-on-osx) to insert the last argument. With this setting I will probably use the `bang-bang` plugin less and less.

I decided to go with `oh-my-fish` because I already has good experiences with [`oh-my-zsh`](https://github.com/robbyrussell/oh-my-zsh). But `oh-my-fish` is more of a "spiritual port" than a 1:1 clone of `oh-my-zsh`. `oh-my-fish` even has a handy CLI tool to manage themes and plugins where `oh-my-zsh` solely relies on editing configuration files.

## Some minor pain points
- I have to get used to using `(somecommand)` instead of `$(somecommand)` or `` `somecommand` ``. Especially when copying docker commands from the web or from colleagues, it's `(pwd)` instead of `$(pwd)`.
- I Still have to fully understand key bindings, especially when needing to distinguish between vi mode and "normal mode".
- I have to memorize how to disable vi mode: `fish_default_key_bindings`
