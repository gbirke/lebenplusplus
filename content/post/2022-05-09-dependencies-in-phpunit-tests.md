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
unneccessarily long. This articles explores three ways to provide [test
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
    $repository = $this->createMock(UserRepository::class);
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
        $this->createSuccessfulPermissionChecker(),
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
actually looks like. For the rest of this article I'll use this concise
style of initializing test doubles.

### Problem definition: Initializing a system-under-test with many dependencies

Imagine the use case from the previous example has grown over the years,
adding more features and dependencies in external services:

- a validation service to prevent spam and offensive user names,
- a moderation service where the use case notfies people with administrative privileges that they have to activate the user,
- a payment service that needs to be notified to prepare the membership
    subscriptions of the user.

You could argue that now would be a good time to introduce an
[event-sourcing][10] architecture that decouples the user creation from
user-adjacent services, but let's assume that introducting such an
architecture would be too much effort at the moment and you still want to
improve your tests. Look at how verbose the test setup has become:

```php
public function testGivenFailedPermissionCheckThenNoUserWillBeCreated(): void {
    $useCase = new CreateUserUseCase(
        $this->createRepositoryMockThatExpectsNoNewData(),
        $this->createSuccessfulPermissionChecker(),
        $this->createConfirmationMailSenderStub(),
        $this->createSucceedingValidationService(),
        $this->createModerationServiceStub(),
        $this->createPaymentServiceStub()
    );

    $useCase->createUser( $this->newCreateUserDTO());
}
```

The only services that are relevant to this test are the repository mock (which checks that the code does not create a user) and the permission checker fake, which triggers error behavior. All other classes are either stubs that do nothing or "happy path" fakes that trigger the default, non-error handling code path inside the use case. 

In the following sections I'll show three approaches on how to shorten the
initialization of the system under test.


## Solution 1: Test case properties and default setup

## Solution 2: Builder pattern with fluent interface

TODO: inline builder vs external class (harder to dp with vanilla PHPUnit)

## Solution 3: Factory function with nullable named parameters



