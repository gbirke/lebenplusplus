---
layout: post
title: Impressions from the Wikimedia Hackathon 2017 in Vienna
tags: [mediawiki,conference,javascript,docker,wikimedia]
---
I attended the Wikimedia Hackathon 2017 in Vienna. This is a summary and review of what I learned there while working on the prototype of the "Advanced Search Form" extension for MediaWiki.

The first hurdle for working on the feature was setting up a MediaWiki environment. The recommended way is the [Vagrant environment](https://www.mediawiki.org/wiki/MediaWiki-Vagrant), but I've had bad experiences with that in the past and did not want do download tons of stuff over the conference WiFi. Fortunately my colleague Adam Shoreland published his [Docker developent environment for Mediawiki](https://github.com/addshore/mediawiki-docker-dev) and it helped me setting up an environment with its own local URL relatively fast and smooth. It also downloaded lots of stuff, but that's because the environment contains two PHP versions, two webservers, two databases, phpMyAdmin, a Graphite db and a reverse HTTP proxy that makes it possible to choose the combination of PHP, webserver and database via URL (e.g. php7.nginx.mariadb.mw, php5.apache.mysql.mw, etc). In the future I'll probably take adams setup as an inspiration for a more slim setup.

For the rest of the Hackathon I worked with [Thiemo](http://maettig.com/) on the prototype of the "Advanced Search Form" that hides the complex search operators and prefixes of the [CirrusSearch](https://www.mediawiki.org/wiki/Extension:CirrusSearch) behind form fields. Thiemo had created a jQuery prototype and now we were converting the HTML generation into calls to the OOUI library. OOUI is a JavaScript "component library" that was conceived in MediaWiki for its Visual Editor, but is now a standalone library. The following remarks are my own opinion and impressions as a newcomer to the library:

- The ["OO" (Object Oriented) part of the library](https://www.mediawiki.org/wiki/OOjs/Inheritance) is easy to get wrong. You have to remember to call the parent and mixin constructors in addition to declaring the parents and mixins - after the initial class constructor. On the other hand, it's all done in vanilla JavaScript, there was no need for setting up a transpiler and packing chain. We'll see how this library will adopt the innovations of the JavaScript world.
- The [official documentation](https://www.mediawiki.org/wiki/OOjs_UI) is a bit sparse for the purpose of giving a thorough introduction into features and aspects of the components. I could have saved myself a lot of time and puzzled despair if I did not overlook the informative introduction, "[Building a ToDo app with OOjs-UI](http://moriel.smarterthanthat.com/tips/tutorial-building-a-todo-app-with-oojs-ui-part-1/)" in the "See also" section. Moriel Schottlender, the author of that article, was very patient and helpful when I had all my newbie questions. Big Thanks!
- The code examples that now comes with the [demo](https://doc.wikimedia.org/oojs-ui/master/demos/) (a feature developed at the Hackathon) will be a big help in the future.
- There came a point where the prototype had to become stateful, separating state, user events and UI elements. There is no suggestion for an actual architecture in the documentation, but as a pure component library OOUI is adaptable to MVC, MVVC and Flux/Redux. After talking to Moriel, I went with a classic Model-View-Controller pattern like she did in the "Recent Changes" filter.

My overall impressions of the Hackathon:

- Hotel and conference under one roof is a good concept for focusing on the hacking.
- Great Austrian food
- Well-organized, with many helpful tracks for newcomers.
- The presentations of the results were sometimes a bit hard to understand, both from the acoustics and the contents. For the next presentation session I'd suggest a 3-step template:
  1. State what the problem was (1-3 sentences, can be absurd humor to make it more entertaining and memorable).
  2. State what you did to solve it (1-3 sentences, no technical jargon allowed).
  3. Demo your solution. Try to tell a story out of the perspective of the original user who had the problem in step 1.


I'm looking very much forward to bring the search form as a beta feature and of course, next years Hackathon in Barcelona!
