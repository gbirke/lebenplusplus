---
title: "Notational Velocity in the Terminal"
date: 2020-04-19
tags:
  - note-taking
  - search
  - shell
  - vim
categories:
  - wikimedia
description: "How to build a search-and-create note-taking system with Vim and fzf"
---
When Evernote changed their licensing model in 2016, I switched to plain-text markdown
notes, using the application [nvALT](https://brettterpstra.com/projects/nvalt/) for
searching and editing.
nvALT has a three-pane interface: A search bar at the top, a
list of notes, sorted by modification date on the left and a big
note editor on the right. Hitting enter in the search bar changes the focus to the
selected note *or* creates a new note with the search term - a quick way to create new
notes. I sync the notes between devices via [NextCloud](https://nextcloud.com/). I love
the simplicity of the application and have been missing it when working in my Linux
environment. I looked for a way to replicate the experience on the command line,
preferably with Vim as an editor or as a Vim plugin. In this article I'll
outline some of the approaches.

## Vim plugin: alok/notational-fzf-vim
The plugin [alok/notational-fzf-vim](https://github.com/alok/notational-fzf-vim) relies on
two external commands - [`fzf`](https://github.com/junegunn/fzf), the fuzzy finder and
[`rg`](https://github.com/BurntSushi/ripgrep) (ripgrep), a grep replacement written in
Rust. `fzf` has a special parameter called `--preview` that shows the current selection in
a side pane.

I found this plugin useful but have one major gripe - when `rg` finds the search term
multiple times in the same note, the plugin will show all occurrences of the search term
in the notes, showing the same note multiple times. My most common use case with my notes
is to quickly jump to a note by searching for words in their title. [There is already an
issue for that](https://github.com/alok/notational-fzf-vim/issues/22). The feature of
jumping to the exact occurrence of your search term is appealing, though.

By default, the files are also not ordered by modification date but by search rank.

## Vim plugin: cwoac/nvvim
The plugin [cwoac/nvvim](https://github.com/cwoac/nvvim) tries to emulate the two panes of
nvALT more closely - it splits the Vim window into a search pane and an editor pane. For
the full-text search it uses Python bindings and the [Xapian](https://xapian.org/) indexing
engine, which is less resource-intensive for big note directories.

I won't use this plugin, because for me it had the following shortcomings (some of them
might be me using it wrong):
- It sorts the files alphabetically, not by modification date. [This is a known issue](https://github.com/cwoac/nvvim/issues/31).
- When starting the plugin, the search pane has focus but the interactive search does not update the document list for me. Hitting enter updates the list but also creates a document with the search term. After switching to the editor pane and hitting `\i` to start a new search, the search pane works fine.
- I don't like the split view with panes - the note pane is too narrow, leading to line breaks.
	When quitting Vim, I have to remember to type `:qa`, otherwise Vim will only close one
	pane instead of quitting.
- One file ending in `.io.md` was not indexed. I guess the built-in file suffix restriction was too restrictive here.
- There is no preview of the file. I often want to look up notes, without editing.
- When saving a file, it shows an update message from Xapian 

## Custom shell function

Inspired by [this YouTube film](https://www.youtube.com/watch?v=r_eJvqBDzPo) I wrote my
own shell function, based on `fzf`. I'm using the `--preview` parameter to show
a preview of the note. I could use `cat` or `head` for previewing, but I'm
using the `preview.sh` script that comes with the [fzf.vim
plugin](https://github.com/junegunn/fzf.vim). When the program
[bat](https://github.com/sharkdp/bat) - a `cat` replacement - is installed,
`preview.sh` will do some rudimentary syntax highlighting when.

I have created the script `open-or-create-note` that takes 2 parameters and will start Vim
with the first parameter (the search query) when the 2nd one is empty:

I bind this script to the enter key and give it the search query from `fzf` as the first
parameter and the selected file as the second. When I hit enter on an empty selection,
`open-or-create-note` will create the file.

This is the full function definition (with line breaks for better readability):

```shell
function vnote() {
    ls -1t ~/Nextcloud/Notes/ \
    | fzf \
      --preview "preview.sh ~/Nextcloud/Notes/{}" \
      --preview-window=right:wrap \
	  --bind "enter:execute(open-or-create-note {q} {})+abort" \
      --ansi -e
}
```
## Conclusion

I think the combination of my shell function and `alok/notational-fzf-vim` will serve me
well. I will try to use them on my Mac. If the plugin becomes too slow or I want to have
full-text search on the command line, I'll look into integrating
[recoll](https://www.lesbonscomptes.com/recoll/) for indexing text the files and using the
`fzf` clone [skim](https://github.com/lotabout/skim), which supports refining the
search result list interactively.


