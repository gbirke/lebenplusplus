---
title: Using Doctrine connection array shapes with PHPStan
date: 2022-05-05
tags:
  - PHP
  - database
  - doctrine
  - phpstan
categories:
  - wikimedia
---

At work we're using [PHPStan][1] to do a static analysis of our code, checking
if the provided types match the required types. We are using the most
restrictive setting that forces us to have type annotations for arrays.
Recently, this led to an error when using Doctrine DBAL, using
`DriverManager::getConnection()`. In this article I'll explain how to
use better type annotations for the parameter of `DriverManager::getConnection()`.

<!-- more -->

Let's say we have a test environment class that initializes a database
connection, used by the tests for the database adapter. The class
gets the database connection details from a configuration file:

```php
use Doctrine\DBAL\DriverManager;

class TestEnvironment {

    /**
     * @param array<string,mixed> $dbConfig
     */
    public function __construct( private array $dbConfig ) {}


    public static newWithConfigFile(): self {
        $config = json_decode(file_get_contents('config/db.test.json'));
        return new self($config);
    }

    public function getDb(): Connection {
        return DriverManager::getConnection($this->dbConfig);
    }

}
```

Some versions of PHPStan will accept the loosely-typed `$dbConfig`
property. Some newer versions will issue a scary-looking error message:

```plain
Parameter #1 $params of static method Doctrine\DBAL\DriverManager::getConnection()
expects array{charset?: string, dbname?: string, default_dbname?: string, driver?:
'ibm_db2'|'mysqli'|'oci8'|'pdo_mysql'|'pdo_oci'|'pdo_pgsql'|'pdo_sqlite'
|'pdo_sqlsrv'|'sqlsrv',driverClass?:class-string<Doctrine\DBAL\Driver>, 
driverOptions?: array, host?:string,keepSlave?: bool, ...},
array<string, mixed> given
```

The error message becomes more informative if you can see the pattern.
Here is the same message, with placeholders:

> Parameter **$P** of static method **$M** expects **$expectedType**,
> **$actualType** given

Looking at the error message, we see that the message is about the first parameter of the
method `DriverManager::getConnection()`. The expected type is long (and abbreviated),
but the `array{...}` gives us the hint that some code defined an [array
shape][2] for PHPStan. Array shapes define the string keys and value types
of an associative array. Our own code doesn't use an array shape. Instead
it defines an array that has string keys and mixed values.

We don't use all the driver options in our configuration and could provide a
custom array shape that would fulfill the PHPStan requirements and serve
as documentation:

```php
/**
 * @param array{host:string,dbname:string,user:string,password:string} $dbConfig
 */
public function __construct( private array $dbConfig ) {}
```

But there is an even easier, shorter, future-proof and less repetitive way
to specify the array shape: Importing it from Doctrine.Looking at the
[source code for `DriverManager::getConnection()`][4] we can see that it
defines an array shape for [Psalm][3], another static type checker.
Luckily, PHPStan will interpret Psalm annotations. This allows us to
import the type definitions from `DriverManager` like this:

```php
use Doctrine\DBAL\DriverManager;

/**
 * @phpstan-import-type Params from DriverManager
 */
class TestEnvironment {

    /**
     * @param Params $dbConfig
     */
    public function __construct( private array $dbConfig ) {}


    public static newWithConfigFile(): self {
        $config = json_decode(file_get_contents('config/db.test.json'));
        return new self($config);
    }

    public function getDb(): Connection {
        return DriverManager::getConnection($this->dbConfig);
    }

}
```

Conclusion: When using PHP libraries that define array shapes, use
`@phpstan-import-type` to import the shape definitions in your own class
file. Then use the shape name like a class name for your parameters and
return types.


[1]: https://phpstan.org/
[2]: https://phpstan.org/writing-php-code/phpdoc-types#array-shapes
[3]: https://psalm.dev/
[4]: https://github.com/doctrine/dbal/tree/3.3.x/src#45
