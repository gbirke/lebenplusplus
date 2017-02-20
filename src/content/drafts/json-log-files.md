---
layout: post
title: How to view JSON log files
tags: [administration,logging,JSON]
---
Eeveryone who had to use `grep` to look for specific error messages or other information from textual log files knows the problem - you have to build complex regular expressions that put structure into lines of text. You could get the idea of "why not lose the structure in the first place, just log all things as JSON". 

Deafult format of JSON log files:
https://stackoverflow.com/questions/10699953/format-for-writing-a-json-log-file
Standardization Problem: How to serialize Dates, how to name fields

Stage 1: Prettify log files
aeson_pretty, jsonpp

Stage 2: query log files
Introduce `jq` with progressively more complex examples (with examplelog in gist): Query for specific dates, query for errors, query for specific context details, format output as lines, use other unix tools (sort, uniq, count)

Stage 3: Log processing systems
graylog (trying out is easy with OVA), logstash et al.
Link to example logstash config: https://gist.github.com/gbirke/7b011ce2d089d4508227017c8554d230

Mention [Bunyan](http://blog.nodejs.org/2012/03/28/service-logging-in-json-with-bunyan/)
