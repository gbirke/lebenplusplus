---
layout: post
title: Using grep on files with no newlines
tags: [unix, linux, regex, wikimedia]
---
I had a big, automatically-generated HTML file without newlines and
wanted to see all occurrences of a certain image name. Using the command
`grep my_image.png` just outputs the whole file - not useful! While
writing the question to the unix section of StackExchange, I found a way
to do it with `grep`:

```shell
grep -oE ".{30}my_image.{30}"
```

This command yielded the desired result: Each occurrence on a separate
line, with 30 characters before and after.

## Explanation of the command line

-   The `-o` option changes the default `grep` behavior (print matched
    line) to printing only the matched string.
-   The `-E` activates the matching of regular expressions, which I use
    in the matching expression.
-   `.{30}` is a regular expression meaning "any 30 characters", so I
    can see the surrounding context of the match. To avoid missing matches that are not in the first/last 30 characters of the file I could use the expression
    `.{0,30}` instead, but that will slow down the search, because the regular expression engine will try all combinations between 0 and 30 characters.
