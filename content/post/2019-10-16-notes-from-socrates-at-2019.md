---
title: "Notes from the SoCraTes Day in Linz 2019"
date: "2019-10-05"
tags:
  - software craft
  - testing
  - conference
  - agile
  - git
  - automation
  - ansible
categories:
  - wikimedia
---
My notes from some of the sessions I attended.
<!--more-->
## Extreme programming
This session cured my misconception that [Extreme Programming](https://en.wikipedia.org/wiki/Extreme_programming) would be too "extreme", practiced by grey-bearded, mythical "10x" programmers. In this session I discovered that at my employer [Wikimedia Deutschland](https://wikimedia.de/) we already do most of the practices of extreme programming (with varying degrees of success and commitment):

* Having a coding standard
* Doing simple designs
* Having a glossary of the domain language
* Refactoring technical debt
* Test-First development
* Pair Programming
* Collective Code Ownership
* A sustainable pace (no "[crunch time](https://en.wikipedia.org/wiki/Crunch_time)")
* Continuous integration
* Small releases in short release cycles
* Planning game
* Customer on site

The general agreement among the participants was that these practices are wide-spread and some took them even for granted as a "natural" way of developing software. It motivated me to look deeper into the "whys" of these extreme programming practices and the underlying values.

## Types of tests and when to apply them

This open discussion started with the question of what to do if you're using a lot of mock objects in your tests and the setup of the mock objects is cumbersome - wouldn't it be better to write integration tests instead? If the mocked objects are [repositories](https://deviq.com/repository-pattern/), you could use the concrete repository implementations with a test database. That has two drawbacks: It tempts you to forgo the interface for the repository and develop against the implementation, violating the [Liskov Substitution Principle](http://en.wikipedia.org/wiki/Liskov_substitution_principle). It also makes the tests slower, as the database setup and tear-down takes more processing time than simple mock objects. Instead, we proposed the following improvements:

* Pay attention to the [test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) - You should write unit tests for coverage, some integration tests to see if your units work together and even fewer UI/End-To-End tests, because each test category is more brittle and takes longer to execute.
* Instead of using mocking frameworks, write your own [test doubles](https://www.martinfowler.com/bliki/TestDouble.html) and learn about the different types of test doubles and when to use them. You can re-use the minimal test double implementations in your tests. If you're using PHP, follow the advice in "[Pick your test doubles wisely](https://matthiasnoback.nl/2014/07/test-doubles/)" and "[5 ways to write better mocks](https://www.entropywins.wtf/blog/2016/05/13/5-ways-to-write-better-mocks/)".
* [Extensive mocking setup can be code smell](https://medium.com/javascript-scene/mocking-is-a-code-smell-944a70c90a6a), pointing to the fact that your classes are not decoupled properly or are doing too much. Try to split responsibilities and decouple classes.

A second question was - how to test the "full stack" - a REST API and client-side code that interacts with it. The answer again was the test pyramid - the client-side code components need unit tests for their behavior, integration tests for their interaction with the API and browser tests sprinkled in for System/Edge-to-Edge/Acceptance testing.
On the edge between client and server side code, you could use [contract testing](https://martinfowler.com/bliki/ContractTest.html) with a tool like [Pact](https://docs.pact.io/) to guarantee that both ends emit and receive the same data, regardless of the implementation language.

One last tip for the browser testing with a tool like [Selenium](https://www.seleniumhq.org/) was to use the [Page Object Pattern](https://www.pluralsight.com/guides/getting-started-with-page-object-pattern-for-your-selenium-tests) to isolate the low-level DOM access from the high-level test language. A shout-out to my former colleague Raz, who wrote a series of articles on that topic:

* [How to write a proper automation test](https://somehowimanage.blog/2018/12/06/how-to-write-a-proper-automation-test/)
* [Clean code in automation - is it really necessary?](https://somehowimanage.blog/2018/12/06/clean-code-in-automation-is-it-really-necessary/)
* [The page object design pattern conundrum](https://somehowimanage.blog/2018/12/06/the-page-object-design-pattern-conundrum/)
* [Video lecture](https://www.youtube.com/watch?v=XN5uqbKg71s)

## Automate all the things!
An open discussion around the topic of automation, with a focus on infrastructure automation with [Terraform](https://www.terraform.io/) and [Ansible](https://www.ansible.com/). The discussion had a detour on the question if you should use a configuration management tool like Ansible at all or if it becomes unnecessary when you have [Immutable Infrastructure]({{< relref "2016-09-14-swanseaconf-2016.md#immutable-architecture" >}}), where you throw away your virtual machines and containers and creating new ones, instead of maintaining them ([Pets vs. Cattle](https://devops.stackexchange.com/questions/653/what-is-the-definition-of-cattle-not-pets)). I'd say that one big advantage - idempotency - goes away, but the benefit of OS and system abstraction stays.

Another idea in the discussion was to **automate code reviews**: If a certain anti-pattern comes up again and again in your code, you could write a static analyzer plugin that prevents that pattern in the future, saving yourself and your fellow developers from discussion and back-and-forth.

## Advanced Git for the lazy
This talk was a collection of Git tips. The biggest learning for me was the feature of `git bisect` that helps you pinpoint the commit that introduced a bug. `git blame` does not work in cases where you can write a test that reproduces the error, but don't know which commit from the past makes the test pass. You can use `git bisect` to specify a search range and Git will use binary search ("divide and conquer") to pinpoint the commit. This can be useful for CSS files, where you don't have an automated test, but go back until the web page looks right again. 

I like [fixup commits](https://blog.sebastian-daschner.com/entries/git-commit-fixup-autosquash), but dread having to type `git rebase --interactive --autosquash HEAD~5` (or pull the command from the shell history). Today I learned that `-i` is the equivalent for `--interactive`, you can put `autosquash` in your `.gitconfig` file to do it automatically and that `@` is an alias for "tip of the branch" (usually HEAD). My rebase command becomes a much shorter `git rebase -i @~5`. And as a final convenience - no more counting "how many commits do I need to go back to apply the fixup"? Either use `master` to do a rebase of all the commits I did in the branch (if it branched off `master`) or use the commit id I used for the fixup commit and add a tilde to it.

Use `git diff --color-moved=dimmed-zebra` to show code parts that you moved around in the file in a dimmed, off-color instead of the default red/green. If you inserted lines in the moved block, Git will highlight them in green. You can also out this in your `.gitconfig`.

The `git log -p -S SEARCHTEXT`, also called the [Git pickaxe](http://www.philandstuff.com/2014/02/09/git-pickaxe.html), allows you to find commits that added or removed SEARCHTEXT in the code.

If you're adding files interactively with `git add -p`, and want to split a hunk but pressing "s" doesn't split it further, you can press "e" instead to *edit the diff*, deciding which lines Git will stage. 

## Refucktoring Kata
"Refucktoring" is a fun code kata where you take a running piece of code with tests (e.g. [FizzBuzz](http://codingdojo.org/kata/FizzBuzz/)) and make the production code worse, i.e. harder to understand, while the tests stay green.
Some ideas: wrong, inconsistent, abbreviated or misspelt naming of variables and functions, inlining variables and functions, splitting code in disconnected functions, unnecessary type casting, bit shifting, magic numbers, weird arithmetics, inconsistent indentation, misleading comments. Bonus points if you apply patterns from the "[JavaScript WAT](https://www.destroyallsoftware.com/talks/wat)" talk.

It's astounding how incomprehensible code can get in an hour! We laughed a lot in this mob programming session, at the horrible atrocities we committed. The kata illustrates how important refactoring and the [boy scout rule](https://martinfowler.com/bliki/OpportunisticRefactoring.html) is. And it sensitizes you for the small code smells that crop up here and there in our own code.


## Other ideas and resources
* A [book for learning Haskell](http://haskellbook.com/) that promises to make the experience clear, painless and practical.
* [direnv](https://direnv.net/) allows you to set per-directory environment variables that your shell sets automatically, when you change to the directory. This is useful to put credentials into environment files (think `DB_USER`, `DB_PASSWORD`) and set them automatically. Or for creating shell aliases for your package manager or build commands that run the commands inside a Docker container: you can still type `composer install`, but the automated alias will run `docker run -it --rm -v $(pwd):/app php composer install`.
* [vagrant-hostmanager](https://github.com/devopsgroup-io/vagrant-hostmanager) can automatically write local URLs for the IP addresses of your virtual machines in your `/etc/hosts` file.
* [vagrant-fsnotify](https://github.com/adrienkohlbecker/vagrant-fsnotify) can propagate filesystem events on your host machine more reliably into your virtual machine.
* If you have a string value that represents a snippet of code in a programming language and use an IDE from the JetBrains family (IntelliJ, PHPStorm, PyCharm, etc.), you can use the [language injections](https://www.jetbrains.com/help/idea/using-language-injections.html) feature to syntax-highlight it.
* Hold a "Bad Code Slam" meeting in your company/meetup. The rules are simple: People present the worst piece of code that they have written and explain why they think it's bad. The audience tries to point out some good parts. After the presentation, the audience or a jury decides which of the presenters gets the "Skunk Award".

