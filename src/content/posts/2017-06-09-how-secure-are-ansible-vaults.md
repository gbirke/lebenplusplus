---
layout: post
title: How Secure Are Ansible Vaults?
tags: [ansible,security,crypto,wikimedia]
---
Putting encrypted SSH keys, database passwords or other credentials into a public Git repository is both convenient and scary. Convenient because now every user of the repository only has to know only one password. Scary because you now rely on encryption and passwords instead of other security practices. So the question arose in my team **"Assuming there are no implementation errors, how secure are Ansible Vaults?"** Since the first 10 Google results did not answer this question quick enough, I decided to read the [source code](https://github.com/ansible/ansible/blob/adea1f2b80d806d94ca1bdb2d06f2df077feb948/lib/ansible/parsing/vault/__init__.py) and answer the question myself. My TL;DR answer: **It depends on your password. A 32-character, randomly generated password should suffice for the forseeable future.**

*Disclaimer: I am no crypto expert and this article is just a rough explanation of how Ansible Vaults work.*

When we're talking about security, it mostly means answering the question of "How long will it take for an attacker to try every possible password?" This is called a [Brute-Force-Attack](https://en.wikipedia.org/wiki/Brute-force_attack). The answer is that the time required is growing exponentially.

Here a short explanation, what "exponentially" means: Imagine passwords consisting only of lowercase characters, a *very* slow computer that can try one password per second and always being right on the last try. It will take 26 seconds to guess a one-character password, 26*26 seconds (11 minutes) to guess a two-character password and 26*26*26 seconds (5 hours) to guess a three-character password.

In the real world, computers can try billions of passwords per second, but the exponential growth can still make them secure. TODO explain https://en.wikipedia.org/wiki/Brute-force_attack#Theoretical_limits
