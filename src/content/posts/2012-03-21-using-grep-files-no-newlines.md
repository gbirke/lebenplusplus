---
layout: post
title: Using grep on files with no newlines
tags: [unix, linux, regex, shell, wikimedia]
---
I had a big, automatically-generated HTML file without newlines and
wanted to see all occurences of a certain image name. Using
`grep my_image.png` just outputs the whole file - not useful! While
writing the question to the unix section of StackExchange, I found a way
to do it with `grep`:

     grep -oE ".{30}my_image.{30}"

This command yielded the desired result: Each occurrence on a separate
line, with 30 characters before and after.

*Explanation*:

-   The `-o` option changes the default `grep` behavior (print matched
    line) to printing only the matched string.
-   The `-E` activates the extended regular expression syntax, which I use
    in the matching expression.
-   `.{30}` is a regular expression meaning "any 30 characters", so i
    can see the surrounding context of the match. If you are using this,
    you could use `.{0,30}` to avoid missing matches that are not in the
    first/last 30 characters of the file but that slows down the search.
