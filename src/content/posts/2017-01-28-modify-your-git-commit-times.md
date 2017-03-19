---
layout: post
title: How to protect your privacy by changing your Git commit times
tags: [git,privacy,shell,wikimedia]
---

Your Git commit logs provide a good approximation of your habits and time zone: When you sleep, if you are working full time, which projects are private and and which are work-related (weekend vs workday commits), when you go to lunch, etc.

By setting the environment variables `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` before committing, you can change the recorded time of a commit.
But always setting those variables before committing becomes tedious, so I experimented with a shell function that sets the environment variables for me. The first attempt, `commit_yesterday`, is just a proof of concept:

```shell
#!/bin/sh
function commit_yesterday() {
    yesterday=$(date -v-1d)
    env GIT_AUTHOR_DATE=$yesterday GIT_COMMITTER_DATE=$yesterday git commit $*
}
```

What if you want to be more flexible when setting the date? Enter the `dcommit` function:

```shell
#!/bin/sh
# Set different commit dates
function dcommit() {
    commit_date=$( eval $1); shift
    env GIT_AUTHOR_DATE=$commit_date GIT_COMMITTER_DATE=$commit_date git commit $*
    fi
}
```

Here is an example of a Git session with `dcommit`, pretending to work 3 hours in the past:

```
$ source dcommit.sh
$ git add my_past_file
$ dcommit 'date -v-3H' -m "Add a file"
$ rm my_other_file
$ dcommit 'date -v-3H' -a
```

With the `date -v` command you can set the date to a fixed offset. But you can also go wild and set create the parameter to another function or shell script do more random or subtle changes. Some ideas:

- Always set the seconds to 23. Conspiracy nuts will marvel at your power!
- Fluctuating timezones: Set an hourly offset based on the current day: `offset=$(bc <<< "$(date '+%d') / 1.25 - 12")`
- Subtract 1 day if the current day is even (looks like you only commit on odd days).
- Set seconds to a value derived by [Base60-encoding][1] a secret message.

I've tried using a pre-commit hook instead of a custom command, but apparently [Git does not permit setting GIT_COMMITTER_DATE in a pre-commit hook][2].

If you're interested creating patterns (even small icons) in your commit history, have a look at [gitfiti][3] instead of fiddling with your commit dates.

**A warning:** It's probably a bad idea to mess with commit dates. I am no Git or shell expert and can not be held responsible if you mess up your repo or make your co-committers angry.

[1]: http://tantek.pbworks.com/w/page/19402946/NewBase60
[2]: http://stackoverflow.com/questions/32699631/can-git-committer-date-be-customized-inside-a-git-hook
[3]: https://github.com/gelstudios/gitfiti
