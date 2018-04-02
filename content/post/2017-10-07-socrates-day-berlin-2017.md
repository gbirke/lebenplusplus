---
title: Ideas and links from SoCraTes Day Berlin 2017
tags:
  - conference
  - agile
  - craftsmanship
  - testing
  - communication
date: '2017-10-07'
categories:
  - wikimedia
---
<a href="/assets/images/posts/schedule_socrates_day_berlin_2017.jpg" class="image-link" style="float:left;padding-right:20px"><img src="/assets/images/posts/schedule_socrates_day_berlin_2017.jpg" width="300" height="300"></a>
I attended the SoCraTes Day Berlin and came back inspired and full of ideas I want to share with the world.


## Lean Coffee
We discussed estimations (Complexity vs time, who needs them, when are they helping) and I learned about the method of "[Magic estimation](http://www.barryovereem.com/magic-estimation/)". Someone mentioned "[Scripts to rule them all](https://github.com/github/scripts-to-rule-them-all)", an attempt to establish a common set of scripts in each project that do certain project tasks like bootstrapping, resetting, updating, running the CI validation, etc. The actual instructions of the  scripts can be different for each project, programming language and environment (Docker vs bare metal), but their names are the same and help to establish a common language and entry point into a project/repository.

## Hard times at work
A Soundcloud engineer talked about her burnout and that de-stigmatizing and supporting people with mental health issues should become more and more common in the workplace. "Support" can mean having an anonymous hotline, publishing information about mental health issues and making the topic more visible overall. Because more people than you might think are suffering from them and most people you know don't know enough about what's helpful and what's not.

## TDD as if you meant it
When you write a failing test and then write a class to make it pass, you have already made more design decisions than you realized: Naming classes, methods and parameters, using object oriented programming, defining a public interface. You probably also have a rough idea how your final solution will look like and writing tests feels like "going through the motions" to reach your goal. Some refactoring will probably happen, but not much.

"TDD as if you meant it" (TDDaiymt) imposes more constraints than "Red - Green - Refactor". You must first write the code to pass the test *inside* the test class and are only allowed to refactor it out if it smells. Also, your steps must be really small: Use scalar values before you give them variable names, use variable names, before refactoring them to functions, think hard before moving functions into classes. Ask yourself "what does this value *mean*?" before naming things. List all the concepts you encounter through naming. Stop and "triangulate": think about what design decisions on what parts of the domain you want to explore next. With this very slow and mindful approach, you are able to let the design emerge from the domain instead of having preconceived notions of the domain.

* [Original presentation by Keith Braithwaite](https://www.infoq.com/presentations/TDD-as-if-You-Meant-It)
* [A series of screencasts by Adrian Bolboaca](http://blog.adrianbolboaca.ro/2017/08/tdd-as-if-you-meant-it-think-red-green-refactor-episode-1/), the brother of Alexandru, the speaker at SoCraTes Day.

## What is 'Good Code'?
Solving the ["99 Bottles of Beer" Kata](https://www.codewars.com/kata/52a723508a4d96c6c90005ba) and evaluating different approaches to the solution, based on experience, opinion and metrics. Basically, the first chapter of the excellent book "[99 Bottles of OOP](https://www.sandimetz.com/99bottles/)" by Sandy Metz.

## Anatomy of an Argument
An open discussion about conflicts in the workplace. Some ideas and quotes:

* Different people have different emotional "intensity settings". There are people, who can't watch movies because they are overcome with emotions and who react strongly to even very small incidents.
* By asking yourself "How long am I willing to argue this? 5 minutes, 15 minutes, 1 hour, 1 day, forever?" you can gauge how important a topic is to you and how emotionally invested you are in it.
* Slightly tongue in cheek: Many developers have a [God Complex](https://en.wikipedia.org/wiki/God_complex), because they are continuously creating new worlds with just their minds and their language. Other developers might appear like the devil in that scenario, subverting their beautiful creation.
* Try to separate the **alternatives** (different ways of doing things and their pros and cons) and your **preferences** (the weight you assign to the pros and cons).
* Current research in psychology shows that decisions are made emotionally and then rationalized afterwards.
* "Sometimes, the person opposite of you is a monkey in a tree, throwing coconuts at you. You then have to talk the monkey out of the tree instead of climbing your own tree and start throwing coconuts in retaliation."
* Many conflicts between developers arise from their identification with their code. If their code is criticized, they feel criticized. They might not even realize that they're identifying themselves in some shape or form. Try to help everyone to detach themselves from their code, foster a culture of "ego-less programming".
* Try to assess what your typical stress reactions are, e.g. tensing up, clenching your jaw, getting sweaty palms, feeling your heart race. If you get a stress reaction while you're  reviewing other people's code, try to recognize it as such and think "This is just code and it probably does what it should do. Just because I'd implement it differently, it's not bad."
* "My job as a CTO is to keep myself from rewriting everything."
* Tell your teammates what you like about what they're doing.

## Miscellaneous Links
* [Liberating Structures](http://www.liberatingstructures.com): Communication patterns that help alleviate power dynamics, giving everyone a voice and fostering creativity. The session was canceled, but there are Meetups in Berlin.
* [Usable Software Design](https://leanpub.com/usablesoftwaredesign/): How to use UX techniques to design your code for a special kind of user: other developers.
* [Integrated Tests are a scam](http://blog.thecodewhisperer.com/permalink/integrated-tests-are-a-scam): A provocative article why integration tests must die.
* [Legacy coderetreat](http://blog.adrianbolboaca.ro/2014/04/legacy-coderetreat/)

