---
layout: post
title: Object Oriented File Access in PHP
tags: [PHP,filesystem,io,patterns,testing]
---

Test-driven driven development in PHP can become a pain when you're dealing with the file system. The builtin functions like `stat`, `getfilemtime`, `fopen` and `fgets` assume the existence of actual files. Until now, I assumed you'd have to add a library like [FileFetcher](https://github.com/JeroenDeDauw/FileFetcher), [Flysystem](http://flysystem.thephpleague.com/), [Gaufrette](https://github.com/knplabs/Gaufrette) or [vfsSystem](http://vfs.bovigo.org) to your dependencies. While those libraries are nice, they are additional dependencies and some add additional capabilities like caching or providing a unified interface to cloud storage. What if you really want to test your file processing classes without having real files? Enter [`SplFileObject`](http://php.net/manual/en/class.splfileobject.php) and its parent [`SplFileInfo`](http://php.net/manual/en/class.splfileinfo.php).

`SplFileObject` and `SplFileInfo` provide an object-oriented interface to the file system, providing a wrapper for many of the [low-level file system calls](http://php.net/manual/en/ref.filesystem.php). The wrapper can be overwritten and replaced with a test double in your unit tests.

## Getting file info
Let's see how testing becomes easier. Given we have this example function that accesses the file system:

```php
function checkFileAge( string $name ) {
    if( time() - filemtime( $name ) > 3600 ) {
       throw new FilecheckException( 'File is too old!' );
    }
}
```

For testing this function, you'd have to create a two files with different time stamps. If you're using `SplFileInfo`  instead, you'll be able to pass a test double:

```php
function checkFileAge( SplFileInfo $file ) {
    if( time() - $file->getMTime() > 3600 ) {
       throw new FilecheckException( 'File is too old!' );
    }
}
```

The test could look like this:

```php
function testWhenFileIsTwoDaysOldExceptionIsThrown() {
    $file = $this->getMockBuilder()
        ->disableOriginalConstructor()
        ->getMock();
    $file->method( 'getMTime' )->willReturn( time() - 7200 );
    $this->expectException( FilecheckException::class );
    checkFileAge( $file );
}
```

## Reading files
Almost all the low-level file system calls for getting content out of files can be accessed with an object-oriented API:

```php
$file = new SplFileObject( 'file.txt' );
$char = $file->fgetc();
$file->fseek(0);
$line = $file->fgets();
```

`SplFileObject` also implements `IteratorInterface`, so you can read a file line by line. So instead of

```php
function lameEncrypt( string $name ) {
    foreach( file( $name ) as $line ) {
        echo str_rot13( $line );
    }
}
```

you do

```php
function lameEncrypt( SplFileObject $file ) {
    foreach( $file as $line ) {
        echo str_rot13( $line );
    }
}
```

Now you can pass in any object that implements `Traversable` in your unit tests without the need for real files.

## Iterating over CSV data
You can even iterate over CSV data instead of using [`fgetcsv`](http://php.net/manual/en/function.fgetcsv.php):

```php
$file = new SplFileObject( 'file.txt' );
$file->setCsvControl( ';', '"' );
$file->setFlags( \SplFileObject::READ_CSV | \SplFileObject::READ_AHEAD |
    \SplFileObject::SKIP_EMPTY | \SplFileObject::DROP_NEW_LINE );
foreach( $file as $row ) {
    echo $row[0] . ' --> ' . $row[3] . "\n";
 }
```

Using an iterator has the additional benefit of being able to manipulate your data further by wrapping the iterator in other iterator classes. Imagine combining several CSV files with [`AppendIterator`](http://php.net/manual/en/class.appenditerator.php), using only valid rows with a  [`FilterIterator`](http://php.net/manual/en/class.filteriterator.php) and limiting the amount of rows with a [`LimitIterator`](http://php.net/manual/en/class.limititerator.php)!

## Conclusion
Using `SplFileObject` and  `SplFileInfo` makes your code more testable and adds all the possibilities of iterators, all without adding any new libraries. Try it in your next project!
