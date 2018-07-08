---
title: What I Learned From Trying to Build a Sticky Notes App
date: '2018-07-08'
tags:
  - javascript
  - vue.js
  - riot.js
  - experiments
categories:
  - wikimedia
---
Building a virtual board where you can post sticky notes and move them around seemed like a nice "I can write that in a weekend" project to dabble in [Vue.js](https://vuejs.org). But I failed at building something useable and here are the lessons I take from this experiment.

<!--more-->
### Lesson 1 - Do your research
My Google search for "[Vue js draggable](https://www.google.com/search?q=vue+js+draggable)" was too shallow. The first hit was the [Vue.Draggable library](https://github.com/SortableJS/Vue.Draggable), which was not fit for my purpose, because it implements sortable lists, not arbitrarily positioning elements. The second hit, [a list of Vue.js experiments](https://vuejsexamples.com/tag/drag/) felt slightly overwhelming, some of the components looked too complicated and I wanted to understand how they work. After I found a [code snippet on jsFiddle](https://jsfiddle.net/gannunziata/7vv8h0py/) I decided that this would be the way forward. Little did I know, that the example was also for sortable lists (plus moving elements between list elements) and not for arbitrarily positioning elements.

I wish I had tried more searches like "[Vue js position element by dragging](https://www.google.com/search?q=Vue+js+position+element+by+dragging)" or "[Vue js drag element position -drop](Vue+js+drag+element+position+-drop)" or variations thereof. In hindsight, I found one more cool-looking library for moving elements inside lists, [dragula](https://bevacqua.github.io/dragula/) and [draggable-vue-directive](https://github.com/IsraelZablianov/draggable-vue-directive), which looks promising and easy to understand.

Next time my coding fingers itch, I will hold them still for half an hour longer while trying out different search keywords.

### Lesson 2 - Know your APIs
Before I jumped into Vue.js I wanted to understand the underlying basics, if dragging elements has a browser API you can call from [vanilla JavaScript](http://www.vanilla-js.com). Was there something better than the `mousedown`, `mousemove` and `mouseup` events from 1997? Something that could support touch devices? After skipping the [PointerEvents](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) because they are only supported by Internet Explorer, I had a look at  [DragEvent](https://developer.mozilla.org/de/docs/Web/API/DragEvent). That looked promising!

In hindsight I now know that the DragEvent shines when dragging elements between containers (and even dragging files in and out of the browser). For moving elements around, I should have stuck to basic mouse and touch events.

### Lesson 3 - Vue.js directives
Vue.js [event handling attributes](https://vuejs.org/v2/guide/events.html) like `v-on:click` are abstractions of the underlying DOM events and Vue.js does not support drag events out of the box. [My example code snippet](https://jsfiddle.net/gannunziata/7vv8h0py/) showed me how to add more events to the DOM elements behind Vue.js abstractions by using the Vue.js mechanism of [directives](https://vuejs.org/v2/guide/custom-directive.html). A neat trick and extension point I did not know before.

### Lesson 4 - Riot.js as an alternative to Vue.js
Ultimately, I could not get my Vue.js code to work properly. Instead of calming down, taking a break and trying again, I deleted the project in utter frustration and turned to another component framework I wanted to try: [Riot.js](https://riot.js.org). I enjoyed the experience, the learning curve of Riot.js seemed not as steep to me as the one for Vue.js. I felt like there was much less "magic" involved as with Vue.js. You still have access to the DOM and attaching the drag events was easy. And like with Vue.js you are able to structure your code into component files which consist of the markup, script and styling for one component.

After fiddling around for some time, I had a working prototype: https://github.com/gbirke/riot-sticky-doodle

Or so I thought ...

### Lesson 5 - Firefox bug
I tried my prototype in Firefox and it did not work. [This is a known, 9-year old bug](https://bugzilla.mozilla.org/show_bug.cgi?id=505521), where the coordinates of the `dragend` event are not set. I briefly tried out the recommended workaround, attaching an event handler for the `drop` event on the parent element, but that event did never fire. I assume it's because the element was not "dropped" into its container but repositioned inside it. At that point I was too frustrated to experiment further and gave up.

### Conclusion
My experiment does not have the functionality I imagined it would have after the effort I invested - it does not work in Firefox, does not allow creating or deleting notes, let alone styling or resizing them. But I'm still satisfied that I learned something. Working with Riot.js was pleasant. I will give Vue.js another shot in the future when I try again with [draggable-vue-directive](https://github.com/IsraelZablianov/draggable-vue-directive).

[Obligatory link to my favorite CommitStrip comics about side projects](http://www.commitstrip.com/en/2014/11/25/west-side-project-story/).
