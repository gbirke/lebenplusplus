## Immutable data structures
This was a very enligthening talk about the inner workings of immutable data structures: How can you change a single element in an immutable list, without having to copy the rest of the list, which is slow and consumes memory. The answer is to encapsulate your list in a [Trie](TODO), which enables efficient replacement of single elements. Two libraries were presented, mori (more functional, but with weird clojure words like conj) and immutable.js (at first sight seems more JS-Like woth its object interfae, but feels actually weird)

- bad example (hey, I wanted to use that zoo), your "coworker" is not your coworker but actually another part of the code.
- not showing how you actually profit from immutability or use immutable data structures
+ using and pronouncing emoji
