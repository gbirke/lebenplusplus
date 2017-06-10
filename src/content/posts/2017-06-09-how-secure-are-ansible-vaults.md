---
layout: post
title: How Secure Are Ansible Vaults?
tags: [ansible,security,crypto,wikimedia]
---
Putting encrypted SSH keys, database passwords or other credentials into a public Git repository is both convenient and scary. Convenient because every user of the repository only has to know only one password. Scary because you now rely on encryption and passwords instead of other security practices. So the question arose in my team **"Assuming there are no implementation errors, how secure are Ansible Vaults?"** Since the first 10 Google results did not answer this question quick enough, I decided to read the [source code](https://github.com/ansible/ansible/blob/adea1f2b80d806d94ca1bdb2d06f2df077feb948/lib/ansible/parsing/vault/__init__.py) and answer the question myself. My TL;DR answer: **It depends on your password. A 32-character, randomly generated password should suffice for the foreseeable future.**

*Disclaimer: I am no crypto expert and this article is just a rough explanation of how encryption and Ansible Vaults work.*

When we're talking about security, it mostly means answering the question of "How long will it take for an attacker to try every possible password?" This is called a [Brute-Force-Attack](https://en.wikipedia.org/wiki/Brute-force_attack). The answer is that the time required is growing exponentially with the password length.

Here a short explanation, what "exponentially" means: Imagine passwords consisting only of lowercase characters, *very* slow and inefficient software  that can try one password per second and always tries all the possible passwords. It will take 26 seconds to guess a one-character password, 26*26 seconds (11 minutes) to guess a two-character password and 26*26*26 seconds (5 hours) to guess a three-character password. Guessing a 10 character password would take 44 million years.

In the real world, computers can try millions of passwords per second, but the exponential growth can still make them secure. In cryptographic terms the "password" is called the "key" and its length can be measured in bits. A key length of 128 bits (which is roughly 25 randomly chosen alphanumeric characters) will take about [1 billion billion years to guess](http://www.eetimes.com/document.asp?doc_id=1279619) when used in a [symmetric encryption](https://en.wikipedia.org/wiki/Symmetric-key_algorithm) (asymmetric encryption systems require much larger key lengths). Also, there are some [physical limits](https://en.wikipedia.org/wiki/Landauer%27s_principle) on the energy expenditure of the hardware that does all the calculations. 

TODO explain https://en.wikipedia.org/wiki/Brute-force_attack#Theoretical_limits
