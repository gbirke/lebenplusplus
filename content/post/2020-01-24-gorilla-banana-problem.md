---
title: "Thoughts on the Gorilla-Banana-Problem"
date: 2020-01-21
tags:
  - programming
  - softwarecraft
  - architecture
  - design
  - functional programming
  - object oriented programming
categories:
  - wikimedia
description: ""
---
[I encountered the humorous quote about gorillas and bananas again][1]:

> The problem with object-oriented languages is they’ve got all this implicit environment that they carry around with them. You wanted a banana but what you got was a gorilla holding the banana and the entire jungle.
>
> -- <cite>Joe Armstrong</cite>

I still laugh at the absurd image, but something about this quote has bothered me since I first encountered it in the article "[The two Pillars of JavaScript][2]". It bothers me, because in my understanding the problem is not the programming paradigm - Object-Oriented *versus* Functional programming. Pitting the paradigms (and languages that allow for easier programming in one paradigm) against each other is not helpful, if you want to get a good architecture and design of your domain. Let's have a look at some code examples of what I see as good and bad design of gorillas, bananas and jungles, to

example of bad inheritance hierarchy (banana <- plant <- being ), to inherit the `getColor` method  -> deeply nested inheritance, that's what [Eric Elliot ranted about][2]. Composition over inheritance.

example of bad inheritance hierarchy (with "owner" property of "base object") - bad design, what

bad example of accessing state, expecting a gorialla


My chat, to be expanded into 3 sections, with code examples of gorillas and bananas, coupled and decoupled.
I'm still wondering what he *means* by that. Is it a reference to the deeply nested object hierarchies that were popular 10-20 years ago? Then the argument is no longer valid, since we favor composition over inheritance. Is it a about dependencies, that you have to initialize dozens of dependent objects (gorilla, jungle) to construct one object (banana)? Interface segregation and dependency inversion (The I and D in SOLID) can mitigate that. small objects at the leaves of object trees usually don't point "back" to the objects that depend on them. Or is it about the *state* in objects, where you could theoretically access the gorilla through the banana? Then the joke is about references and pointers and can also be made about FP.

Very good article that also talks about design, the I and D in SOLID: https://www.quora.com/I-keep-hearing-about-the-banana-gorilla-jungle-problem-with-OOP-However-I-sense-that-this-is-a-fallacy-Am-I-right

Uncle bob article: https://blog.cleancoder.com/uncle-bob/2014/11/24/FPvsOO.html
Stack oveflow: https://softwareengineering.stackexchange.com/questions/368797/sample-code-to-explain-banana-monkey-jungle-problem-by-joe-armstrong

[1]: https://www.reddit.com/r/ProgrammerHumor/comments/bhwf9q/the_problem_with_objectoriented_languages_is/
[2]: https://medium.com/javascript-scene/the-two-pillars-of-javascript-ee6f3281e7f3
