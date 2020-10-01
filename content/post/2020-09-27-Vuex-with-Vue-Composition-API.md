---
title: "Integrating Vuex with the Vue Composition API"
date: 2020-09-27
tags:
  - Vue
  - Vuex
  - composition API
  - JavaScript
categories:
  - wikimedia
description: "How to use the new Composition API with Vuex"
draft: true
---
This post shows my step-by-step journey using the Vue composition API in a
Vue project that uses Vuex. I started with the question "How can you
gradually introduce the composition API without having to rewrite
everything?"

<!--more-->

You can find the complete source code [on
GitHub](https://github.com/gbirke/vuex-composition-doodle)

## Starting application
For my exploration, I started out with a minimalistic application
that uses Vuex: A button that toggles the state of "Awesomeness" on and
off. 

```vue
<template>
  <div>
    <p>
      Awesomeness is <strong>{{ awesomeness }}</strong>
    </p>
    <p><button v-on:click="toggle">Toggle</button></p>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState(["awesomeness"]),
  methods: {
    toggle() {
      this.$store.commit("toggleAwesomeness");
    }
  }
};
</script>
```

The store looks like this:

```javascript
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    awesomeness: "On"
  },
  mutations: {
    toggleAwesomeness(state) {
      if (state.awesomeness === "On") {
        state.awesomeness = "Off";
        return;
      }
      state.awesomeness = "On";
    }
  },
  actions: {},
  modules: {}
});
```

With only one component, using Vuex is over-engineering since the main
purpose of Vuex is to share state between components. But my example
should demonstrate how to mix and match components using the composititon
API and the "classic" style of using Vuex, demonstrating that they all
share the same store.


## First attempt - getting the store from the root element

In the `setup` method of the component API you don't have a reference to
the Vue component instance. Therefore, you can't call `this.$store`. There
is a workaround, though: The `setup` method has a second parameter,
`context`, that allows you to access the *root* instance of the Vue
component tree. If that root instance has a store (because the application
initialization code called `Vue.use(Vuex)`), then you can access that
store instance. The component looks like this:

```vue
<template>
  <div>
    <p>
      Awesomeness is <strong>{{ awesomeness }}</strong>
    </p>
    <p><button v-on:click="toggle">Toggle</button></p>
  </div>
</template>

<script>
import { computed } from "@vue/composition-api";

export default {
  setup(_, ctx) {
  	const store = ctx.root.$store;
    const awesomeness = computed(() => store.state.awesomeness);
  	const toggle = () => store.commit("toggleAwesomeness");
  	return { awesomeness, toggle };
  }
};
```

You can see that the component has more lines than the component
without the composition API. This is because it doesn't do what the
composition API is good at - encapsulating behavior in separate modules,
independent from the Vue code and re-using it in different components. [My
example repository](https://github.com/gbirke/vuex-composition-doodle)
shows how to put the behavior in a separate module, but for reading the
examples side by side I chose this structure.

The unit test for this component needs one more line than the test for the
"classic" unit test - adding the composition API wrapper plugin to the
local Vue instance. With Vue 3, even that line will become unneccessary. 


## Second attempt - using Node module singleton pattern

I admit that I prefer to write object-oriented backend code, using PHP with
dependency injection and implicit instantiation. I still have to get used
to the idea, that whenever a Node module instantiates a class and exports it -
like in our example store above - that same instance will get re-used
whenever you `import` it. In our case, this makes the code for the second
version of our component simpler:

```vue
<template>
  <div>
    <p>
      Awesomeness is <strong>{{ awesomeness }}</strong>
    </p>
    <p><button v-on:click="toggle">Toggle</button></p>
  </div>
</template>

<script>
import store from "../../store";
import { computed } from "@vue/composition-api";

export default {
  setup() {
    const awesomeness = computed(() => store.state.awesomeness);
  	const toggle = () => store.commit("toggleAwesomeness");
  	return { awesomeness, toggle };
  }
};
```

What looks straightforward and concise, becomes a nightmare to test: You
have to mock the imported `store` module. All my attempts to use `Jest.mock` failed
because mocking a module means you have to import it at the top of the
test. But before you can import it, you have to parameterize
the returned mock, which is impossible, because the import of the mocked
module has to happen before any other code is executed. Maybe some
Jest-Gurus can enlighten me with a [pull
request](https://github.com/gbirke/vuex-composition-doodle).

## Third attempt - using provide and inject
You can still use the singleton behavior of node modules to inject a
default store when calling `provide`. The  

Alternatively, you could use the `provide` and
`inject` functions from the composition API to provide a store to the
components. Using `provide` and `inject` has the added benefit not having
to override the `import` statements in your tests, which my backend-coder
self still finds repulsive.

With the composition API there is no need for the `mapState`,
`mapGetters` or other Vuex helpers, you write small, one-line wrapper
functions yourself. This gives you much more fine-grained
control over which parts of the store you connect to the component. Some
people may see that implicitness as boilerplate and adding more lines to
the code, but that's for you to decide.

## Getting rid of Vuex

If you want to replace Vuex with your custom state management, I recommend
the article "[State Management with Composition
API](https://vueschool.io/articles/vuejs-tutorials/state-management-with-composition-api/)".

I have experimented with it, but could not get my code to work, probably
because the Vue 2 compatibility library does not allow to call `ref`
outside of the `setup` method.

If you want to replace Vuex gradually with your own state management based
on the composition API, you'd also have to add a synchronization layer
between Vuex and your state.


