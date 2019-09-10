---
title: "Notes from Socrates 2019"
date: "2019-08-25"
tags:
  - software craft
  - testing
  - git
  - conference
  - type safety
categories:
  - wikimedia
description: My notes from the 2019 Conference for Software Craft and Testing
---
My notes from some of the sessions I attended, from hallway conversations and the schedule.
<!--more-->
## Refactoring legacy code
The refactoring session introduced me to a good heuristic on how to check what code is doing, while adding test coverage, and what parts of the code to refactor when the coverage is high enough.

When starting out with legacy code with nested control structures and method calls, you start with the *leftmost code*, i.e. the code that is the least indented in the method you test (assuming the indentation reflects the actual branching and looping). Ideally, you also start with the code that is *closest to the assert*, meaning you  start from bottom (where the method has a `return`) to top. After each test, check your coverage and see which parts of the code are still uncovered by your tests. When your tests provide enough coverage, check your test names and content to see if they reflect the business logic contained in the system under test (SUT).  

With enough coverage, you can start refactoring. For the refactoring, you start with the *rightmost code*, i.e. the code that is most indented in the production code. This code is the one has does the least amount of work and is the least "risky" to extract it into methods or child classes.  

Someone brought up the question, if there is a refactoring counterpart to Robert C. Martins "[Transformation Priority Premise][1]" (TPP). The premise is that when you change the behavior of your code in [the Test-Driven-Development cycle][2] (to make a red test green), you make the transformation (code change) that is least complex. Martin gives a prioritized list of transformations. The question remains, if possible refactorings also have a prioritized list or if the available refactorings are purely context-dependent.

## The Git data model and `git reset`
The "advanced" Git session enlightened me, what `git reset` really *means*. In the version control system Subversion (SVN), which I used before Git, `svn reset` had the semantics of "dismiss all changes and go back to the last commit". When switching to Git, I learned that the  commands  `git checkout .` and `git reset --hard` have a similar effect, but never thought about the different modes of `git reset`.

In this session I learned about the data model of Git: Individual commits form a "chain of commits". A commit can have a *label* and that commit together with the chain of all its previous commits is then called a *branch*. A commit can have one or more labels, i.e. branches pointing to the same commit. The "special branch name" `HEAD` always points to the last commit in the working directory (internally, `HEAD` is probably not a branch label, but for the sake of explanation it makes sense to consider it one). `git reset` moves both the label for the current branch and HEAD to a specific commit. If you don't provide a commit ID, Git uses the last commit id - `HEAD`. `reset` has three modes that affect how it treats your working directory and the changes of commits that come *after* the specified commit. The modes are `--soft`, `--hard` and `--mixed`, with `--mixed` being the default:

* `reset --soft` takes the changes of the intermediate commits and puts them in the index (the staging area). This is useful if you want to "squash" more than one commit into one and change the commit message, without using `git rebase --interactive`.
* `reset --mixed` takes the changes of the intermediate commits and leaves them uncommitted in the workspace. This is useful if you want to commit changes in a different order.
* `reset --hard` removes the changes from the intermediate commits and resets the workspace.

## Covariance and Contravariance
In a coding kata that worked entirely in the compiler, where the type checks took the place of unit test, I learned about covariance and contravariance: They are the constrains that govern how functions and higher-order-types (also known as "generics" in languages like Typescript and Java) behave when substituting a type with its sub-type or super-type. The kata itself was about applying the ["Producer Extends, Consumer super" (PECS) rules in Java][4]. Since then, I've read about [covariance and contravariance in Typescript][5] and [covariance and contravariance coming to PHP in version 7.4][3].

## Other ideas and resources
* [Learn Git branching](https://learngitbranching.js.org/) is a simulation and visualization of the Git branch model. In a simulated repository, you can try out what happens if you run `git branch`, `git commit`, `git merge` and `git reset`.   
* In the [Hexagonal Architecture](https://fideloper.com/hexagonal-architecture), some ports and adaptors are the *drivers*, triggering the application to do something. Examples are event handlers and controllers. Other ports and adaptors are *driven* where the application connects to external services to make them do something. Also: There is no reason why it's a hexagon, Alastair Cockburn allegedly chose that shape because it looks cool, not because there are distinct edges that signify something specific.
* There are two tools that can check the type coverage of TypeScript projects, [@liftr/tscov](https://github.com/jeroenouw/liftr-tscov) and [type-coverage](https://github.com/plantain-00/type-coverage).
* [Nominal and Structural typing](https://medium.com/@thejameskyle/type-systems-structural-vs-nominal-typing-explained-56511dd969f4)
* [Nix, the purely functional package manager](https://nixos.org/nix/) provides atomic upgrades and rollbacks of packages. It's part of the [NixOS](https://nixos.org/nixos/) project.
* A parody of the [Agile Manifesto](https://agilemanifesto.org/), the [Manifesto for Half-Arsed Software Development](https://www.halfarsedagilemanifesto.org/)
* [A card game to design continuous delivery pipelines](https://www.praqma.com/stories/pipeline-card-game/). Unfortunately, I did not get a chance to try it.
* [Example mapping for writing user stories](https://xebia.com/blog/example-mapping-steering-the-conversation/)

[1]: https://blog.cleancoder.com/uncle-bob/2013/05/27/TheTransformationPriorityPremise.html
[2]: https://en.wikipedia.org/wiki/Test-driven_development
[3]: https://wiki.php.net/rfc/covariant-returns-and-contravariant-parameters
[4]: https://howtodoinjava.com/java/generics/java-generics-what-is-pecs-producer-extends-consumer-super/
[5]: https://medium.com/@michalskoczylas/covariance-contravariance-and-a-little-bit-of-typescript-2e61f41f6f68
