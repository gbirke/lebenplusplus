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

When you're using a software architecture like the [hexagonal
architecture][2] you'll end up with classes that container your business
logic. These classes (often called "use cases") depend on interfaces which
abstract away the concrete implementations of the services the class uses
(e.g. persistence, permission checks, output, API calls, etc). When you
write unit tests for such a class, you'll have [test double][1]
implementations of the interfaces to cover all the branches. Initializing
the use case with the right dependencies will make your tests long and
less readable.

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

	$useCase->createUser( new CreateUserDTO(
		'John Doe',
		'test@example.com',
		'test-password',
		42
	));
}
```


