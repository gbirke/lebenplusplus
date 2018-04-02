---
title: Error log analysis with jq
tags:
  - shell
  - software
  - troubleshooting
  - json
  - jq
date: '2017-11-27'
categories:
  - wikimedia
---
This is a step-by-step introduction into aggregating and analyzing errors from a JSON error log (where each error is a JSON object on a single line) with the tool [`jq`](https://stedolan.github.io/jq/). While most tutorials and documentation of `jq` focus on how to transform JSON objects to other JSON objects on a 1:1 basis, this tutorial is more about building aggregates, using an  approach that takes a page out of functional programming.

The example error log looks like this:

```json
{"ts":"2017-11-30 06:45:02","severity":"I","error":{"msg":"Reticulating splines","splines":1}}
{"ts":"2017-11-30 06:45:12","severity":"I","error":{"msg":"Probing froobles","names":["frb23","frb42"]}}
{"ts":"2017-11-30 06:45:57","severity":"E","error":{"msg":"Widget exploded"}}
```

## Pretty-printing
The single-line format of the JSON log file is not very readable and will probably exceed you terminal width. You can pretty-print it with

    jq . error.log

The `jq` command always needs the **filter** parameter, in the example above that's the `.` (the dot). It also needs some JSON input, in the example the file name `error.log`. `jq` will read each line of the input, apply the filter to it and print the output of the filter.

The `.` (the dot) is the simplest filter you can apply, it means "return current input item".

By default, `jq` shows the indented object hierarchy and colorizes it. If you want to read the output in a pager program like `less`, you need to explicitly enable colorizing in `jq` and interpretation of the color codes in `less` like this:

    jq --color-output . error.log | less -R

## Counting lines, the functional programming way
If you really want to only count lines, you should use a command like `wc -l`, but it can also be done with `jq`:

    jq -s length error.log

The `-s` parameter instructs `jq` to "slurp" the whole file into an array before processing (compare the output when using the `.` filter with and without the `-s` option). `length` is a function that returns the length of an array and is applied to the whole data structure.

Reading the whole file into memory will fail for big files and in future steps we'll count only specific lines. So we'll develop a different method for counting, based on the builtin functions `reduce` and `inputs`.

The following commands produce the same output:

    jq -s . error.log
    jq -n 'reduce inputs as $obj ([]; . + [$obj])' error.log

Note the single quotes around the filter in the second command, they prevent the dollar sign to be interpreted as shell variables.
The `-n` parameter prevents `jq` from reading the input file `error.log` immediately. Instead, the filter gets `null` as input. The `null` is ignored and instead we use the `reduce` filter to iterate over `inputs`. `inputs` is a "filter" that returns the objects from the specified input files, one by one.

[The `reduce` function is a concept from functional programming](https://en.wikipedia.org/wiki/Fold_(higher-order_function)). It takes three parameters, an **starting result**, a **processing function** and a **list of values**. The processing function is then called with item of the list of values and the **current result**, which can be either the starting result or the return value of the previous call.

`reduce` in `jq` looks a bit different from other programming languages: The **current item** from the list of items must be aliased with the `as $var` expression (`$var` being a variable that get assigned the value of each item). Inside the brackets, before the semicolon comes the starting result, after the semicolon comes the processing function which can consist of any `jq` filter expression. In the processing function, the dot filter (`.`) does *not* refer to the current input object but to the **current result**. For the first input object, the current result is equal to the initial result. Whatever the processing function returns, becomes the new current result.

Here is a very nonsensical `reduce`, that just returns the initial result ("foo"):

    jq -n 'reduce inputs as $obj ("foo"; . )' error.log

The alias `as $obj` is used to access the current current item from the `inputs` function inside the processing function.

Another nonsensical `reduce` that ignores initial and current result and just returns the last input object would look like this:

    jq -n 'reduce inputs as $obj ("foo"; $obj )' error.log

Now back to our reduce example that mimicked the `-s` flag: `reduce inputs as $obj ([]; . + [$obj])`. The "plus" operator (`+`), when used on arrays, concatenates them into a new array. In the first iteration, the current result (accessed with the dot filter) is the empty array. It is concatenated with a single-item array, consisting of our current input object, `$obj`. In the next iteration, the next input object will be appended to the current result and so on.

With your newfound knowledge you can create a processing function that counts up for each input object. Individual input values are not accessed yet, the function just counts up:

    jq -n 'reduce inputs as $obj (0; . + 1 )' error.log

Preparing for the next steps, that are about aggregating groups of errors and count their occurrence, let's build an object as output instead of an integer:

    jq -n 'reduce inputs as $obj ({"length": 0}; {"length": (.length + 1) } )' error.log

The initial result is an object with a `length` property. Each time the processing function is called, a new object is created by accessing the `length` property of the current result. The calculation expression needs to be wrapped in brackets, to create new integer before the object is created.

## Counting error severities
Your filter definitions will become longer and longer. To make them more readable and edit them, you can save the filter definition in a file and call `jq` like this:

```console
jq -n -f filter_definition.jq error.log
```

Subsequent examples will only present the filter file `filter_definition.jq`, while the command line is always the same.

The following filter file returns an object with counts for each severity:

    reduce inputs as $obj (
        {};
        . + {
            ($obj.severity): (.[$obj.severity] + 1)
        }
    )

The initial result is an empty object. In each iteration of the processing function the current result is extended with the `+` operator, which, when applied to objects, merges their property names and values together. The right-hand object properties override the left-hand object ones if they exist. Different than in the previous count example, there is no property named `length` in our newly created object. Instead, the property name is created from the current item: `($obj.severity):`

The new value of the property is determined by accessing the current result with the severity of the current item as index and adding 1 to it. It does not matter if the severity does not exist in the current result, `jq` then assumes a value of 0.

## Filtering by severity
The following filter file counts only errors with "E" severity:

    reduce inputs as $obj (
        {};
        if $obj.severity == "E" then
            . + {
                ($obj.severity): (.[$obj.severity] + 1)
            }
        else
            .
        end
    )

Here you see how to use the `if ... then ... else ... end` construct. Since `jq` filters *always* have to return something, you're not allowed to leave out the `else` part like in other programming languages. In our case, the current result object is returned unchanged if the severity does not match.

## Counting only specific messages
The following filter file counts only the errors where the message contains the word "Widget":

    reduce inputs as $obj (
        {};
        if ($obj.error.msg|test("Widget")) then
        . + {
            ($obj.severity): (.[$obj.severity] + 1)
        }
        else
            .
        end
    )

The `test` filter applies a regular expression to its input and returns a boolean. If the expression would read `if test("Widget") then`, the input for `test` would be the current result, which would also be a type mismatch because the current result is an object. But what actually should be checked is the current input object, which is why the pipe operator (`|`) is used. It "pipes" the error message as an input to the `test` filter. `if` needs a boolean value, so the whole test expression must be wrapped in brackets in order to be evaluated before the `if` is evaluated.

## Conclusion
Compared to trusty tools like `wc`, `grep` and `awk` for processing textual log files `jq` can seem daunting at first. Experienced programmers might whip out their favorite scripting language to do the job. But I hope this small tutorial has given you a starting point for your own analytic needs.

---

*Example files for this entry can be found at [https://gist.github.com/gbirke/84ed97eb208f09a5e3c1ccd0e6a2a89f](https://gist.github.com/gbirke/84ed97eb208f09a5e3c1ccd0e6a2a89f).*

