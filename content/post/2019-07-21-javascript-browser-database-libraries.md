---
title: "The current state of JavaScript Browser Database Libraries"
date: "2019-07-21"
tags:
  - javascript
  - database
  - browser
  - libraries
  - review
categories:
  - wikimedia
---
My current pet project is writing an expense tracker in with VueJS. I want this application to be "offline first", meaning the persistence should be entirely in the browser, with the option for syncing when I get beyond the MVP phase. I've done some research on which technologies and libraries to use, and this what I came up with:

## Browser storage technologies
There are three APIs for storing data in the browser: WebSQL, Web Storage and IndexedDB.

### WebSQL
[Web SQL](http://html5doctor.com/introducing-web-sql-databases/) is basically "SQLite in the browser". As a developer with plenty of backend experience, and a relational data model in my application (expenses have payees and categories, categories can have parents) this would have been my primary choice. But the browsers vendors have abandoned working on this specification. It's still available in Safari and Chrome (both desktop and mobile) but the browser vendors might remove the API in the future.

### Web Storage
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) is a "dumb" key-value store: You can set and get string values for string keys, you get the number of all stored items, and that's it. This does not work as a "database" per se, because two important features are missing: finding items by a value other than their key and collating (sorting) values. You'd have to build your own indexing system and store the indexes as values.

### IndexedDB
[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) is a database that contains one or more indexed key-value stores. You can use strings, dates, floats, and arrays as keys and can even have auto-incrementing integer keys. You can store any JavaScript-native data type as a value. For object values you can specify which object keys the database should index for fast retrieval and sorting. The store and index definitions have a version number, the API has hooks to migrate your database schema as needed. All read and write operations happen in transactions, providing you with data integrity.

IndexedDB is a "low-level" object database and its API is a bit clunky. During my research I found JavaScript libraries that use IndexedDB behind the scenes but provide a friendlier interface and some missing features.

## Database libraries
The following list of database libraries is not exhaustive, but intends to show the spectrum of philosophies and architectures. I'll make comments on the suitability of the library for my expense tracker project.

### localforage
[localForage](https://github.com/localForage/localForage) is library that provides an improved Web Storage interface. It has an asynchronous API and (de)serializes automatically, so you can store more than strings. Internally, it uses the "best" available storage API (WebSQL, Web Storage, IndexedDB), depending on the browser. The biggest asset of this library is the backwards compatibility, storing data will work even on older browsers (*cough* IE 11 *cough*). The biggest drawback of localForage is the simplistic storage model, as outlined above in the section "Web Storage".

The first prototype of my expense tracking app used arrays stored in Vuex modules and a Vuex plugin wrapping the library to persist the current state of Vuex to the Web Storage whenever a value changed. For the UI prototype this worked, but already forced me to write my own sort functions and primitive search code, based on `Array.map` and `String.match`. More features of the app (deleting items) would have forced me to write my own auto-incrementing index code to match between array index and automatically-generated storage ID. This was the point where I started looking for better solutions.

### Dexie
[Dexie](https://dexie.org/) is a "minimalistic wrapper around IndexedDB". It has a more convenient API with Promises instead of callbacks, a query builder and an API for bulk changes. You can also use it with TypeScript. The documentation comes with lots of code examples, tutorials, an architectural overview and best practices. It has a plugin system and plugins that allow to define and query [relational data](https://www.npmjs.com/package/dexie-relationships) more conveniently or a [a MongoDB-like](https://www.npmjs.com/package/dexie-mongoify) query API.

### KintoJS

Replacement for Parse JS or Firebase, has server-side component. Allows for sync and offline-first.

The JavaScript API

### LokiJS

### PouchDB

### JSStore
[jsStore](http://jsstore.net/) is as close as you can get to a relational database with IndexedDB.


### Hood.ie
I found [the documentation for Hoodie](http://docs.hood.ie/en/latest/welcome.html) confusing. From what I understand, Hoodie is an offline-first data store with added account management and an API for detecting online/offline status. Internally, it uses PouchDB as a data storage.

If my expense tracker project ever reaches a stage where I need authenticated syncing between several clients, I'll have another look.

## Other libraries I looked at
* [débé](https://github.com/bkniffler/debe) is still in development. When it's finished it promises to be a "universal" database adapter that you can use in different environments (browser, server-side node.js, Electron apps) and that can connect to different backends (IndexedDB, web sockets, cloud databases).

---

### Original article notes
Requirements:
- Payees and Categories are kind of relational if I care about memory
- - At an assumed peak of 10 entries per day, and 100 Byte per record, memory footprint is about 365KB per year, i.e. 3.6 MB for 10 years worth of data
- - Categories can evolve over time - what do to with old transactions? Argument for de-normalizing transactions and use the current projection of categories?
- - Must work performantly in browser and Cordova environment: 
- - No outside service/installable library except for bulk syncing. 
- - Sync service is beyond MVP
- - Data security is paramount, I've heard of purged indexeddb data on iOS. One solution for that would be a quick an easy sync
-
- - Queries:
-   - List all Transactions (ordered by entry date)
-     - Add Transaction
-       - List all Categories (ordered by category order id), preferrably as hierarchy
-         - List all Payees (ordered alphabetically)
-           - Get first category of last Transaction with Payee X
-             - Get Payees near location X
-
-             Possible architectures:
-             - Keep Transactions as source of truth, have Payees and categories as denormalized separate tables or "views". Problem: Even more memory usage, tables can get out of sync
-             - Normalize categories and payees. Less memory usage. Problem: complicated and CPU-consuming JOINs
-
-             ## Vuex (JS Arrays + localforage for pesistence):
-             - I'd have to write my own indexing to speed up searching by name
-             - I'd have to write my own unique, auto-incrementing index system to be able to address items for read, delete, update
-             - No Sync/Persistence
-             - Might be good for "caching" and fast search
-
-             ## WebSQL
-             - [deprecated](https://softwareengineering.stackexchange.com/q/220254/31126), not recommended
-
-             ## Dexie
-             - thin wrapper around indexeddb
-             - has indexes
-             - has different collections
-             - complicated JOINs (one Promise+async call per joined table)
-
-             ## LokiJs
-             - In-memory- How big will the memory footprint be, how many data records will I have, what are the performance impacts?
-             - different collections
-             - low memory footprint
-             - autogenerates IDs
-             - everything is indexed with binary tree
-             - No sync, but simple JSON dump for backup is possible
-             - Adapters for different environments (browser, NativeScript, node.js, in-memory for unit testing)
-
-             ## KintoJs
-             - No query/Filtering API, forcing the collection to be completely in-memory
-             - Sync
-             - different collections
-
-             ## PouchDB
-             - CouchDB -compatible and syncable
-             - indexes and complex queries possible
-             - Records history (good for syncing)

