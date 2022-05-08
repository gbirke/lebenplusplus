---
title: Managing test doubles in PHP unit tests
date: 2022-05-09
tags:
  - PHP
  - testing
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
  - simulate returning different values (stubs)
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

Setting up the mock classes with expectation inline also has the drawback
that you'll lose the [Arrange-Act-Assert][11] pattern. The explicit
example made at least an attempt to separate the stages with blank lines,
even if it had to do it in the order of Assert-Arrange-Act due to the API
of the PHPUnit mock framework. You could bring back the distinction by
putting the repository into a variable, but some IDEs will highlight
variables that can be inlined.

For the rest of this article I'll use this concise style of initializing
test doubles.

### Problem definition: Initializing a system-under-test with many dependencies

Imagine the use case from the previous example has grown over the years,
adding more features and dependencies in external services:

- a validation service to prevent spam and offensive user names,
- a moderation service where the use case notifies people with administrative privileges that they have to activate the user,
- a payment service that needs to be notified to prepare the membership
    subscriptions of the user.

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

TODO: inline builder vs external class (harder to do with vanilla PHPUnit
because its mocking API is closely)

## Solution 3: Factory function with nullable named parameters



