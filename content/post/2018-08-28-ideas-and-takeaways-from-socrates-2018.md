---
title: "Notes and Impressions From Socrates 2018"
date: "2018-08-28"
tags:
  - software craft
  - testing
  - functional programming
  - conference
categories:
  - wikimedia
description: My session notes from the 8th International Conference for Software Craft and Testing
---
Here are my notes from some of the sessions I attended.
<!--more-->
## Structuring React Applications
This combination of presentation and discussion made me smile and feel old. The first example was a big React component, with templating, logic and style all in one file. I felt like I time-traveled to the year 1998, looking at the first PHP applications. The proposed solution? Move out the styles into their own file and split the code into a *view* component that only uses properties and JSX templates and a *controller* component that contains the logic and event handling. Ahh, the lessons of 2005, where we learned to disentangle our big PHP with the help of [MVC frameworks](https://en.wikipedia.org/wiki/Model–view–controller).

We discussed how to structure your components into subdirectories and had the following proposals:

* Don't do it, it's ok to have lots of components in one subdirectory.
* Structure by level of composition, have directory names like `atoms`, `molecules`, `organisms`, `templates` and `pages`, inspired by the blog post "[Atomic Design Methodology](http://bradfrost.com/blog/post/atomic-web-design/)". This seemed confusing to us, but it seems sensible to [some people](https://codeburst.io/atomic-design-with-react-e7aea8152957).
* Structure by high-level page. But what about reused components?
* Structure by [domain](https://en.wikipedia.org/wiki/Domain-driven_design). Use a UI library for the low-level components to prevent the need for excessive re-use and composition.

## Event Sourcing
This session was an introduction to Event Sourcing and [Command-Query-Responsibility Segregation](https://en.wikipedia.org/wiki/Command–query_separation)(CQRS). I learned that data validation and processing is part of the command handling. The events that the command handlers emit are immutable and valid.

We discussed the benefits and drawbacks of event sourcing:

### Benefits
* Concurrency
* Immutable audit log
* You can set up new projections without the need to alter the old ones.
* Replay of events for debugging or new projections

### Drawbacks
* Eventual consistency
* You must not manipulate the state directly, only through events. If your events contain invalid data, your code must contain workarounds for the faulty data.
* Event evolution/migration is hard - in theory, your code must be able to handle old, faulty or incomplete events.

## Introduction to Nonviolent Communication
I held this session and was delighted when I saw that someone drew sketch notes. Heartfelt thanks to [Katja](https://www.katjasays.com/socrates-conference-2018-germany/), who also gave me the permission to post the notes here.

![Sketch Notes from my introduction to Nonviolent Communication](/assets/images/posts/Non-violent-communication-SoCraTes2018.png)

## Functional Calisthenics
Much like the [Object Calisthenics](https://medium.com/web-engineering-vox/improving-code-quality-with-object-calisthenics-aa4ad67a61f1), a set of refactoring rules to make your object-oriented code more [SOLID](https://en.wikipedia.org/wiki/SOLID) and readable, [Functional Calisthenics](https://codurance.com/2017/10/12/functional-calisthenics/) is a set of rules that will improve your functional code.

This session was a practical workshop where we wanted to try out the rules on the [Mars Rover kata](http://kata-log.rocks/mars-rover-kata). Me and my pairing partner struggled with the functional approach to the task, so we were more concerned about functional programming itself than the finer points of Functional Calisthenics. The hosts later continued the kata, but I was too tired and did not join again.

## Analyzing the Quality of Unknown Code Bases
This presentation was about the tools to analyze and visualize the quality metrics of a code base. If you're new to a code base, the tools will help you to get a first impression of the "bad spots".

* [Codecharta](https://github.com/MaibornWolff/codecharta) - A tool that takes software metrics from other tools, for example [Sonarqube](https://www.sonarqube.org/), and visualizes them using 3D tree maps. It has a [German Tutorial](https://www.maibornwolff.de/blog/code-visualisierung-mit-codecharta)
* [Codecity](https://marketplace.eclipse.org/content/codecity) - An Eclipse Plugin, similar to Codecharta.
* [code-maat](https://github.com/adamtornhill/code-maat) - analyze data from the version control system: which files change often, which files change in parallel, etc.
* [OWASP Dependency Check](https://www.owasp.org/index.php/OWASP_Dependency_Check) -  checks if there are any known, publicly disclosed, vulnerabilities. Currently supports Java and .NET, with experimental support for other languages.
* [Structure 101](https://www.maibornwolff.de/blog/code-visualisierung-mit-codecharta) Shows the dependency graph of Java and .NET namespaces.
* Analyze the access log files - you will know which URLs (routes of the web application) are the most heavily accessed ones.

The talk also gave an introduction to the ["Technical debt quadrant" by Martin Fowler](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html), defining the term "technical debt" more reasonably.

## The Dyad Meditation
This was an evening session. The [Dyad Meditation](https://medium.com/@laura.kroth/seeing-things-clearly-living-life-fully-why-i-love-dyad-meditation-233eb134c38e) is about listening to another person sharing their thoughts and feelings about deep questions like "If joy was your guide, how would your day look like?". And then switching roles and talking about that topic yourself, being aware of the thoughts that bubble up spontaneously. Afterwards I felt peaceful and connected, both to myself and all the participants. This is a form of meditation that works better for me than the other variations of "sitting still". I'll see if I find other practitioners in the [online community](https://www.dyadinquiry.org).

## Snippets, Links and Resources
* [Geb](http://www.gebish.org) and [Spock](http://spockframework.org) are libraries for writing high-level BDD browser tests in Groovy.
* CSS has an [`@supports` selector](https://developer.mozilla.org/en-US/docs/Web/CSS/@supports) you can use to test if the browser supports a specific property like `display: grid`.
* [Web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) must use a dash in their custom tag names, e.g. `<my-box>`. If you specify the name without a dash, you will get a cryptic error message. The W3C reserves dash-less tags for HTML.
* [Ramda](https://ramdajs.com) is a functional programming library for JavaScript that increases the composability of functions. Looking at Ramda code made me think of Haskell - which is a good thing.
* [Professor Frisby's Mostly Adequate Guide to Functional Programming](https://github.com/MostlyAdequate/mostly-adequate-guide) - An open source ebook for functional programming in JavaScript.
* I missed the "Loops Must Die" presentation, but there is a [German article "Weg mit den Schleifen"](https://m.heise.de/developer/artikel/Weg-mit-den-Schleifen-4009774.html)
* [Legacy Code Retreat](https://github.com/jbrains/trivia) - A messy, zero-coverage code base you can train your refactoring skills with.
* [Samurai Web Testing Framework](http://www.samurai-wtf.org) - A virtual machine that has been pre-configured to function as a web pen-testing environment.
* [reMarkable](https://remarkable.com/) - An e-ink "tablet" for note taking.
* [The Skeletons](http://bullypulpitgames.com/games/the-skeletons/) - A meditative storytelling game where the players are skeletons guarding an ancient tomb. I loved it!
* [Fiasco](http://bullypulpitgames.com/games/fiasco/) - A great storytelling game about big ambitions and bad impulse control.

## Why SoCraTes is awesome

### Content
SoCraTes has an Open Space format. People offer sessions on topics they are passionate about, on a broad range of topics, with a good mix between technical and social topics, all related to the question: "How can we write better software and how can we write it better". The venue provides at least 60 time slots per conference day that people can propose sessions for. At any given time you can choose between at least 12 sessions - a hard choice!

### Atmosphere
I don't know how the organizers do it, but coming to SoCraTes felt like going to a big gathering of friends. The general message to the participants is "How-, what- and whoever you are, you're welcome and appreciated. Take good care of yourself and don't do anything that isn't fun."

Thanks to all the people who gave me Kudos cards:

![Kudos cards for me](/assets/images/posts/Kudos_Socrates_2018.jpg)
