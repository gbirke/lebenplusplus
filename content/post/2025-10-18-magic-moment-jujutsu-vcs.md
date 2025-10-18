---
title: "My Magic Moment with Jujutsu VCS"
date: 2025-10-18
tags:
  - version control
  - git
  - jujutsu
  - shell
categories:
  - wikimedia
description: "The moment where I finally saw the great benefits of Jujutsu
VCS over Git"
---

After some gushing praises from colleagues and people at SoCraTes Austria
2025, I wanted to try [Jujutsu VCS](https://jj-vcs.github.io/). To force
myself to go through with it and really learn it, I vowed to make `jj` my
daily driver for all work-related projects in October 2025. Now, two weeks
into the experiment, I experienced my "magic moment" that effortlessly
resolved the biggest pain point I had with Git, GitHub and the way we work
in our team: Stacked (i.e. dependent) commits. Let me tell you the story
of my joyful journey with `jj` ...

At first, using `jj` was hard. [The Git Command Table](https://jj-vcs.github.io/jj/latest/git-command-table/) that "translates" Git commands into Jujutsu commands was my best friend. I was at the "Novice" end of the [Dreyfus Scale](https://en.wikipedia.org/wiki/Dreyfus_model_of_skill_acquisition), trying to substitute `git` commands with `jj` commands and being frustrated that some operations seemed more complicated or long - `jj bookmark set my-branch -r @` versus `git checkout -b my-branch`? Meh. And if I add commits to a branch and want to push it, I have to create a [`tug` command](https://shaddy.dev/notes/jj-tug/) to my configuration? Inconvenient.

Then I started to reap the first benefits. With `jj` you don't need to
"stage" commits like you have to with Git. `jj` automatically adds all
changes to the current commit. Technically it only adds them when you run the next `jj` command, but I tend to frequently use commands to look at the history (`jj log`), status (`jj status`) or current changes (`jj diff`). Forgetting to stage changes or constantly amending the last commit (an alias for `git commit --amend -all --no-edit` is a necessity in my git configuration), was a think of the past.

Amassing code changes for different features and refactorings in one commit goes against professional pride, so I looked at the documentation on how to "split" commits. With Git, this was always a tricky endeavor, carefully using the staging area, the `git reset` command, always struggling to remember if I needed to use `reset --soft` or `reset` without parameters, hoping the original commit message stays in `ORIG_HEAD` and, if you wanted to change a commit that's further down the line, using the `git rebase --interactive` and hoping not to accidentally damage or destroy commits. With `jj`, using `jj split`? A breeze. Let's have a look why.

Both Git and Jujutsu have the model of a "chain" (a [directed acyclic
graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)) of changes.
But the projects have definition of a "change". For Git, a change is an
immutable commit, with a commit ID. If you want to "rewrite history", i.e.
change the graph of changes (edit files, change commit description, reorder, drop or squash commits), you replace a commit with a different commit.
For Jujutsu, the graph consists of a chain of of mutable changes, each one
with a change ID that does not change itself when you edit the underlying
files or the description of a change. Other than in Git, where you make
the history malleable by temporarily going into
"rebase mode" (and `$deity` help you if you can't finish it and have to
abort, throwing away all your effort), working in Jujutsu mean everything
you do is a change and that's it. And because the changes are much more
granular, undoing mistakes is also easier - using `jj undo` or the
"operation" log that is a protocol of every change and that allows you to
reset your repository to any previous state. Under the hood, Jujutsu uses
Git as a "storage engine", which means it takes care to maintain a "chain
of commits". Each time you make a change, your Change ID gets a new
internal commit id.

So what happens if you run `jj split`? You get a nice text UI where you
can select files (or individual hunks of changes in files) that you want
to keep in the current change. Everything unselected goes into next
change. After the split you can use `jj edit @-` ("edit previous change")
to "check out" change and see if split it correctly and all the tests still pass. Forgot to select something? No big deal, just pull the file from the next change with `jj restore --from @+ path/to/file`.

TODO:  e workflow vs. squash workflow

TODO: interaction with GitHub branches through bookmarks. The jj data model means that pushing is the equivalent to `git push --force-with-ease`, because you have to override the commits at the remote end.  `jj git fetch` of a remote branch will reset your tracking branch,
even if someone rebased it remotely. No more clumsy `forcepull` aliases


Outline

- tried jj because of recommendation & hype
- struggled, but translation table of git commands helped
- no staging area (git index?), nice
- Concept of `@` is both shorter than `HEAD` and more memorable, because
it's where your're "at".
- Mutable changes, DAG => Permanent rebase, no need for `git ca` (commit again or "commit all with
  amend and no edit"). Great for small, meaningful commits.
- Easy to pull changes up and down the graph, I like the default UI with
  selections
- Magic Moment: dependent branches, changes ripple through all branches
`jj git push --all`
