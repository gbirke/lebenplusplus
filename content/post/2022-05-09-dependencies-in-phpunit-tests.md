---
title: Managing test doubles in PHP unit tests
date: 2022-05-09
tags:
  - PHP
  - testing
  - test doubles
  - mocks
  - PHPUnit
  - architecture
categories:
  - wikimedia
---

The more dependencies a class has, the harder it becomes to initialize in
unit tests with all its dependencies. Your tests will become longer and
longer. This articles explores three ways to provide [test doubles][1]
(also known as "mocks") to your tested class, while keeping the tests as
short and expressive as possible: Using properties in the test class,
using a builder pattern with a fluent interface and using named parameters
(available in PHP 8.x).

<!-- more -->

## What's the problem we're trying to solve?

When unit-testing classes you replace some or all [injected
dependencies][3] with [test doubles][1], to ensure you're only testing the
code in the class and to be able to cover all code paths in the class.
This means

- You need to set up the dependencies in each test
- You might need to replace each dependency with different types of test doubles to
  - do nothing except accept method calls (stubs) 
  - simulate returning different values (fakes)
  - check call parameters (spies)
  - checking different behaviors (mocks)

If you include the test double setup in the test body, your test will get
longer and less readable. And the more dependencies a class has, the
longer its initialization will be. The initialization code will also contain a lot of
repetition, making it harder to compare two tests side-by-side to see what
the difference is between them.

### Creating shorter tests with factory functions

Have a look at the following PHPUnit test for a typical use case with 
three dependencies:

```php
public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
    $repository = this->createMock(UserRepository::class);
    $repository->expects($this->never())->method('storeUser');

    $permissionChecker = $this->createStub(PermissionChecker::class);
    $permissionChecker->method('hasPermission')->willReturn(false);
    $useCase = new CreateUserUseCase(
        $repository,
        $permissionChecker,
        $this->createStub(ConfirmationMailSender::class)
    );

    $useCase->createUser(new CreateUserData(
        'John Doe',
        'test@example.com',
        'test-password',
        42
    ));
}
```

The test is for a typical "use case" class from the [hexagonal
architecture][2], orchestrating different services for creating a user:
Checking if creating the user is allowed, creating a user entity from a
[value object][4], storing it in a [repository][5] and notifying
the new user via email. We don't want to test the use case with the
production permissions, a real database or a real mail server. Instead, we
set up test doubles. But the test is hard to read. You could even argue
that the test method violates the [Single Responsibility Principle][6], because it
mixes object creation with object interaction. Let's refactor the test
using [factory functions][7]:

```php
public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
    $useCase = new CreateUserUseCase(
        $this->createRepositoryMockThatExpectsNoNewData(),
        $this->createFailingPermissionChecker(),
        $this->createConfirmationMailSenderStub()
    );

    $useCase->createUser( $this->newCreateUserData());
}
```

Some developers prefer the more explicit approach of creating the test
doubles and test parameters inline, but I like the expressiveness and
conciseness of creating small [domain-specific languages][8] inside 
the test class. It helps comparing individual tests with each other and
reconciling the test description with the test code. The additional
benefit of [not repeating yourself][9] has the drawback of the reader
needing to go the each method definition to see how the test double
actually looks like. 

For the rest of this article I'll use this concise style of initializing
test doubles with factory methods and will continue to use the PHPUnit
test double API.

### Side note: Arrange-Act-Assert and the PHPUnit test double API

In the long, unrefactored example you can see two blank lines separating
parts of the code. I've put the blank lines there on purpose, to highlight
the [Arrange-Act-Assert][11] pattern. Having a [blank line budget of 2 in
tests][15], separating the 3 test sections was what inspired me to write
this article. The [test double API of PHPUnit][14] hides the assertions
from the test doubles. In my first example I used the setup of the mock
expectations as a section, making it an "Expect-Arrange-Act" pattern.

If you want to avoid Expect-Arrange-Act and  apply the Arrange-Act-Assert
pattern more consistently in your tests, you'll need to use a different
API than PHPUnit:

- Replace your mocks and spies with custom implementations of your
    interfaces. This gives you full control over how you return data, what
    data you collect, etc. For small implementations you can use
    inline anonymous classes, as outlined in the article "[Don't use
    mocking libraries][16]".
- Use a different mocking library like [Phake][15] that allows for explicit
    checking inside the test code.

In this article I'll continue to use the PHPUnit test double API and point
out implementations that allow blank lines that highlight Expect-Arrange-Act pattern.

### Problem definition: Initializing a system-under-test with many dependencies

Imagine the use case from the previous example has grown over the years,
adding more features and dependencies in external services:

- a validation service to prevent spam and offensive user names,
- a moderation service where the use case notifies people with administrative privileges that they have to activate the user,
- a payment service that prepares the membership subscription plan for the user.

Look at how verbose the test setup has become:

```php
public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
    $useCase = new CreateUserUseCase(
        $this->createRepositoryMockThatExpectsNoNewData(),
        $this->createFailingPermissionChecker(),
        $this->createConfirmationMailSenderStub(),
        $this->createSucceedingValidationService(),
        $this->createModerationServiceStub(),
        $this->createPaymentServiceStub()
    );

    $useCase->createUser( $this->newCreateUserData());
}
```

You could argue that so many parameters are a code smell, signifying that
the class does too much. I do agree, I picked the extreme example on
purpose. The 3 different patterns for initializing a class with many
constructor parameters will show that even for 3-4 dependencies the code
will get shorter and more readable.

The only services that are relevant to this test are the repository mock
(which checks that the code does not create a user) and the permission
checker fake, which triggers error behavior. All other classes are either
stubs that do nothing or "happy path" fakes that trigger the default,
non-error handling code path inside the use case. In the spirit of [not
repeating myself][9] I would like to move the construction of the
system-under-test to a factory function. For some people, this might go a
step too far, because they don't like this level of indirection. But I
like my tests to be short and readable, so I thought about how to create
such a factory function.

In the following sections I'll show three approaches on **how to shorten the
initialization of the system under test**.


## Solution 1: Test case properties and default setup

```php
public function setUp(): void {
    // Set up happy-path validators and service stubs
    $this->repository = $this->createUserRepositoryStub();
    $this->permissionChecker = $this->createSucceedingPermissionChecker();
    $this->confirmationMailSender = $this->createConfirmationMailSenderStub();
    $this->validationService = $this->createSucceedingValidationService();
    $this->moderationService = $this->createModerationServiceStub();
    $this->paymentService = $this->$this->createPaymentServiceStub();
}

private function newUseCase(): CreateUserUseCase {
    return new CreateUserUseCase(
        $this->repository,
        $this->permissionChecker,
        $this->confirmationMailSender,
        $this->validationService,
        $this->moderationService,
        $this->paymentService,
    );
}

public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
    $this->repository = $this->createRepositoryMockThatExpectsNoNewData();

    $this->permissionChecker = $this->createFailingPermissionChecker();
    $useCase = $this->newUseCase()

    $useCase->createUser( $this->newCreateUserData());
}
```

This example shows the two additional methods, `setUp` and `newUseCase`
which add more code. But the test code itself is much shorter and
all following tests will be short and not-repetitive as well. Using
properties also allows us to separate the [Expect-Arrange-Act][11] steps
again.

Looking at the code under the aspect of architecture and resource usage,
this is my least favourite solution: The `setUp` method will always
initialize the test doubles, even if later tests will override it. This
pattern also introduces properties to the test class (the example does not
show their declaration), making the class stateful. As long as PHP and
PHPUnit are single-threaded or at least don't reuse the same test class
instance in multiple threads at the same time, this is not a problem. But
I like to think of unit tests as [pure functions][18] that have no side
effects, so I don't like using mutable properties in my test cases.


## Solution 2: Builder pattern with fluent interface

```php
public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
    $useCase = $this->newUseCaseBuilder()
        ->withRepositoryMockThatExpectsNoNewData()
        ->withFailingPermissionChecker()
        ->build();

    $useCase->createUser( $this->newCreateUserData());
}
```

The builder class does not follow the classic, polymorphic [Builder
Pattern][12] with the same methods returning different implementations.
Instead, we still use descriptive factory method names, replacing the
`create` prefix from the previous example with a `with` prefix to make the [fluent interface][13]
more readable.

The implementation is similar to the property-based approach, but with the
difference that the builder does not pre-initialize the properties. The
`withXXX()` factory methods set the properties of the builder class and
the `build()` method uses defaults for unset properties. Here is an
example `build()` method from the builder class:

```php
public function build(): CreateUserUseCase {
    return new CreateUserUseCase(
        $this->repository ?? $this->createUserRepositoryStub(),
        $this->permissionChecker ?? $this->createSucceedingPermissionChecker(),
        $this->confirmationMailSender ?? $this->createConfirmationMailSenderStub(),
        $this->validationService ?? $this->createSucceedingValidationService(),
        $this->moderationService ?? $this->createModerationServiceStub(),
        $this->paymentService ?? $this->$this->createPaymentServiceStub(),
    );
}
```

You can put the `newUseCase()` and `build()` methods in the test case
class. But for a better [Separation of Concerns][17] between *creating* test doubles and
the test that *uses* them, I like to put all factory and build methods in a
separate class. Using the [PHPUnit test double API][14] becomes harder
with an external class, because you need to initialize the [`MockBuilder`
class][18] directly (with the test case as a dependency) and need to make
the same function calls as the protected [`createMock()` method of the
`TestCase` class][19]. I only use external builder classes when I don't
need PHPUnit test doubles.


## Solution 3: Factory function with nullable parameters, called with named arguments

```php
private function newUseCase(
    UserRepository $repository,
    PermissionChecker $permissionChecker,
    ConfirmationMailSender $confirmationMailSender,
    ValidationService $validationService,
    ModerationService $moderationService,
    PaymentService $paymentService
): CreateUserUseCase {
    return new CreateUserUseCase(
        $repository ?? $this->createUserRepositoryStub(),
        $permissionChecker ?? $this->createSucceedingPermissionChecker(),
        $confirmationMailSender ?? $this->createConfirmationMailSenderStub(),
        $validationService ?? $this->createSucceedingValidationService(),
        $moderationService ?? $this->createModerationServiceStub(),
        $paymentService ?? $this->$this->createPaymentServiceStub(),
    );   
    }

public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
    $useCase = $this->newUseCase(
        repository: $this->createRepositoryMockThatExpectsNoNewData(),
        permissionChecker: $this->createFailingPermissionChecker()
    );

    $useCase->createUser( $this->newCreateUserData());
}
```

This example looks similar to the builder, but uses [named arguments][20], introduced in PHP 8, instead of a
fluent interface. This allows us to remove the `build` method, saving us
one more line in each test method.

The example puts the factory methods in the test class, but you can also
put the factory methods in a separate class (see the builder solution or
benefits and drawbacks).

## Conclusion

- Use the [Arrange-Act-Assert][11] pattern to make your tests as short,
    expressive and readable as possible.
- The shortest and most concise way to initialize a class with many
    dependencies is to use a factory method with nullable parameters that
    initialize the class with default implementations.


[1]: https://www.martinfowler.com/articles/mocksArentStubs.html
[2]: https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)
[3]: https://en.wikipedia.org/wiki/Dependency_injection
[4]: https://en.wikipedia.org/wiki/Value_object
[5]: https://martinfowler.com/eaaCatalog/repository.html
[6]: https://en.wikipedia.org/wiki/Single-responsibility_principle
[7]: https://en.wikipedia.org/wiki/Factory_(object-oriented_programming)
[8]: https://en.wikipedia.org/wiki/Domain-specific_language
[9]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[11]: https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/
[12]: https://en.wikipedia.org/wiki/Builder_pattern
[13]: https://en.wikipedia.org/wiki/Fluent_interface
[14]: https://phpunit.readthedocs.io/en/9.5/test-doubles.html
[15]: https://code.joejag.com/2018/two-line-budget.html
[16]: https://steemit.com/php/@crell/don-t-use-mocking-libraries
[17]: https://en.wikipedia.org/wiki/Separation_of_concerns
[18]: https://github.com/sebastianbergmann/phpunit/blob/main/src/Framework/MockObject/MockBuilder.php
[19]: https://github.com/sebastianbergmann/phpunit/blob/main/src/Framework/TestCase.php#L2077
[20]: https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments
