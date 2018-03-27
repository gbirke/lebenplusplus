---
layout: post
title: Migration from Spress to Hugo
tags: [blog,meta,software,wikimedia]
description: My experiences with migrating my blog from Spress to Hugo
date: "2017-12-03"
draft: true
---

Frontmatter conversion
frontmatter-editor library
* Add "date" property to posts - date, filename or file modification time. Needed frontmatter lib fork to use filename
* remove "layout" property
* Add "draft" flag based on path

Rename "posts" directory to "post" to match special handling by theme

Convert HTML posts to markdown with pandoc

Adaptations for theme, explain inheritance

TODO: Benchmark
