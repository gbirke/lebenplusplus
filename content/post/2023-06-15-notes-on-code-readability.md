---
title: Notes on Code Readability
tags:
  - conference
  - software craft
  - readability
  - pair programming
  - clean code
date: '2023-06-15'
categories:
  - wikimedia
---

These are my notes on a presentation and round table discussion held by [Tim Ottinger](https://www.industriallogic.com/people/tottinge/) at SoCraTes UK 2023.

Tim Ottinger contributed to the book "Clean Code" book, published in 2008. Now, 15 years later he wants to revisit it and give the term "readability" a new definition:

<!--more-->


> Readability is the speed at which you can understand the code in front of you, without needing to reverse engineer.
> Readability is *not* an attribute of the code. Readability is an attribute of the *relationship between code and people*.

What if the most important factor when people judge the readability of code is *familiarity*?

Best practices like [SOLID](https://en.wikipedia.org/wiki/SOLID), [CUPID](https://dannorth.net/2022/02/10/cupid-for-joyful-coding/), [The 7 Code Virtues](https://www.industriallogic.com/blog/code-virtues-explained/) and Design Patterns claim to improve the readability of the code. But what they do is introduce patterns and abstract concepts that transcend individual code bases and help people to recognize them in different code bases, making them more familiar with them.

Some organizations don't allow using new programming language features, because they're afraid that the new features will trip up people. That can be a bad thing, because it lets the developer knowledge stagnate for the sake of "familiarity".

Most new language features make code simpler, more compact and leave less room for errors. Examples:

- Java Streams
- Python list comprehensions
- The "evolution" of "while loop" -> "for loop" (explicit index counter and increment at the beginning of the loop) -> "foreach loop" (iterating without needing to check the length of iterable) -> iteration functions

Readable code is **informative code** - Where reading the code informs teaches while people are reading it.

Readability through familiarity cuts both ways:

- Make people more familiar with the code (through training, onboarding and knowledge sharing) -> better readability
- Make the code more familiar with what people expect (through patterns, abstractions, naming) -> better readability

If we assume that familiarity is the most important factor for readability, then most readability criteria are conjecture, because they are targeted at a mythical "average developer". 

The promises of readability in "Clean Code" were a self-fulfilling prophecy, because the more people read and applied the principles, the more familiar they became with that style.

Readability is about the needs of the audience - a beautiful Japanese poem can be unreadable, because I can't read Japanese characters.

Don't be afraid to use solution-domain terms (Stack, Queue, Controller) when naming infrastructure code, but still adhere to the DDD domain terms (Order, Customer, Shipping) when naming classes of your business domain.

It can be helpful to think about the different styles of writing in business and academia: Academic writing puts in all details and their connections and places the onus on reader to get information out of the text. Business writing puts the onus on the author to provide the reader with exactly the information they need in a very short time.

Familiarity could be construed as "All style is subjective, therefore we should not apply style and stop discussing style". But the argument about best practice should not end there, because you can still agree that there is *some* baseline of good style and then go forward from there.

You can **usability test your code** - give a person a task and watch them how they try to read the code to achieve their goal. In a less elegant and slightly creepy fashion You can also do this with an IDE plugin that records what devs are working on and how long. Pair and mob programming are implicit usability tests, because while the driver writes the code, the navigator will read it. This gives immediate feedback on the readability and usability of the code. 
