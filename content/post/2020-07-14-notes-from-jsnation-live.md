---
title: "Notes From JS Nation Live 2020"
date: 2020-07-14T21:29:40+02:00
tags: 
  - javascript
  - conference
---

In June I attended [JS Nation Live](https://live.jsnation.com), an online
conference on JavaScript. I took notes during most of the events and added
some opinions and lots of links afterwards.
<!--more-->
## Visual testing for components
Using https://www.cypress.io/

General thoughts on testing components:

- Different inputs (props, state/store/context, user events) -> test cases
- DOM output and triggering of events handler functions (React) or emitted events (Vue) -> test case expectations

Not captured/tested: Styling

Cypress can visually test components, both on the server and in a local
dev environment. It integrates with CI workflows so you can get notified
of visual changes (across browsers) and can approve/fix them for each pull
request.

Pros: 

 - Runs inside the browser and has access to all its APIs, no webdriver
   API needed.
 - Interesting diffing algorithm and presentation, showing reference image, diff and new image side by side
 - testing individual components
 - good CI integration

Cons:

- Custom API, not based on Selenium (vendor lock-in)
- No Safari/IE browsers
- local testing environment uses your browser, might have different
  results than testing in CI.
- Freemium business

## AWS Amplify
https://aws.amazon.com/de/amplify/framework/

The talk showed how to auto-generate a GraphQL backend with fine-grained
authentication by describing your data structures and the access rules to
individual instances and fields. The end result is a backend running on AWS. Looks like a powerful abstraction that allows you to describe your application on a much more higher level.

Reminds me of other code generation frameworks, tying your business logic
to the implementation. Ok for simple CRUD applications, wouldn't use it
for anything else. AWS means it's vendor lock-in deluxe.

## Fastify
https://www.fastify.io/

A JavaScript web framework like [Express](https://expressjs.com/)

- Fully supports async/await
- Supports ESM natively
- [Is fast](https://www.fastify.io/benchmarks/)

## Module federation in Webpack 5
Federation means splitting a web page (Header, Footer, Sidebar, Content) into
"micro-frontends" that share dependencies. This leads to faster build and
deploy times and allows for developing separate parts of an application
across teams. Webpack takes care of the correct splitting, chunking and
loading the dependent modules asynchronously when the code requires a
federated module.
https://webpack.js.org/concepts/module-federation/

## The Evolution and Future of JS & Front-end Build Tools
Fronted development relies on build tools - for minification,
transpilation, module dependency resolution and developing locally. Out of
the box, the browser and web server environments need these build tools to
work efficiently. In the future, this might change: ES Modules allow for
loading of individual modules during development, where fast reloads are
more important than overall load time.
[Snowpack](https://www.snowpack.dev/) and
[esbuild](https://github.com/evanw/esbuild) allow for local development
without bundling.

## JavaScript Open Source awards
Winners in each category in bold
### Productivity booster
- **[Snowpack](https://www.snowpack.dev/)** - An alternative fast bundler for development
- [esbuild](https://github.com/evanw/esbuild) - An extremely fast JavaScript bundler and minifier written in Go
- [Destiny](https://github.com/benawad/destiny) - "Prettier for File
  Structures": It analyzes the dependencies of JavaScript files in a
  directory and creates more deeply nested directory hierarchy from it.
- [Visbug](https://github.com/GoogleChromeLabs/ProjectVisBug) - Browser design tool, allowing to adjust CSS properties visually without editing CSS. 
- [taskbook](https://github.com/klaussinani/taskbook) - Tasks, boards & notes for the command-line habitat

### Most exciting use of technology
- **[msw](https://github.com/mswjs/msw) - Seamless REST/GraphQL API mocking library for browser and Node.**
- [Vidact](https://mohebifar.github.io/vidact/) - A compiler that converts React-compatible codes to VanillaJS with no Virtual DOM
- [TypeGraphQL](https://typegraphql.com) - Create GraphQL schema and resolvers with TypeScript, using classes and decorators
- [Redwood](https://redwoodjs.com/) - a JAMStack application framework
- [orbit-db](https://github.com/orbitdb/orbit-db) - Peer-to-Peer Databases for the Decentralized Web using IPFS

### The best fun project of the year
- **[Pose Animator](https://github.com/yemount/pose-animator)** - Pose Animator takes a 2D vector illustration and animates its containing curves in real-time based on the recognition result from PoseNet and FaceMesh. It borrows the idea of skeleton-based animation from computer graphics and applies it to vector characters.
- [Splat](https://github.com/charliegerard/splat) - Motion-controlled Fruit Ninja clone using Three.js & Tensorflow.js
- [Flatris](https://github.com/skidding/flatris) - A multiplayer puzzle
  game
- [Isocity](https://github.com/victorqribeiro/isocity) - A isometric city builder in JavaScript
- [Diabloweb](https://github.com/d07RiV/diabloweb) - Diablo 1 for web browsers!

### The most impactful contribution to the community
 - **[Perfume.js](https://zizzamia.github.io/perfume/)** - is a web performance monitoring library that reports field data back to your  analytics tool.
 - [Ackee](https://github.com/electerious/Ackee) - Self-hosted, Node.js based analytics tool for those who care about privacy.
 - [Algorithm visualizer](https://github.com/algorithm-visualizer/algorithm-visualizer) - Interactive Online Platform that Visualizes Algorithms from Code
 - [SpaceX REST API](https://github.com/r-spacex/SpaceX-API) -  Open Source REST API for rocket, core, capsule, pad, and launch data

### Breakthrough of the year
- **[Deno](https://deno.land/)** - A secure runtime for JavaScript and TypeScript.
- **[Svelte](https://svelte.dev/)** - Reactive component framework that compiles to vanilla JS.
- [Alpine.js](https://github.com/alpinejs/alpine) - A rugged, minimal framework for composing JavaScript behavior in your markup.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly building custom designs.
- [Eleventy](https://www.11ty.dev/) - a content- and templating-agnostic static site generator


## How Does the TypeScript Team Try to Avoid Negative Effects on the JS Ecosystem

This was a talk given by one of Microsofts core TypeScript developers.

- Motivation behind TypeScript: identify sources of errors during development and try
  to prevent them with types/syntactic structures.
- Avoid conflicts with JavaScript, don't introduce too much new syntax
  (`enum` was a mistake early in the development, they're correcting it now).
- TypeScript tries to stay compatible with JS in the browser
- Fears of Microsoft "Embrace & Extend" strategy are more and more
	unjustified the langer the ecosystem becomes.
- The goal is to get to a state where you can always remove type hints and get ES6
- Typescript follows new language feature proposals in
  [TC39](https://tc39.es/) closely, but is conservative when implementing
  them, because each feature has consequences on tooling, compiler and
  IDE, resulting in a cascade of code changes.

## Alpine
https://github.com/alpinejs/alpine

- Drop-in reactive framework, all interactive features defined as
  attributes in markup. Progressive enhancement with a modern (i.e.
  reactive) API.
- A good replacement for jQuery - toggle elements, iterate values, etc.
  Not for mid- or large-scale applications or SPAs.
- Goal is developer experience
- No need (and not recommended) to bundle or use webpack, pull it in from a CDN
- Has no virtual DOM, directly manipulates the DOM

## Unicode
- Having fun with emoji - What's `"👨‍👩‍👧‍👦".length`? An introduction to Emoji, Unicode planes, emoji composition and JavaScript string representation.
- `string.normalize()` is your friend when dealing with different ways of
  encoding the same char (i.e. umlaut).
- [Javascript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode)
- [What every JavaScript developer should know about Unicode](https://dmitripavlutin.com/what-every-javascript-developer-should-know-about-unicode/)
- "The Unicode Consortium is very male and pale"

## Other Links/Resources
- https://spatial.chat/ - A chat that looks like a JPRG, allowing you to
	form groups in 2D space and move around to chat.
- https://github.com/tensorflow/tfjs-models/tree/master/posenet - Pose Detection in the Browser: PoseNet Model
- [Pikaday](https://github.com/Pikaday/Pikaday) - JavaScript date picker with no framework dependencies
- [Scully](https://scully.io/) - Static site generator based on Angular
- [Tone.js](https://tonejs.github.io/) - A modular synthesizer and audio manipulation library in the browser
- https://0.30000000000000004.com/ - Explains in simple terms why `0.1 + 0.2` equals `0.30000000000000004` in most programming languages.



