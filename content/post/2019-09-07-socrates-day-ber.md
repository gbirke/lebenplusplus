tags:
  - conference
  - agile
  - software craft
  - testing
date: '2019-09-07'
categories:
  - wikimedia
---
# Improve your TDD with TCR
TCR is short for "test && commit || revert". It means having  a script/command line command that runs the tests and if the tests are successful, commit, otherwise revert.
Start with a failing test & commit it (with a feature description).
Then run the script. If it committed, refactor the code and run the script again. If it failed, try a different approach for your production code, but also have a look at your test code to see if you test the right thing.
Benefits of this method:
- You are forced to take small steps (the simplest thing that works) and not write an implementation.
- You don't get attached to your code
- You have the chance to try out different things and find better solutions.
- It forces you to limit your changes to one or two places, because jumping around between serveral files is painful.
- Keeps you from droing some common "cheats" in TDD: skipping triangulation, duplicating a row of tests, abstracting too early, spiking first. 
- When pairing, try to protect your pairing partner from failure.


A question from a participant was "Doesn't that encourage the image of a 'rockstar developer' who gets everything right on the firts try?" My answer to that was that there should be no expectation to get it right on the first try and the method encourages smaller, simpler code, not grandiose, overenginnered solutions.
Cheat by using the clipboard
