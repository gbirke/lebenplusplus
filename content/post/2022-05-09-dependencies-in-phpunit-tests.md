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

The more dependencies a class has, the harder it gets to initialize it in
unit tests with all its dependencies, without making the tests
unnecessarily long. This articles explores three ways to provide [test
doubles][1] (also known as "mocks") to your tested class, while keeping
the tests as short and expressive as possible: Using properties in the
test class, using a builder pattern with a fluent interface and using
named parameters (available in PHP 8.x).

<!-- more -->

## What's the problem we're trying to solve?

When unit-testing classes you usually replace the all its [injected
dependencies][3] with [test doubles][1], to ensure you're only testing the
code in the class and to be able to cover all code paths in the class.
This means

- You need to set up the test doubles in each test
- You might need different versions of each test double to
  - Do nothing except accept method calls (stubs) 
  - simulate returning different values (fakes)
  - check call parameters (spies)
  - checking different behaviors (mocks)

If you include the test double setup in the test body, your test will get
longer and less readable. And the more dependencies a class has, the
longer its initialization will be.

### Side note: Creating shorter tests with factory functions

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

    $useCase->createUser(new CreateUserDTO(
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
[data transfer object][4], storing it in a [repository][5] and notifying
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

    $useCase->createUser( $this->newCreateUserDTO());
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

You could argue that now would be a good time to introduce an
[event-sourcing][10] architecture that decouples the user creation from
user-adjacent services, but let's assume that introducing such an
architecture would be too much effort at the moment and you still want to
improve your tests. Look at how verbose the test setup has become:

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

    $useCase->createUser( $this->newCreateUserDTO());
}
```

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

In the following sections I'll show three approaches on how to shorten the
initialization of the system under test.


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


public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
	$this->repository = $this->createRepositoryMockThatExpectsNoNewData();

    $this->permissionChecker = $this->createFailingPermissionChecker();
	$useCase = $this->newUseCase()

    $useCase->createUser( $this->newCreateUserDTO());
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
```

This example shows the two additional methods, `setUp` and `newUseCase`
which add more code. But the test code itself is much shorter and
all following tests will be short and not-repetitive as well. Using
properties also allows us to separate the [Assert-Arrange-Act][11] steps
again.

Looking at the code under the aspect of architecture and resource usage, this is
my least favourite solution: The `setUp` method will always initialize the
test doubles, even if later tests will override it. This pattern also
introduces properties to the test class (the example does not show their
declaration), making the class stateful. As long as PHP and PHPUnit are
single-threaded or at least don't reuse the same test class instance in
multiple threads at the same time, this is not a problem. But it still feels not
future-proof to me.


## Solution 2: Builder pattern with fluent interface

```php
public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
	$useCase = $this->newUseCaseBuilder()
		->withRepositoryMockThatExpectsNoNewData()
		->withFailingPermissionChecker()
		->build()

    $useCase->createUser( $this->newCreateUserDTO());
}
```

The builder class does not follow the classic, polymorphic [Builder
Pattern][12] with the same methods returning different implementations.
Instead, we still use descriptive factory method names, replacing the
`create` prefix with a `with` prefix to make the [fluent interface][13]
more readable.

The builder class is a separate, stateful class where the `withXXX()`
factory methods set internal properties and the `build()` method uses
defaults for unset properties. Here is an example `build()` method from
the builder class:

```php
pulic function build(): CreateUserUseCase {
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

I like the builder solution because putting it in a separate class gives
me a [Separation of Concerns][17] between *creating* my test doubles and
the test that *uses* them. You can also see the separation as a drawback,
because it moves the test double creation even further form the actual
tests, making code navigation outside an IDE even harder.




TODO: inline builder vs external class (harder to do with vanilla PHPUnit
because its mocking API is closely)

## Solution 3: Factory function with nullable named parameters

[1]: https://www.martinfowler.com/articles/mocksArentStubs.html
[11]: https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/
[13]: https://en.wikipedia.org/wiki/Fluent_interface
[15]: https://code.joejag.com/2018/two-line-budget.html
[16]: https://steemit.com/php/@crell/don-t-use-mocking-libraries
[17]: https://en.wikipedia.org/wiki/Separation_of_concerns