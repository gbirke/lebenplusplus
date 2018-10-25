---
title: "Guarding Your Value Objects"
date: "2018-10-25"
tags:
  - value objects
  - DDD
  - Domain Driven Design
  - patterns
  - validation
  - opinion
categories:
  - wikimedia
description: The pros and cons of different ways to create always-valid value objects.
---
When you apply the principle of Domain Driven Design (DDD) to your code, you start to notice all the small "rules" of the domain. Rules like *"A name must not consist of whitespace, must have its whitespace trimmed on both ends and cannot be empty."* Or *"A donation amount must be greater than zero."* Or *"A book must have at least one page."* It's important that you can't create value objects that violate those rules. If you put the validation outside of the value objects, then all the code that use the value object must check if it's valid, leading to duplication all across the layers of your project. How do you prevent yourself and your follow programmers from creating invalid value objects? By putting validation logic in the constructor.

In this article, I will show examples of how to implement validation logic in PHP classes and what the strength and weakness of each method is.

## Types
You can implement the "must have at least one element" constraint with the PHP spread operator:

```PHP
class Book() {
  private $pages;
  public function __construct(Page ...$pages) {
    $this->pages = $pages;
  }
}
```

If your constructor arguments have other value objects as types instead of using primitives like `int`, `string` or `array` , you automatically reap the benefits of their validation and don't need to check yourself.

#### Benefits of using types:
* Least amount of code
* Validation at the syntax/parser level, no unit tests needed.
* Instant feedback in the IDE, while writing code.
* You can use static analysis tools to catch errors. These tools are much faster than unit tests.

#### Drawbacks of using types:
* You can't model complex rules, only "has at least n" rule.
* All the value objects you construct with primitives must do their validations.

If you can outsource the validation to your type system, do it.

## PHP assertions

```PHP
class Page() {
  private $number;
  public function __construct( int $number ) {
    assert( $number > 0 );

    $this->number = $number;
  }
}
```
I see one clear drawback to this approach: The behavior of your domain classes now depends on external state - the PHP configuration. Depending on the value of [`assert.exception`](http://php.net/manual/en/info.configuration.php#ini.assert.exception) and [`zend.assertions`](http://php.net/manual/en/ini.core.php#ini.zend.assertions), you will get an exception, a warning or nothing.

You could argue that the drawback is a benefit, because you can turn off the assertions in your production server and your generated PHP byte code won't contain the check instructions, making the code run faster and without interruptions. If you're confident that your tests will catch all the possible errors, then this might be the approach for you.

## Assertion Library
```PHP
class Page() {
  private $number;
  public function __construct( int $number ) {
    Assert::greaterThan( 0 )

    $this->number = $number;
  }
}
```
You can use assertion libraries like [webmozart/assert](https://github.com/webmozart/assert) and [beberlei/assert](https://github.com/beberlei/assert) to validate the input data of your domain models.

#### Benefits of using a custom assertion library:
* Words and sentences instead of boolean expressions make the code more readable and explicitly show the logic.
* The Exceptions contain Human-Readable error descriptions. This helps you debugging in cases where a violation occurs.
* `beberlei/assert` allows for applying all assertion rules returning a collection of violations.

#### Drawbacks of using a custom assertion library:
* You have created a dependency of your domain objects on a library. That dependency is not an architecture violation, because the assertions are pure functions. They are not stateful and don't interact with any external infrastructure, so it's up to you how much you want to preserve the purity of your domain.
* Performance impact. If you have a handful of assertions, you might not need to load thousands of lines of assertion code.

 Your code outside of the domain objects must not depend on the exceptions thrown by the Assertion library. Both libraries I mentioned extend their exception classes from PHPs own `IllegalArgumentException`, so even your tests don't need to depend on the exception classes of the library.

## Self-written guard clauses
```PHP
class Page() {
  private $number;
  public function __construct( int $number ) {
    $this->ensureGreaterThanZero( $number );

    $this->number = $number;
  }

  private function ensureGreaterThanZero( int $number ): void {
    if ( $number > 0 ) {
      return;
    }
    throw new PageNumberException( 'Page number must be greater than 0.' );
  }
}
```

#### Benefits of writing your own guard clauses:
* Method names can make it even more clearer what the check is about.
* You have fine-grained control over the Exception type and message, making them specific to your domain. Although you can also achieve that with a second parameter to PHPs `assert` function.

#### Drawbacks of writing your own guard clauses:
* More code you write yourself.
* You could end up with copy-pasting typical guard clauses all over your domain classes or you writing your own small assertion library.
* Developer dissatisfaction, as writing the assertions and their tests can feel like writing "boilerplate code".

## Conclusion
How you validate your domain objects is a tradeoff between architectural concerns, performance, readability and convenience. This article should help you to make the right choice for your project.
