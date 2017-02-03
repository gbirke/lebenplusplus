---
layout: post
title: Object oriented File Access in PHP
tags: [PHP,patterns,testing,OOP]
---

Plus sides:
* Using SplFileObject makes your code more testable
* Additional perk: Reading CSV content
* Using iterator and being able to filter with `InnnerIterator` implementations.

Downsides:
* No easy conversion between stream objects, resources and SplFileObject. Prohibits some test patterns.

Examples:
* Testing with php://memory, fwrite, rewind,
* Read CSV file
