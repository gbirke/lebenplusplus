---
title: Common arguments against putting validation code in value objects
date: '2018-10-30'
tags:
  - architecture
  - value objects
  - DDD
  - Domain Driven Design
  - patterns
  - validation
categories:
  - wikimedia
description: Common arguments against putting validation code in value objects and how to answer them.
---

When I first saw practical examples of code in the clean architecture and domain driven design, I was sceptical because it went against concerns of stability, performance and code quality I had. Now, with some experience, I have changed my mind and hopefully I can change yours too.

## All this checking will make my application unstable.
The checks are there to prevent programmers from constructing a domain model that does not follow the rules of the domain. If there is an unexpected domain validation error in production, fix it by making sure the circumstances of the faulty construction do can not happen any more. Do you want to have a seemingly "stable" application that returns a wrong result or stores corrupt data?

## But all those checks cost performance!
In most applications the database queries and file reads are the bottleneck, not the CPU. Not validating your value objects sounds like a premature optimization. If you suspect that your validation slows down the application, check your suspicion with a PHP profiler. And even when validation calls are the culprits, a faster machine or introducing a cache might be better for the longtime health of your system than removing the checks.

## I already validate data in my form code. Putting validation in the value objects will lead to duplication and inconsistencies!
Your frontend validation and the checks in value objects have to different purposes. The checks in the value object keep the *developers* from using the value objects in the wrong way. The purpose of fronted validations is to give feedback to *users*.

In the clean architecture, the frontend is an implementation detail, that your domain must not concern itself with. That means that the hierarchy and composition of your user interface elements might not reflect the object tree of your the value objects. Your user interface might have its own state, with partial data that is not enough to construct a value object.

If you have a user interface that resembles your domain model and you domain validation exceptions are granular enough that you can tie them to a specific input element (for user feedback), then you can get away with dropping your user interface validation and show the validation messages of the domain. But keep in mind that they might be too generic or in the wrong language.

## My database/ORM library does the validation
Like the user interface, the persistence layer is an implementation detail when using the [clean architecture](http://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) or [domain driven design](https://en.wikipedia.org/wiki/Domain-driven_design). Your value objects should not depend on a storage technology. If your persistence implementation uses database tables, you could even structure and compose them differently than you value objects. If you have value objects that are values and not entities (value objects with a unique ID), you already have a mapping between your nested object tree and a "flat" table.

Your persistence might do its own, persistence-specific validation on create and update, but that's no substitute for domain-specific validation.

On read, your persistence layer might even bypass the official constructors for the value object, because the domain models that you send to the persistence are valid. One example of this bypass is the [Doctrine ORM](https://www.doctrine-project.org/projects/orm.html), which uses reflection to set the private properties of objects instead of going through setters or constructors, to avoid triggering side effects.

The database-centric development dogma of the 90s and 00s, that the data will outlive the application and that different applications may share their data and its domain-specific validation rules through the database, has turned out to be unrealistic and flawed:

* New applications have new domain requirements.
* New applications might be in a different [bounded context](https://martinfowler.com/bliki/BoundedContext.html), where they should exchange data with other contexts through a well-defined API and not through a database.
* In a microservice architecture, each microservice does its own persistence.

## Conclusion
I hope this article helps you to reduce your reservations against validation code in value objects. If you have others, send me an email or Twitter DM, I'll incorporate it in this article.
