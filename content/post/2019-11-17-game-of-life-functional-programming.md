---
title: What I learned from different JavaScript implementations of Conway's Game of Life
date: 2019-11-17
tags:
  - javascript
  - kata
  - functional-programming
  - performance
  - games
categories:
  - wikimedia
description: "A tutorial on how to implement a 'findNeighbors' function in different ways and the negative performance impact of functional programming patterns when using JavaScript"
---
I participated in the [Global Day of Coderetreat](https://www.coderetreat.org/), practicing on the [Game of Life Kata](https://kata-log.rocks/game-of-life-kata) and heard that some people solved the problem of finding neighboring cells with a [Cartesian Product](https://en.wikipedia.org/wiki/Cartesian_product). I did not see their solution, but tried out to apply the idea to my own solution. While trying it out, I learned something about JavaScript, functional programming and performance.
<!--more-->
Common implementations of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) model the grid of the "playing field" as nested arrays of rows and columns. An example of a 3x3 grid could look like this:

```javascript
const DEAD  = 0;
const ALIVE = 1;

const grid3x3 = [
	[ DEAD, ALIVE, DEAD ],
	[ DEAD, ALIVE, DEAD ],
	[ DEAD, ALIVE, DEAD ],
];
```

To generate the next state of the grid, the algorithm needs to count the alive neighbors of each cell to determine if that cell is alive or dead in the new state. The algorithm needs to handle the special cases when it checks a cell that is on the "edge" of the grid - at index 0 of a row or column array or at index `length - 1`. The algorithm can treat the cells outside the grid as dead cells or it can "wrap around". In any case, the code needs boundary checks. A possible JavaScript solution for getting all the neighboring cells for a row and column coordinate looks like this:

```javascript
function findNeighbors( grid, row, col ) {
	const maxRow = grid.length - 1;
	const maxCol = grid[0].length - 1;

	const topLeft = row > 0 && col > 0 ? grid[ row - 1 ][ col - 1 ] : null;
	const top = row > 0 ? grid[ row - 1 ][ col ] : null;
	const topRight = row > 0 && col < maxCol ? grid[ row - 1 ][ col + 1 ] : null;

	const left = col > 0 ? grid[ row ][ col - 1 ] : null;
	const right = col < maxCol ? grid[ row ][ col + 1 ] : null;

	const bottomLeft = row < maxRow && col > 0 ? grid[ row + 1 ][ col - 1 ] : null;
	const bottom = row < maxRow ? grid[ row + 1 ][ col ] : null;
	const bottomRight = row < maxRow && col < maxCol ? grid[ row + 1 ][ col + 1 ] : null;

	return [
		topLeft, top, topRight,
		left, right,
		bottomLeft, bottom, bottomRight
	].filter( neighbor => neighbor !== null );
}
```

This solution returns between 3 and 8 neighbors, filtering out the non-existing neighbors outside the edges. I've created the solution with a test-driven approach that covers all the edge cases, but the code itself is hard to read, so I wanted to try out the "cartesian product" solution.

Reading the code I saw see the following pattern: To look into all neighboring rows, I need to add -1, 0, and +1 to the `row` parameter. To look at all the columns, I need to add -1, 0 and +1 to the `col` parameter. That means I have to create all possible combinations (tuples) of `row` and `col` modifiers, except for the tuple of `[0, 0]` which is the original coordinate and does not count as a neighbor. And that's the definition of a cartesian product: The combination of all elements of two sets, in this case the two identical sets of `[-1, 0, 1]`. Written as a JavaScript array the set would look like this:

```javascript
const modifiers = [
	[-1, -1], [-1, 0], [-1, 1],
	[ 0, -1], [ 0, 0], [ 0, 1],
	[ 1, -1], [ 1, 0], [ 1, 1],
];
```

Don't want to use this grid directly but generate 9 coordinate tuples out of the initial coordinate tuple. A functional way of doing this is `map`:

```javascript
function generateCoordinates( coordinate ) {
	return [ -1, 0, 1 ].map( modifier => coordinate + modifier );
}
```

To create a list of tuples from row and col, I need to call `generateCoordinates` with `col` for each result of calling `generateCoordinates` with `row`. Again, `map` is the tool of choice if I want to build our coordinate array with pure functions:

```javascript
const coordinates = generateCoordinates( row )
    .map( r => generateCoordinates( col )
        .map( c => [ r, c ] ) )
```

But wait, the resulting array for the coordinates `0, 0` looks like this:
```javascript
const coordinates = [
	[ [-1, -1], [-1, 0], [-1, 1] ],
	[ [ 0, -1], [ 0, 0], [ 0, 1] ],
	[ [ 1, -1], [ 1, 0], [ 1, 1] ],
];
```
Using nested `map` calls creates a nested array structure. To get a flat array structure that I can iterate over, I need to replace the first `map` with `flatMap`, which will "unwrap" the first level of nested arrays.

```javascript
const coordinates = generateCoordinates( row )
    .flatMap( r => generateCoordinates( col )
        .map( c => [ r, c ] ) )
```

For the rest of the implementation I need filter functions that remove tuples where one part of the coordinate is outside of the grid. Each filter function gets a name that explains its purpose, which improves the readability of `findNeighbors`:

```javascript
export function findNeighbors( grid, row, col ) {
	const maxRow = grid.length;
	const maxCol = grid[0].length;

	const rowInsideGrid = rowIndex => rowIndex >= 0 && rowIndex < maxRow;
	const colInsideGrid = colIndex => colIndex >= 0 && colIndex < maxCol;
	const isCenter = ( rowIndex, colIndex ) => rowIndex === row && colIndex === col
	const validCoordinate = ( [ r, c ] ) => rowInsideGrid( r ) && colInsideGrid( c ) && !isCenter( r, c )

	const coordinates = generateCoordinates( row ).flatMap( r => generateCoordinates( col ).map( c => [ r, c ] ) )

	return coordinates.filter( validCoordinate ).map( ( [ r, c ] ) => grid[r][c] );
}
```

I was very happy with this functional approach: The code is readable, the functions seem to be reusable, no loops or `if`s, only the building blocks of functional programming, `map` and `filter`. My happiness was stopped in its tracks when I used [Benchmark.js](https://benchmarkjs.com) to compare the performance of the two solutions: The functional implementation is 50 times *slower* than my first solution! I suspected two things: the amount of function calls and the increased number of checks in `validCoordinate`. Generating the coordinates takes about 20 function calls. Filtering the generated coordinates takes 36 function calls. The final mapping of coordinate pairs takes 3-8 function calls. That's about 56 function calls more than the original solution, which seems to fit approximately with the magnitude of the slowdown.

I the tried to create an optimized version, where I calculate the coordinates without mapping the `generateCoordinates` function, omitting the need for `isCenter`, where `validCoordinate` contains only comparisons and no function calls and where `reduce` does the work of both `filter` and `map`, leading to even fewer function calls.


```javascript
function findNeighbors( grid, row, col ) {
	const maxRow = grid.length;
	const maxCol = grid[0].length;

	const coordinates = [
		[row-1, col-1], [row-1, col], [row-1, col+1],
		[row,   col-1],               [row,   col+1],
		[row+1, col-1], [row+1, col], [row+1, col+1],
	]

	const validCoordinate = ( [ r, c ] ) => r >= 0 && r < maxRow && c >= 0 && c < maxCol;
	return coordinates.reduce( ( cells, coordinate ) => {
		if ( validCoordinate( coordinate ) ) {
			cells.push( grid[ coordinate[0] ][ coordinate[1] ] );
		}
		return cells;
	}, [] );
}
```

Surprisingly, this implementation with its 8 function calls is still 10 times slower than the first "conditional" implementation with the same amount fo function calls. There are some reasons I can think of: The memory and instruction overhead of the array manipulation via `push`, the overhead of the anonymous `reduce` function forming a closure with `grid`, a general overhead of `reduce` and the additional boolean checks for each coordinate: compared to the first implementation, the number of checks for each coordinate pair doubles or quadruples. But these are speculations, I briefly tried to look at what the code is doing with a profiler, but did not get conclusive results.

I was curious how the "cartesian product" approach would fare if I implemented it in a procedural style with nested `for` loops and `if` coditions. To my surprise, it performed 10% better than the first implementation.


```javascript
function findNeighbors( grid, row, col ) {
	const maxRow = grid.length;
	const maxCol = grid[0].length;
	let cells = [];

	for( let rowModifier = -1; rowModifier <= 1; rowModifier++ ) {
		const rowIndex = row + rowModifier;
		if ( rowIndex < 0 || rowIndex >= maxRow ) {
			continue;
		}
		for( let colModifier = -1; colModifier <= 1; colModifier++ ) {
			const colIndex = col + colModifier;
			if ( colIndex < 0 || colIndex >= maxCol || ( colIndex === col && rowIndex === row ) ) {
				continue;
			}
			cells.push( grid[rowIndex][colIndex] );
		}
	}

	return cells;
}
```

I have several takeaways from my coding experiment:

* At the moment it looks like current JavaScript interpreters don't optimize functional code well.
* I still like, even prefer the functional style and would never say that "[Functional Programming in JavaScript S*cks](http://techfindings.one/archives/2652)" or is a "hype". But (at least in 2019) the performance impact is real and needs to be carefully balanced against developer productivity.  
* I'm interested if other functional or mixed-paradigm languages like Skala, Haskell or Clojure would optimize the functional solution better.
* There are many ways to implement `findNeighbors`.
* Procedural code is not significantly longer or less readable than functional code and choosing a style might boil down to personal preference and experience.

You can find all implementations, unit tests and the benchmarking code at https://github.com/gbirke/game-of-life-functional-grid.git
