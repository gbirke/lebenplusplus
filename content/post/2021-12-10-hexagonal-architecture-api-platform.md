---
title: "Hexagonal Architecture and API Platform"
date: 2021-12-10
tags:
  - PHP
  - architecture
  - webservices
  - symfony
categories:
  - wikimedia
description: "Ideas on how how to implement RESTful web services with the
API platform library while keeping everything decoupled"
---

I tried to add a web service end point to an application using the [API
Platform](https://api-platform.com/) PHP library. This article shows if
the library goes well together with the
[Hexagonal Architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))
that my application uses.

<!--more-->

## What is the hexagonal architecture?

The idea of architectures like Hexagonal Architecture or the [Clean
Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
is to have a software system with an application **core** that consists of
domain models and a well-defined API to change the state of the domain
models. The persistence of these models, how the system triggers the API
(HTTP request, message queue, CLI) and how the system renders the API
response (HTML templates, JSON HTTP response, XML message via message
queue) is not in the core. Instead, the core defines **ports** (API
methods and data transfer objects for input and output) and each port will
have one or more **adapters** that implement these concerns. For example,
the persistence can be a database adapter with a real database for
production and an in-memory store for testing. Port output classes should
be read-only objects or Data Transfer Objects (DTOs), to prevent adapter
code from "reaching into" the core and changing state.

One benefit of this architecture is the clear dependency graph:
Core code must not depend on any framework or external service. This makes
it easier to add, replace and remove adapters.

Another benefit is the independence from your database structure. You can
define your domain objects in a way that makes sense for the domain and
uses the domain language, while the database tables can use different
names and structures.

## How to implement a web service in the hexagonal architecture?

With the hexagonal architecture, creating a web service means creating a
new adapter for the core. The adapter

- accepts HTTP requests,
- turns the URL, request headers and body into an input DTO for the port,
- calls the port API,
- generates an HTTP response from the output DTO from the port.

You don't necessarily need a 1:1 mapping between web service end points and
ports.


## How to implement a web service with API Platform?

API platform is a library on top of [Symfony](https://symfony.com/) that
provides [REST](https://en.wikipedia.org/wiki/Representational_state_transfer)ful
web service HTTP end points (controllers and routes) derived from
metadata on **Resource** definitions.

The metadata on resource classes defines:

- What HTTP methods this resource supports
- How to validate the resource
- How to (de)serialize the resource

The resource classes should be mostly value objects without fancy
state-changing code.

You can add metadata by using PHP attributes and docblock annotations and
XML or YAML mapping files. Currently, most examples only show how to add
metadata with attributes. If you want to use XML or YAML, you have to dive
deep into the source code and figure it out on your own.

You also write **Data Provider** classes that fetch a resource and **Data
Persister** classes that persist a resource.

API platform comes with a default data provider and persister for Doctrine, that
would allow to rapidly create a web service wrapper for database tables.

The API platform automatically creates an [OpenAPI](https://www.openapis.org/)
3.0 specification that you can use for testing, documentation or
generating code for clients.

## How to combine API platform and hexagonal architecture?

The [documentation for API platform](https://api-platform.com/docs) shows
mostly examples that use annotated database entities. This tightly couples
your web service API to the database structure and goes against the
principle of the hexagonal architecture that tries to encapsulate the core
domain from persistence and presentation.
The way forward here is to define your own resources, data providers and
data persisters as wrappers around your ports.

I see three ways of writing those wrappers:


### Option 1: Add metadata to domain objects

Use XML or YAML definitions for your domain objects. If your domain
objects are immutable and may be exposed outside the core, this is the
option where you'll probably write the least code: A mapping file and a
data provider.

Conceptually, this also makes sense, because speaking the domain language
to the outside world makes the application consistent.

However, this only works for the `GET` route and providing data. When
changing data, your ports should not accept fully-formed domain objects.
If you created the domain objects outside of the core, you'd create a
parallel structure to your core, with the danger of functionality being
duplicated and becoming inconsistent or the core becoming "anemic" as more
and more business logic (validation, state change triggers) happens
outside the core.

Mapping domain objects forces you to map the "verbs" of your domain, the
API language of your core, into the strict corset of HTTP method verbs:
`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, etc. I see a danger here that
"thinking in HTTP" might affect the domain language.

As a last drawback, this might make your public web service API unstable:
when the core domain evolves, the web service API has to immediately
evolve with it. In a worst case scenario, the stability and versioning
requirements of your API will prevent you from evolving your domain.

### Option 2: Add metadata to your port data structures

Use XML or YAML definitions to define the input and output DTOs of your ports.

This approach allows you to wrap your core in a very "thin layer" of code.
You might run into problems when your API doesn't fit well with the HTTP
verbs, but then a RESTful web service might not be the right choice
anyway.

Adding metadata to port data structures was my preferred approach when I
tried to expose some core functionality of the [WMDE Fundraising
Application](https://github.com/wmde/fundraising-application) as a RESTful
web service. On the outside, creating wrappers around the port DTOs looked
light-weight and a good fit for the Hexagonal Architecture---if you can
use XML or YAML for mapping, to avoid the annotations from the framework
creeping into your core. This was the point where my experiment with the
library failed miserably because most of the documentation shows only annotations
and using separate mapping files did not get me the desired results.

I managed to define operations (HTTP verbs) for a resource, and managed to
fetch the resource by ID. But I could not figure out the next step of that
simple use case: the fact the resource can have a "fallback id" if the
primary id was not found. I implemented that as a "filter", but would have
like to have the id as an additional path step in the URL. The
documentation hints that I might define a composite ID, I could not figure
out the right way to do it with XML definitions.


### Option 3: Define resources as separate classes

This approach embraces the possibilities of the API platform library.
You define "Resource" classes - value objects with public properties and
add annotations to them.

This approach has the big drawback of being very verbose and
"boilerplatey": Your resources will look almost identical to your domain
objects or port DTOs, your data providers and retrievers will have lots of
assignment code that maps the resource classes to your DTO and back.
You'll need a good test coverage to see if you mapped all the properties
correctly.

If you define validation annotations on your resources, they might
duplicate or contradict the validation you make on the input DTOs in
your core classes. If possible, I'd rather map the output DTO to a
specific API response.

On the plus side, this approach will decouple your web service
from your core and allows for a stable, versioned API.

## Summary

The documentation of the API platform reminds me of the Ruby on Rails and
Rails-inspired frameworks of the early 00s - you could quickly create a
web application, but were irrevocably tied to the framework (in its specific
version), creating a maintenance nightmare. If you want to have a properly
decoupled architecture, you'll lose more and more "out of the box"
features.

The API platform is an opinionated framework in the sense that it enforces
certain URL and HTTP conventions. The setback I encountered when I had a
slightly "unusual" resource (with an optional fallback ID) might have been
an indication that I'm trying do do something that the frameworks doesn't
want me to do for a good reason.

I'm still undecided if I will use the library in the future - the current
state of the documentation, especially the missing information on XML
mapping is a big factor here. Also, I cannot tell yet if the resulting
code (mapping, data providers and persisters) is more compact and readable
than custom-written controllers. At least the library would enforce
consistency in the URL scheme and provide (de)serialization and a working
OpenAPI specification out of the box. We'll see if those shiny features
can beat the increased complexity and onboarding effort of using a
library.


