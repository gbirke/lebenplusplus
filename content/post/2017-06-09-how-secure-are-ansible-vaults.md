---
title: How Secure Are Ansible Vaults?
tags:
  - ansible
  - security
  - cryptography
  - passwords
date: '2017-06-09'
categories:
  - wikimedia
---
Encrypting credentials like SSH keys or database passwords and putting the encrypted file in a semi-public Git repository is both convenient and scary. Convenient because every user of the repository only has to know only one password. Scary because you now rely on encryption and passwords instead of other security practices. So the question arose in my team **"Assuming there are no implementation errors, how secure are Ansible Vaults?"** Since the first 10 Google results did not answer this question quick enough, I decided to read the [source code](https://github.com/ansible/ansible/blob/adea1f2b80d806d94ca1bdb2d06f2df077feb948/lib/ansible/parsing/vault/__init__.py) and answer the question myself. My TL;DR answer: **It depends on your password. A 32-character, randomly generated password should suffice for the foreseeable future.**

*Disclaimer: I am no crypto expert and this article is just a rough explanation of how encryption and Ansible Vaults work.*

Before I talk about Ansible, let's first have a look how passwords and encryption work in general. When talking about security, it mostly means answering the question of "How long will it take for an attacker to try every possible password?" This is called a [Brute-Force-Attack](https://en.wikipedia.org/wiki/Brute-force_attack). The answer is that the time required is growing exponentially with the password length.

Here a short explanation, what "exponentially" means and how it works: Imagine passwords consisting only of lowercase characters and a *very* slow and inefficient software that can try one password per second and always tries all the possible combinations of characters. It will take 26 seconds to guess a one-character password, 26×26 seconds (11 minutes) to guess a two-character password and 26×26×26 seconds (5 hours) to guess a three-character password. Guessing a 10 character password would take 44 million years.

In the real world, computers can try millions of passwords per second, but the exponential growth can still make them secure. The password length can also be expressed as bits. A password length of 128 bits (which roughly equates 25 randomly chosen alphanumeric characters) will take about [1 billion billion years to guess](http://www.eetimes.com/document.asp?doc_id=1279619) when used as a key in a [symmetric encryption](https://en.wikipedia.org/wiki/Symmetric-key_algorithm).  Also, there are some [physical limits](https://en.wikipedia.org/wiki/Landauer%27s_principle) on the energy expenditure of the hardware that does all the calculations. This means that not only processing time but also the energy required to calculate all combinations grows in an exponential fashion. In essence, with current technology 128-bit keys can't be brute-forced.

For an explanation why [asymmetric encryption](https://en.wikipedia.org/wiki/Public-key_cryptography) uses much larger key lengths of 2048 or 4096 bits, see the article "[Why some cryptographic keys are much smaller than others](https://blog.cloudflare.com/why-are-some-keys-small/)".

After this more theoretical excursion into crypto-land back to how Ansible does its vault encryption. First, it does not use the entered password directly as an encryption key. Instead, it synthesizes a key from the password, using  [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2), which is an additional protection against brute-force attacks because its adds computational overhead for each brute-force try: In the current Ansible Vault implementation, the password is put through the hash function 10000 times. After generating a 256-bit key from the password, Ansible uses [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) to encrypt the data.

So the answer to the question **"Assuming there are no implementation errors, how secure are Ansible Vaults?"** is: **"As long as the vault password is a sufficiently long [random password](https://en.wikipedia.org/wiki/Password_strength#Random_passwords), it is very secure."**

Now on to the next task of getting notified whenever a an implementation vulnerability is discovered and how to keep the password secure!

