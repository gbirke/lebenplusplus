---
title: "Git Repo Automation"
date: 2025-05-07
tags:
  - git
  - version control
  - automation
  - YAML
  - shell
categories:
  - wikimedia
description: "How to repeat changes and create commits in multiple repositories at once, without a monorepo"
---

You don't have a monorepo with monorepo tooling, but still want to do mass
changes on your collection of repos? In this article I'll show you how to do
that, using the command line tool [mani][1].

<!--more-->

## Example scenario: GitHub + dependabot configuration changes

At work, we use GitHub with dependabot, a service that creates pull
requests for whenever a library we depend on does a new release. GitHub
has announced that it'll change the dependabot configuration, removing the
`reviewers` setting and instead relying on a `CODEOWNERS` file.[^1] Now we
need to perform this change in all our repositories that use dependabot.

I'll use this real-world scenario as an example for the rest of the
article

## Configure the repositories

After I've installed `mani`, I change into the directory with all my
work-related Git repositories. In the following text I'll call this directory
the **mani root directory**. I ran the command

```sh
mani init
```

This creates the [configuration file][2] `mani.yaml` in the mani root directory.
Mani generates two sections: `projects`, which contains all the Git repositories
and `tasks`, which contains commands that you expect to use frequently.

You can add tags to each project. You can use these tags later to select
specific repositories, e.g. by language. I added a "dependabot" tag to all
repositories which use dependabot and "php" and "javascript" tags to all
repositories that use these languages.

## Run predefined tasks

In my `many.yaml` I have configured two tasks: 

1. Show which branch I have currently checked out in each repository
2. Switching all repositories to the
   `main` branch and pulling the `main` branch from the remote repository


```yaml
targets:
  all:
    all: true

tasks:
  git-branch:
    desc: show current git branch
    target: all
    cmd: git rev-parse --abbrev-ref HEAD

  git-checkout-main:
    desc: check out 'main' branch and pull latest version
    target: all
    cmd: |
      git checkout main
      git pull
```

With the `targets` section, you can run tasks on all repositories, bypassing the
need for tag or directory parameters in the `mani run` and `mani exec` commands.

To get an overview of the current state of all repositories, you can run

```sh
mani run git-branch
```

To check out the `main` branch on all repositories that use dependabot (i.e.
have the "dependabot" tag), you can run

```sh
mani run git-checkout-main -t dependabot
```

## Run ad-hoc tasks

For one-off tasks like my dependabot example, you probably won't define a task,
but run a series of ad-hoc commands with `mani exec`.

### Query the repositories

Before I use the `-t` flag to run my commands only in repositories that use
dependabot, I want to verify that I have tagged my repositories correctly. Each
repository tagged with `dependabot` should contain the file
`.github/dependabot.yml`. I want to output "YES" and "NO", depending on the
existence of that file. The following shell expression will do that when
run *inside* a repository:

```sh
(test -f .github/dependabot.yml && echo "YES") || echo "NO"
```

While working with `mani exec`, I frequently encountered this pattern: Try out
shell commands in one of the repositories until I found the right "magical
incantation", then switch back to the mani root directory that contains the
`mani.yml` file and run the command with `mani exec`. In cases where the command
changes files in the repository, you should run `git checkout .` to reset the
repository before switching to the mani root directory.

The following command will run the shell expression in each repository tagged
with `dependabot`:

```sh
mani exec --tags dependabot -o table '(test -f .github/dependabot.yml && echo YES) || echo NO'
```

The `-o table` parameter creates a tabular output and I should see only "YES" in
the second column.

How to invert this query to run the command in repositories which *don't* have a
"dependabot" tag? The `--tags` operator expects a comma-separated list of tags
and will apply the command to any repository that has one of these tags. Instead
of `--tags`, I can use the `--tags-expr` parameter, which allows [boolean logic
operators to combine tags][3]. In my case, I can exclude all repositories with
the `dependabot` tag using the `!` operator:

```sh
mani exec --tags-expr '!dependabot' -o table '(test -f .github/dependabot.yml && echo YES) || echo NO'
```

Now I should see a table that has only "NO" in the second column.

### Make changes and create pull requests

Before running the `mani` commands I've prepared two files in the mani root directory, `CODEOWNERS` and `commitmessage.md`. Then I ran the following commands:

```sh
# Create a new branch in each repository
mani exec -t dependabot 'git checkout -b introduce-codeowners'

# Add CODEOWNERS file to .github directory
mani exec -t dependabot 'cp ../CODEOWNERS .github/'

# Remove 'reviewers' key and all values from dependabot configuration
mani exec -t dependabot 'yq -i "del(.updates[].reviewers)" .github/dependabot.yml'

# Examine the changes, to see if they look like I expected
mani exec -t dependabot 'git status'
mani exec -t dependabot 'git diff'

# Stage changed files
mani exec -t dependabot 'git add .github'

# Commit staged changes
mani exec -t dependabot 'git commit -F ../commitmessage.md'

# Push branch to remote and track it
mani exec -t dependabot 'git push -u origin introduce-codeowners'

# Create pull requests for branch on remote, use commit message as description
mani exec -t dependabot 'gh pr create --fill --reviewers alice,bob'
```

### Tips for making changes

I had some difficulty finding a good method for changing the `dependabot.yml`
file. Initially, I did them with [`sed`][4], discovering [how to do multi-line
changes with sed][5]. It worked, but only because the `reviewers` key had the
same format in every file. With more variation in the YAML array value (bracket
syntax, more than one line etc) the `sed` approach could have left broken
configuration files. The [`yq`][6] command allows in-place editing using a path
syntax I already new from its JSON counterpart, [`jq`][7].

For code changes in a uniform code base I would try out the `diff` and `patch`
tools. For more involved code changes, I'd use language-specific tools that work
on the Abstract Syntax Tree (AST) of the code files.
For JavaScript I could use [jscodeshift][10], for PHP I'd use [rector][9]
or [phpactor][11]. The `phpactor` CLI tool allows for common
[refactorings][12] like renaming classes and variables and moving classes to another
namespace.

Beware of diminishing returns - the longer you have to fiddle to make a change
work, the fewer repositories affected, the higher the chance that doing the
change without automation will be faster and maybe even less error-prone. Cue
the two relevant XCKD comics:

<figure style="text-align:center;">
    <img 
        alt="How long can you work on making a routine task more efficient before you're spending more time than you save?"
        src="https://imgs.xkcd.com/comics/is_it_worth_the_time.png" 
    />
    <figcaption>
        <a href="https://xkcd.com/1205">Is it worth the time?</a>
    </figcaption>
</figure>

<figure style="text-align:center;">
    <img
        alt="Theory and reality of automation rarely match"
        src="https://imgs.xkcd.com/comics/automation.png"
    />
    <figcaption><a href="https://xkcd.com/1319/">Automation</a></figcaption>
</figure>

## Ideas for the future

Automating the same small change across multiple repositories, saving myself
from the tedium of repetitiveness, felt exhilarating. I already have more ideas
on how to use `mani` in the future:

- Update the dependencies in all repositories running `composer update` in PHP
  repositories and `npm update` in JavaScript repositories.
- Run [rector][8] command to auto-fix PHP deprecations when a new release of the
  PHP runtime comes out.
- Update the code style and then run the fix command to adapt all files.
- Update the runtime version of Node.js or PHP, run CI check, then create a new major release.
- Get a report of all repositories that use a specific dependency and show the
  version number of that dependency. This will help to detect inconsistencies.
- Get [authorship statistics][13] for all repositories
- You can run more than one task with `mani run`. `mani` will print the output
  from each task in a table column when running with `-o table`. I imagine 
  tasks that will give me an overview of the current branch, the last commit
  date, the last commit message and the state of the remote repository. Before I
  used `mani` I tried out the [gita][9] tool which has a `gita ll` command that
  produces this overview


[^1]: https://github.blog/changelog/2025-04-29-dependabot-reviewers-configuration-option-being-replaced-by-code-owners/

[1]: https://manicli.com/
[2]: https://manicli.com/config
[3]: https://manicli.com/filtering-projects#tags-expression
[4]: https://en.wikipedia.org/wiki/Sed
[5]: https://unix.stackexchange.com/a/26290/6341
[6]: https://github.com/mikefarah/yq
[7]: https://jqlang.org
[8]: https://getrector.com
[9]: https://github.com/nosarthur/gita
[10]: https://github.com/facebook/jscodeshift
[11]: https://github.com/phpactor/phpactor
[12]: https://phpactor.readthedocs.io/en/master/reference/refactorings.html
[13]: https://stackoverflow.com/questions/42715785/how-do-i-show-statistics-for-authors-contributions-in-git

