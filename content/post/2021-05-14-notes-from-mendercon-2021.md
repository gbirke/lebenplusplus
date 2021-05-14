---
title: "Notes from MenderCon 2021"
date: 2021-05-14
tags:
  - conference
  - software-craft
  - testing
categories:
  - wikimedia
---
My notes from [MenderCon 2021](https://mendercon.com/),
an open space conference on modernizing and improving existing codebases.

<!--more-->

### Keynote - On Platform migration

Scott M. Ford questioned the practice of rewriting most of the application
when migrating to a new version of a programming language or framework. As
a metaphor, he drew from construction and city planning. "If you change
the foundation of a house, you surely have to demolish the
whole house, right?" Usually the answer is "yes", but the answer ignores
the opportunity cost - while the house is torn down and rebuilt, the
inhabitants have to live elsewhere, the cost of moving (twice), etc.

Ford then showed examples where whole buildings were moved
([Chicago](https://en.wikipedia.org/wiki/Raising_of_Chicago),
[Galveston](https://en.wikipedia.org/wiki/Galveston,_Texas#Hurricane_of_1900_and_recovery),
[Shanghai](https://edition.cnn.com/style/article/shanghai-relocate-building-preservation-intl-hnk-scli/index.html),
[AT&T
Building](https://en.wikipedia.org/wiki/AT%26T_Building_(Indianapolis))),
without much interruption for the inhabitants. He then posed the question,
if those feats of engineering can be done in the physical world, why not
do them for software. This would avoid the [numerous
problems](https://8thlight.com/blog/doug-bradbury/2018/11/27/true-cost-rewrites.html)
[of
rewrites](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/).


### The Gilded Rose Kata
This is one of my favourite coding exercises, because it can train so many
essential programming skills:

- Coping with and appreciating legacy code: the initial project has no
	tests, but it works and brings value
- Acceptance testing: instead of trying to build unit tests, build an
	acceptance test from the output of the program.
- Finding edge cases
- Refactoring
- Reading comprehension: the README explains all the business rules
- Discovering a business domain from code: ignoring the README and letting
	the tests and coverage guide you.
- Transforming a procedural-style program into a different paradigm
	(object oriented or functional) and seeing how the paradigm improves
	the design and architecture.

We worked on the exercise in a modified [Mob
programming](https://www.agilealliance.org/resources/experience-reports/mob-programming-agile2014/)
setting, where there was one navigator instead of all participants "navigating", switching roles every two
minutes. I found this experience more pleasing than past mob programming
sessions, which often devolved into lengthy discussions between all the
navigators.

I learned a new series of steps and heuristics for writing unit tests -
[ZOMBIES](https://www.agilealliance.org/resources/sessions/test-driven-development-guided-by-zombies/).
You start with the "Zero" cases, where the system under test has no state
and you did not interact with it. Then you test the "One" cases, simple
examples or scenarios (the "S" in ZOMBIES) with one interaction that
delivers a result, side effect or new state. By this time, the
interface and behaviour (the "I" and "B" in ZOMBIES) of the class should be
clear. You continue with the "Many" cases - complex interactions of
behaviour, input parameters and state, also testing exceptional and error
states (the "E" in ZOMBIES).

We worked on the Python example and what totally blew me away was the
automated safe refactoring of [Sourcery](https://sourcery.ai). It took the
convoluted mess of `if` statements and created an easy-to-understand
`switch` statement out of it! I wish there were refactoring tools like to
for PHP.

### Capturing context of decisions, retrospectively

The source code of an application tells the reader *what* it does and
*how* it does things. The code seldom answers the question *why* it does
things in a certain way, *why* a feature was implemented or a workaround
was put in place. Answers to the question *why* become important when the
original assumptions might longer be true and a piece of code makes us go
"huh?". It's useful for a maintainer of legacy code to adopt an
archeologist or anthropologist mindset and ask the questions "How did this
piece of code evolve?" and "What circumstances, culture and assumptions
must be true, for this piece of code to make sense?"

We discussed the methods to capture and preserve the "why" of code:

- **Commit messages** - [Commit messages should answer the "why" of a code
	change](https://chris.beams.io/posts/git-commit/).
- **Commit history** - helps to see the evolution of code. [`git log` has parameters to help list changes in specific files.](https://tekin.co.uk/2020/11/patterns-for-searching-git-revision-histories)
- **[Architectural Decision Records (ADRs)](https://github.com/joelparkerhenderson/architecture_decision_record)** - They document the assumptions and technical decisions a team of developers made.
- **Infrastructure** - Ticket systems, discussions on pull requests, sprint planning boards they all answer the "why" and can show which stakeholders were involved in a decision (to ask them for more information, not to blame them of course). The more integrated the infrastructure is with the code and version control, the fewer context switches and (browser) windows the developer has to use to answer questions. One could even imagine a future or system where all those artifacts are stored alongside the code and version history!
- **Literate Programming** - We could not find an example, where [Literate
	Programming](https://en.wikipedia.org/wiki/Literate_programming) was
	employed for a large-scale system. It seems to be suited more for
	scientific papers, where the code is supporting the text.
- **Comments** - We agreed that comments are inferior to other methods of
	record-keeping. They tend to get outdated, developers are afraid to
	delete or edit them, and they get in the way when a developer tries to
	figure out the "what" instead of the "why". But used sparingly, to
	inform other developers of the "why", they can still be a valid tool.

All the artifacts, tools and people of a code base form a [Symmathesy](https://medium.com/@jessitron/symmathecist-n-c728957ce71f).

In our discussion we discovered that the description of "why" uses natural language and
we briefly speculated about the evolution of programming languages and if
people will ever use "natural" language to tell computer what to do. [I
highly doubt
that](http://mdmstudios.wordpress.com/2010/08/28/programming-will-never-be-easy/).
To quote a [popular
comic](https://www.commitstrip.com/en/2016/08/25/a-very-comprehensive-and-precise-spec/?):
"Do you know the industry term for a project specification that is
comprehensive and precise enough to generate a program?" "It's called
'code'."


### Other Links/Resources

- [Provable refactorings](https://github.com/digdeeproots/provable-refactorings) - A collection of refactoring recipes that are provably safe. Each recipe is language-specific and rests on the rules of that language. Within that language, each will either terminate with a clear failure or will complete in a way that guarantees no change in behaviour.
- [The hidden cost of estimates](https://www.chrislucian.com/2018/08/the-hidden-costs-of-estimates.html)
- [release-please](https://github.com/googleapis/release-please) -
	Automated release note generation based on [Conventional commit messages](https://www.conventionalcommits.org/en/v1.0.0/)
- [Llewellyn Falco](https://www.youtube.com/user/isidoreus/videos) - A
	YouTube channel with refactoring examples.
