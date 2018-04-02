---
layout: post
title: Migration from Spress to Hugo
tags: [blog,meta,software,wikimedia]
description: My experiences with migrating my blog from Spress to Hugo
date: "2017-12-03"
draft: true
---
## History and Motivation
The list of [static site generators](https://staticsitegenerators.net) is very long, but which one should you choose? When I ported this blog from Drupal to static HTML, I chose [Spress](http://spress.yosymfony.com), written in PHP, because PHP was my main programming language, its code looked well-thought-out, relied on established libraries and did everything I wanted out of the box and with a minimum amount of configuration. However, I saw not many patches coming in and I missed some  features I saw in other projects:

* Instant preview (and reload) of changed pages
* Table of contents
* Better handling of folders: The "posts" folder in Spress is handled differently than the rest, resulting in drafts being visible.

I did not want to use [Jekyll](https://staticsitegenerators.net) because of its opinionated directory structure and because it's based on Ruby (which I like as a language, but I don't like the ecosystem). So I chose Hugo, which is popular, actively developed, very fast and has the features I outlined above and where I once saw a beautiful theme called [Redlounge](https://github.com/tmaiaroto/hugo-redlounge). I ultimately chose a different theme, but Redlounge was very appealing.

## Migration steps
I had 4 HTML posts left over from the Drupal version of the Site. Spress rendered those contents out of the box, Hugo didn't, so I decided to convert them to Markdown with [pandoc](https://pandoc.org). The generated markdown was good and only needed minimal cleanup: quotes were escaped and HTML-related code snipped needed to be reformatted. I'm quite happy with the result.

Spress interpreted Twig template tags Markdown content, which led to unwanted effects

Frontmatter conversion
frontmatter-editor library
* Add "date" property to posts - date, filename or file modification time. Needed frontmatter lib fork to use filename
* remove "layout" property
* Add "draft" flag based on path

Rename "posts" directory to "post" to match special handling by theme


Remove raw template tags around ansible blocks

Adaptations for theme, explain inheritance

I18n - Hugo enforces URL structure to indicate language, no mixed language or "lang" attribute in the frontmatter and a theme override.

TODO: Benchmark
