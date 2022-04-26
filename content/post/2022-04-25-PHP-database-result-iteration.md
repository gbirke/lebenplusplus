---
title: Best practices in PHP when iterating over database results
date: 2022-04-25
tags:
  - PHP
  - database
  - history
  - patterns
categories:
  - wikimedia
description: "How the default method for iterating over database results is stuck in 2005, goes against best practices and what to do about it."
---

Many PHP database libraries use a `while` loop with assignment to iterate
over database results. In this article I'll show why this pattern is so
pervasive, why it opens the door for errors and what you can use instead.

<!--more-->

This is a typical piece of PHP code, using [PDO](https://www.php.net/manual/en/book.pdo.php) for accessing the database and iterating over the result:

```php
$result = $db->query("SELECT id, name from my_table");
while ($row = $result->fetch()) {
    // do something with $row
}
```

Many coding styles don't recommend the practice of "assignment inside control structure expression". The [MediaWiki Coding Style](https://www.mediawiki.org/wiki/Manual:Coding_conventions/PHP) even has [a rule that forbids assignments in control structures](https://github.com/wikimedia/mediawiki-tools-codesniffer/blob/master/MediaWiki/Sniffs/ControlStructures/AssignmentInControlStructuresSniff.php), which prevents this style of looping. Which could raise the questions:

- Why disallow assignments in control structures?
- How do I fix the code to make the coding style checker happy?
- How did this style of looping evolve and why did the evolution stop?

## Why assignments in control structures are dangerous
Except for the iteration of database results, using an assignment in a control structure can be dangerous. The danger comes from the similarity of operators that use the equal sign in an expression:

- `$a = $b` is an **assignment**, the value of variable `$b` gets assigned to `$a`. The return type of the expression is the type of `$b`.
- `$a == $b` is a **comparison**, checking if `$a` and `$b` have the same value after applying [type conversion](https://www.php.net/manual/en/language.types.type-juggling.php). The return type of the expression is a boolean.
- `$a === $b` is a **comparison**, checking if `$a` and `$b` have the same value and type.The return type of the expression is a boolean.

Control structures like `if` and `while` expect a boolean expression. If you're using an assignment (one equal sign) instead of a comparison (two or three equal signs) the PHP interpreter will first do the assignment and then type-juggle the assigned value into a boolean. This will change the way your code works:

- You're subject to the [PHP interpreter rules of what evaluates to `true` and `false`](https://www.php.net/manual/en/language.types.boolean.php#language.types.boolean.casting). Your code might still work for some cases, but not all.
- You'll **override** `$a` with the value of `$b`

When looping over a database result, you do want exactly this behavior, but in almost all other cases, using assignment instead of comparison is an unobtrusive and hard-to-find typo that makes your code behave in unexpected ways. To protect against this typical mistake, the authors of the [MediaWiki Coding Style](https://www.mediawiki.org/wiki/Manual:Coding_conventions/PHP) decided to disallow assignments in control structures.

Even when you are using a different coding style, I can recommend using
this rule in the PHP Cosing Style Checker (or an IDE setting that highlights problematic code pieces) to
prevent severe errors that come from a simple typo.

### Side note: Yoda conditions
Other coding styles like [Symfony](https://symfony.com/doc/current/contributing/code/standards.html#structure) and [WordPress](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/#yoda-conditions) allow assignments in comparisons, but prevent accidental assignments in comparisons by enforcing a pattern called "[Yoda Conditions](https://en.wikipedia.org/wiki/Yoda_conditions)". This style of comparison places the static comparison value to the left instead of the right, triggering a syntax error when you accidentally do an assignment:

```php
// The usual comparison
if ($myVariable == 1) { /* ... */}

// Yoda comparison
if (1 == $myVariable) { /* ... */}

// Syntax error when you accidentally assign
if (1 = $myVariable) { /* ... */}

```

Personally, I don't like Yoda conditions, because they break the expected reading direction and don't prevent the override when the left side is a variable. And to enforce this style, you need a coding style checker anyway, so why not disallow assignments in control structures in your CS checker?


## How to improve the database iteration code
### Explicit assignment outside condition

When using the [MediaWiki Coding Style](https://www.mediawiki.org/wiki/Manual:Coding_conventions/PHP), the code that doesn't violate the rule looks like this:

```php
$row = $result->fetch();
while($row !== null ) {
    // do something with $row
    // ...
   $row = $result->fetch();
}
```

While it satisfies the code style checker rules, the code becomes worse in two ways:

- It duplicates the call to `fetch()`, violating the ["Don't repeat yourself" principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- It makes it easier to forget to call `fetch()` at the end of the loop, resulting in an infinite loop. You'll also need to call `fetch()` before calling `continue` inside the loop. This solution means a tradeoff between error sources - a typo in comparison vs. forgetting to call a function.

### Ignore coding style for certain lines
A better way would be a local `phpcs:ignore` comment

```php
$result = $db->query("SELECT id, name from my_table");
// phpcs:ignore MediaWiki.ControlStructures.AssignmentInControlStructures.AssignmentInControlStructures
while( $row = $result->fetch() ) {
    // do something with $row
}
```

This keeps the boolean assignment and avoids repetition. Explicitly ignoring a rule will signal intent to the reader of the code.

### Use a better database API
The underlying problem is that the PDO database API has no builtin support for the "iterate over all results" use case. Instead, the `fetch()` method either returns `null`, signifying "there are no values", or one result row (an array with values), with a side effect of moving an internal "result pointer" (cursor) to the next result, if it exists. The easiest, most concise way to interact with this API is using a `while` loop with assignment.

What you really want is a `foreach` loop, but you'd have to make one of the following changes:
- Use PHP 8, where the PDO query result supports the [`getIterator` method](https://www.php.net/manual/en/pdostatement.getiterator.php).
```php
// PDO with PHP 8 example
$result = $db->query("SELECT id, name from my_table");
foreach($result->getIterator() as $row) {
     // do something with $row
}
```
- Write your own implementation of the [`Iterator` interface](https://www.php.net/manual/en/class.iterator.php) , wrapping the `fetch` method with conditionals and keeping the result as an internal state.
- Use another database abstraction like [laminas-db](https://docs.laminas.dev/laminas-db/)  or [Doctrine DBAL](https://www.doctrine-project.org/projects/doctrine-dbal/en/latest/index.html) that implements iteration over result sets. When using Doctrine DBAL, keep in mind that some of the methods that return iterators are undocumented. At the time of writing this article (April 2022), the [Doctrine documentation examples](https://www.doctrine-project.org/projects/doctrine-dbal/en/latest/reference/data-retrieval-and-manipulation.html) still use `fetch` with `while` loops.

## A history of PHP database access
Using a `while` loop for iterating over database results has been around for quite some time. In **PHP 2**, released in 1997, you would get the number of results and would iterate with a `while` loop and a "result index" variable:

```php
// PHP 2.0 database access example
$result = mysql("phpfi","select id, name from my_table");
$num = mysql_numrows($result);
// result index
$i=0;
while($i < $num);
   // No $row, you have to access individual columns
   $id = mysql_result($result,$i,"id");
   $i++;
endwhile;
```

**PHP 3.0**, released in 1998, introduced a new API for MySQL, moving the concept of result counting and row index into the abstracted internal state of the database access functions and allowed to fetch whole rows:

```php
// PHP 3.0 database access example
$result = mysql_db_query("database","select id, name from my_table");
while ($row = mysql_fetch_array ($result)) {
    // do something with row
}
```

**PHP 4.0** did not introduce new APIs, but supported some rudimentary Object-Oriented-Programming, which enabled early database abstraction libraries like [MDB2](https://pear.php.net/package/MDB2) and [ADOdb](https://adodb.org/). Their code already looked like PDO and they used a `while` loop to iterate:

```php
// ADOdb library example
$result = $db->execute("SELECT id, name from my_table");
while ($row = $result->fetchRow()) {
    // do something with row
}
```

**PHP 5.1**, released in 2005, introduced the PDO class, an object-oriented database abstraction layer built into the language. It kept the "fetch row or null"-pattern that previous database libraries used.

But PHP 5 also introduced two new features that at least made it *possible* to iterate over database results with `foreach`:

- The object-oriented concept of interfaces
- The special [`Iterator` interface](https://www.php.net/manual/en/class.iterator.php). This interface allows implementing classes to provide sequential values to a `foreach` loop. In PHP 4, `foreach` could only iterate over arrays and object properties.

I have no idea why it took PHP about 15 years (until **PHP 8.0**, released in 2020) to introduce the [`getIterator` method](https://www.php.net/manual/en/pdostatement.getiterator.php) in PDO. My best guess is that the OOP capabilities of PHP 5 resulted in an explosion of frameworks and ORM libraries that made the use case of iterating over result rows less prevalent, preserving the `while` loop method with its assignment in conditional pattern across millions of code bases, which acted as the blueprint for new code.


### Side note: Iteration and memory usage

One of the reasons why a `fetch()` method/function is so prevalent might
be memory usage. When you can't have the whole result set in memory, it's
better to retrieve the results one-by-one. For a long time, using
`fetch()` and `while` was the only way to iterate in a memory-efficient
way. Modern database libraries and PHP 8 PDO now offer an iterator
interface that allows to iterate one-by-one with `foreach`.

If you're using MySQL, there is one pitfall: [Buffered
Queries](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php).
By default, the PHP interpreter internally loads the whole result set into
memory. If you have a large result set, you need to make an unbuffered
query.

## Conclusion / TL;DR

* Use a database API that supports `foreach` instead of `while` for
	iterating over results. This means the API should return an `Iterator`
	or `Traversable` type instead of a union type like `null|array`.
* Check for assignments in conditions, prevent them via your code style
	checks
* Pay attention to memory usage and don't pre-fetch everything when you
	expect large results.

