---
title: Notes from "The Legacy of SoCraTes, 3rd Edition"
date: 2020-09-09
tags:
  - conference
  - software-craft
  - testing
categories:
  - wikimedia
description: ""
---

## Approval Testing
I've encountered this testing method under the name "Golden Master" test,
for testing legacy code. This talk by Emily Bache was a real eye-opener for
systematically using this form of testing when starting out with
a legacy code base.

The base idea of Approval Testing is to replace the assertion part of a
test with a library that stores "known good" output of a piece of code and
compares it to the current output of the code when it runs. Instead of the
structure 
[Arrange - Act - Assert](http://wiki.c2.com/?ArrangeActAssert), you have
*Arrange - Act - Print - Compare Outputs*. When the test fails, you can `diff`
the expected and actual output files in your favourite diff tool. You
check the expected output into version control, as part of your test code. 

This talk taught me that the *Print* part is crucial - in most cases you
should not take the output class of your code, but create a dedicated
printer class, that replaces output that's changing in each test (date,
time, random IDs, etc), omits unneccessary information, adds information
what the output represents and makes the output "diff-friendly". Using
dedicated printer classes avoids the "brittleness" of tests.

When working with legacy code, you can add approval tests until you reach
a high code coverage.

Approval tests are a good fit for dealing with untested legacy code, for
exploring an unfamiliar code base (also known as **Characterization
Test**) or as a pattern for smoke or integration tests. They are not meant
to *replace* unit or acceptance tests, but are a tool for 
understanding a code base better.

Emily Bache had some comments on the terms **Golden Master Test** and
**Snapshot Test**: "Golden Master" implies that the "known good" test output
will never change or evolve, which is not true: If you see in you diff
view that the new output is correct, you merge the new output into the old
one as the new "known good" output. "Snapshot Test" is the other extreme:
The term "snapshot" de-emphasizes the importance of the accepted output
and glosses over the "custom printer" part.

The page https://approvaltests.com/ has links to approval test libraries for
popular programming languages.


## 7 techniques to understanding legacy code
This talk by Jonathan Boccara had content from his book, [The Legacy
Code Programmer's Toolbox](https://leanpub.com/legacycode). He explained
how to get and overview of a code base and how to "speed read" code to
understand a function or module.

### Understanding a code base

* Start with the inputs and outputs. They are the "entry" or "exit" points
  of code. 
* Have a "stronghold", a well-understood part of the code. Ask the tech
  lead or the stakeholders what the most important use case is and find it
  in the code, starting from the input or output.
* Analyze call stack to see which modules or layers of application uses to
  implement the functionality of a use case.
  
## Become a code speed-reader

When starting out with an unfamilar code base, you can't read it
line-by-line, but try to understand what's *most important*, where you
should focus. 

* Start reading at the end of functions. Look at return
  values, parameters, state changes, Exceptions, I/O.
* Create a Word count to see which variables are important in a function
  or module. Highlight each variable to see where the code uses it. 
* Filter on control flow - temporarily remove all lines that are not
  control flow to get a feel which branches do error checking, how deeply
  the function is nested. 
* Find out where the *Main Action* of the function is. Omit
	* Secondary variables
	* Special cases
	* Complicated I/O

## Test-Commit-Revert (TCR)

The [Test-Commit-Revert (TCR) programming workflow, described by Kent
Beck](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864)
forces you to take very small steps:

1. write only the test
2. run the test
3. if the test passes, revert the change else commit the change.
4. write enough production code to make he test pass
5. if the tests pass, commit the change, otherwise revert and try again.

You should automate the workflow with a shell script that commits/reverts
for you.

Quote from participant: "TCR helps with the Sunk Cost Fallacy. It keeps you from spending too much time debugging code that you just wrote. How many of us have spent 3 days to debug code that took 3 hours to write? You're better off reverting and starting over."


