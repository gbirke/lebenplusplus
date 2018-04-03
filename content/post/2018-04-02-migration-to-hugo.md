---
title: Migration from Spress to Hugo
tags:
  - blog
  - meta
  - PHP
  - JavaScript
  - software
  - webdesign
date: '2018-04-02'
categories:
  - wikimedia
---
## History and Motivation
The list of [static site generators](https://staticsitegenerators.net) is very long, but which one should you choose? When I ported this blog from Drupal to static HTML, I chose [Spress](http://spress.yosymfony.com), written in PHP, because PHP was my main programming language, its code looked well-thought-out, relied on established libraries and did everything I wanted out of the box and with a minimum amount of configuration. However, during the last year there was only one minor release of Spress and I missed some features I saw in other projects:

* Instant preview (and reload) of changed pages
* Table of contents
* Display word count and reading time
* Better handling of folders: The "posts" folder in Spress is handled differently than the rest, resulting in drafts being visible.

I did not want to use [Jekyll](https://staticsitegenerators.net) because of its opinionated directory structure and because it's based on Ruby (which I like as a language, but I don't like the ecosystem). So I chose [Hugo](https://gohugo.io), which is popular, actively developed, very fast, has the features I outlined above and because I once saw a beautiful theme called [Redlounge](https://github.com/tmaiaroto/hugo-redlounge). I ultimately chose a different theme ([Blackburn](https://github.com/yoshiharuyamashita/blackburn)), but Redlounge was very appealing.

## Migration steps
### HTML conversion
I had 4 HTML posts left over from the Drupal version of the Site. Spress rendered HTML content out of the box, while Hugo didn't, so I decided to convert them to Markdown with [pandoc](https://pandoc.org). The generated Markdown was good and only needed minimal cleanup: quotes were backslash-escaped and HTML-related code snippets needed to be reformatted.

### Front matter conversion
While the Hugo [front matter](https://gohugo.io/content-management/front-matter/) format for the post metadata is quite similar to that of Spress, there were subtle differences, that needed the following conversion steps:

- Spress gets the post date from the file name, while Hugo [until recently](https://github.com/gohugoio/hugo/pull/4494) needed a `date` property.
- Remove properties that have different meanings in Spress and Hugo, like `layout` and `lang`. See below on multilanguage handling.
- Convert `wikimedia` tag into a category. I've used that tag in Spress to mark all posts that should appear on the [Wikimedia Germany Software Department page](https://software.wikimedia.de/department) and added special code to my Spress theme to hide the tag. Now I'm using categories instead, since my chosen theme does not display categories anyway.`

For an automated conversion of the front matter data, I forked the `frontmatter-editor` Node.js library and [added the ability to access file properties during the front matter change callback](https://github.com/saltfactory/front-matter-editor/pull/4), which was needed for inserting the date property from the file name. You can look at the [front matter conversion script](https://github.com/gbirke/lebenplusplus/blob/spress-master-old/migrate-frontmatter/index.js).

### Multilanguage content
Language in Hugo is determined by the file name, by adding the language code to the suffix, e.g. `my-post.de.md`. I had only two German posts and renamed the files by hand. This also meant that the posts will no longer show up in the regular, English post list, which I see as a good thing because I keep those posts only for archival purposes.

### Theme adaptation
What I like about Hugo is that you can override specific templates, without changing the theme files. This is done in the `layouts` directory. I've added some minor changes to

* add classes to specific parts of the page
* add tracking code for [statcounter.com](https://statcounter.com/)
* Add the correct `lang` attribute to the `<html>` tag.
* Link to German posts

## Conclusion
Migrating to a different static site generator and theme is possible and straight-forward. However, it might cost some time to tweak the theme to look exactly like you want. Converting the front matter of posts might also take some effort, but can largely be automated.

All in all, I'm very happy with my new blog.
