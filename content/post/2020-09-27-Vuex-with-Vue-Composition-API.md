---
title: "Integrating Vuex with the Vue Composition API"
date: 2020-09-27
tags:
  - conference
categories:
  - wikimedia
description: "How to use the new Composition API with Vuex"
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

With this setup, using Vuex is over-engineering since the main purpose of
Vuex is to share state between components and I only have one component
that could keep its state internally. Now that I want to add a second
`AwesomenessComponent` that's using the composition API, this will change
because all components should share the Vuex store - if I toggle the
awesomeness in the "classic" component, I want the state of the
composition based component to change too.

## First attempt - getting the store from the parent

In the `setup` method of the component API you don't have a reference to
the Vue component instance. Therefore, you can't call `this.$store`. There
is a workaround, though: The `setup` method has a second parameter,
`context`, that allows you to access the *parent* instance of the Vue
component. If that parent instance has a store, then you can call that
store instance. In my opinion, that's not a good solution because it
introduces a hidden, implicit dependency, making it harder to use and to
test, because you'll always have to remember to set up the parent instance
with a store. But it works and I can create a component that looks like this:

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
  	const store = ctx.parent.$store;
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

## A better version - using Node module singleton pattern

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

So that's how you use an existing Vuex store with the composition API -
import it and call its methods. Alternatively, you could use the `provide` and
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


