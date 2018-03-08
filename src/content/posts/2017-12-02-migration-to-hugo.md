---
layout: post
title: Migration from Spress to Hugo
tags: [blog,meta,software,wikimedia]
description: My experiences with migrating my blog from Spress to Hugo
date: "2017-12-03"
draft: true
---

Add "date" property to posts - need to be inserted from file name

Problematic "layout" property
* Remove with `find src/content/ -type f -print0 | xargs -0 sed -i /^\s*layout:\s+\w+\s*$/d `

Rename "posts" directory to "post" to match special handling by theme

Convert HTML posts to markdown with pandoc

Adaptations for theme, explain inheritance

TODO: Benchmark
