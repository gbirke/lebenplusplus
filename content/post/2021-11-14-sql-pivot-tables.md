---
title: "How to turn SQL rows into columns"
date: "2021-11-14"
tags:
  - database
  - SQL
description: "Use SUM(CASE WHEN) statements to turn SQL columns into rows" 
---

"Transposing" or "privoting" rows to columns in a database query is a
common task. These are my notes on how I evolved a SQL query to get the
desired result.

<!--more-->

Today I ran a SQL query that counted the occurrences of paid and unpaid
items in a table for each day:

```sql
SELECT
    created_on, paid, count(paid) AS occurrence
FROM
    my_table
GROUP BY
    created_on, paid;
```

This created a table like this:

```
+------------+------+------------+
| created_on | paid | occurrence |
+------------+------+------------+
| 2021-11-10 | Y    |        359 |
| 2021-11-10 | N    |         58 |
| 2021-11-11 | Y    |        357 |
| 2021-11-11 | N    |         59 |
| 2021-11-12 | Y    |        353 |
| 2021-11-12 | N    |         63 |
| 2021-11-13 | Y    |        369 |
| 2021-11-13 | N    |         73 |
| 2021-11-14 | Y    |        209 |
| 2021-11-14 | N    |         35 |
+------------+------+------------+
```

The format of the table makes it hard to compare the numbers for
each day, because each date has two rows, one for paid and unpaid items.
It would be better if each payment status had its own column. I solved
this by removing the grouping on the `paid` status and creating two new
aggregate `SUM` columns:

```sql
SELECT
    created_on,
    SUM( CASE WHEN paid="Y" THEN 1 ELSE 0 END ) AS paid,
    SUM( CASE WHEN paid="N" THEN 1 ELSE 0 END ) AS unpaid
FROM
    my_table
GROUP BY
    created_on;
```

This got me a much nicer formatted table with semantic column names:

```
+------------+------+--------+
| created_on | paid | unpaid |
+------------+------+--------+
| 2021-11-10 |  359 |     58 |
| 2021-11-11 |  357 |     59 |
| 2021-11-12 |  353 |     63 |
| 2021-11-13 |  369 |     73 |
| 2021-11-14 |  216 |     36 |
+------------+------+--------+
```

If you want to do calculations on the aggregated columns, you can put them
in a subquery like this:

```sql
SELECT
    created_on, paid, unpaid, paid/unpaid AS ratio
FROM (
    SELECT
        created_on,
        SUM( CASE WHEN paid="Y" THEN 1 ELSE 0 END ) AS paid,
        SUM( CASE WHEN paid="N" THEN 1 ELSE 0 END ) AS unpaid
    FROM
        my_table
    GROUP BY
        created_on
) AS subtable;
```

The "standard" way (as defined in the [SQL:2003
standard](https://en.wikipedia.org/wiki/SQL:2003)) is to use a [`FILTER`
statement](https://kb.objectrocket.com/postgresql/how-to-use-the-filter-clause-in-postgresql-881)
instead of a `CASE WHEN` statement. In my case, MySQL does not support the
standard and I have done it the "old-fashioned" way.

## Links

The following articles helped me figuring out how to flip rows with
columns:

  * https://linuxhint.com/mysql_pivot/
  * https://codingsight.com/pivot-tables-in-mysql/
  * https://modern-sql.com/de/feature/filter (German, not working for
      MySQL)
