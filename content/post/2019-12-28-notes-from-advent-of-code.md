---
title: "Notes for Advent of Code 2019"
date: 2019-12-27
tags:
  - functional programming
  - domain-driven-design
  - software-craft
description: "What I did and learned during the Advent of Code challenges"
---
2019 was the first year I have participated in the [Advent of Code](https://adventofcode.com/) challenges, encouraged by my colleague [Jan](https://fordes.de). I wanted to make it an opportunity to learn new programming languages and focus on functional programming. I started with [Racket][1], tried out [Elixir][2] and re-wrote the challenges that involved the "intcode computer" in [Scala][3]. This post is a review of the programming languages and the event itself.

## Racket
I've never got beyond a "Hello World" in any LISP dialect and all the [hubbub](http://www.paulgraham.com/avg.html) [around the language](https://blog.cleancoder.com/uncle-bob/2019/08/22/WhyClojure.html) intrigued me. With some experience in functional programming I felt right at home, and the unfamiliar syntax grew on me. I liked how the language encouraged me to write short, pure functions and structure my data in lists and tuples. If you write short, pure functions the amount of closing braces at the end of the function will be bearable. I liked that the space is the separator in lists, omitting the comma between elements felt weird at first, then efficient: Why bother with two characters (comma followed by a space) when your code is still as readable with a space? The `for*/list` construct for doing nested iterations felt powerful - in other programming languages nested iterations would lead to nested indentation, with `for*/list` you enumerate all the ranges up front, followed by the code. What I did not like about the language was that the higher-level ways to structure the data of your domain - with structs and classes - felt clumsy and verbose, leading to long function names and strange nesting syntax. This was the point where I switched from Racket to Scala for the "intcode" challenges.

Racket itself looked attractive because of its integrated IDE (DrRacket) and its "batteries included" feel. For example, the IDE can draw graphics inside the output console and I imagined I'd do some visualizations with that feature. But DrRacket was a disappointment, because it lacked the editing features I take for granted in an editor and its integrated debugger did not help much. I used Vim instead and was more productive.

Would I use a LISP dialect again? For Katas certainly. For a private or work project? Probably not.

## Elixir
I can't do the language much justice, as I've not used it extensively. I liked its functional style of programming, with small, pure functions. I liked how its type system and [pattern matching][4] forces you to think about all possible results of a function. In Elixir, you can pass functions as parameters, although it's one of the instances where the Erlang syntax with its arity specification shines though the otherwise pleasant syntax. Like with Racket, I did not like the syntax for describing the domain with structs, to keep related data together.

The Advent of Code puzzles I solved with Elixir did not let me explore the main strengths of Elixir - stability, multitasking and a good balance between functional purity and pragmatic access to impure resources. I'm curious to do a small web-based project with its [Phoenix framework][6].

## Scala
Scala allowed me to express my domain as classes and methods, while still keeping the problematic state changes in check by encouraging immutable data whenever possible. I did not create [Type Aliases](https://alvinalexander.com/scala/scala-type-examples-type-aliases-members) to properly name other parts of the domain. When looking at mutability, Scala is the least strict of the three languages and makes it tempting to write mutable code with the `var` keyword. I tried to avoid it, but in some cases I found it easier to do it. Like Elixir, Scala also has a [pattern matching][9] syntax.

I did not delve deeply into the performance implications of the different list structures, defaulting to `List` most of the time. I found an [in-depth description of the different pros and cons of different data structures on StackOverflow](https://stackoverflow.com/q/6928327/130121)

For one puzzle I wanted to create a small REST API or WebSocket around my program, but compared to other scripting languages like Node.js, Python, Ruby or PHP this would have involved so much boilerplate code that I abandoned the idea. I had a look at [Lift][7], [Play][8] and [Finatra](https://github.com/twitter/finatra), but they were "fully-fledged" web frameworks with a learning curve. I just wanted to expose some functionality via http. [Akka HTTP](https://doc.akka.io/docs/akka-http/current/index.html) would probably have done this, but for my tastes still needed too much boilerplate with unfamiliar syntax.

For day 13, where you had to create a [breakout-like game](https://en.wikipedia.org/wiki/Breakout_(video_game)), I found an article on the web that explains [ANSI escape codes on the console for creating interactive games](http://eed3si9n.com/console-games-in-scala).

## Conclusion
For me, Advent of Code was a good opportunity to learn new programming languages or try out new programming paradigms. But I have the feeling that I only scratched the surface of the programming languages I tried and probably did not write "idiomatic code" in all instances, particularly when writing Scala. And wrestling both with the puzzle and with the unfamiliar syntax added to the effort each day took, so I skipped some days where I found the puzzles too hard and stopped after day 13.

Looking at my code, I'm missing the coding style I use in my work: Strongly-typed code with names and data structures that describe the problem domain. I don't know if that's due to the time constraints, the language facilities, the mostly algorithmic nature of the puzzles or the functional programming style that lead to this. In 2020, I will investigate more how to combine domain-driven-design and functional programming.

I enjoyed the space- and lunar-landing themed backstory of the puzzles. The puzzles that felt most rewarding to me were day 8 - decoding an image - and day 13 - writing code that can play a breakout-like game. The "intcode computer" led me to a better understanding how computers work at a very low level.

I'm looking very much forward to next years Advent of Code!


[1]: https://racket-lang.org
[2]: https://elixir-lang.org
[3]: https://www.scala-lang.org
[4]: https://elixir-lang.org/getting-started/pattern-matching.html
[6]: https://www.phoenixframework.org
[7]: https://liftweb.net
[8]: https://www.playframework.com
[9]: https://docs.scala-lang.org/tour/pattern-matching.html
