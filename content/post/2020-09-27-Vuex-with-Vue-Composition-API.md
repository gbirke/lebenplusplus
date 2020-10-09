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
description: "How to use the Vue Composition API with Vuex, mixing 'classic' components and composition API components"
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

The file `main.js` imports the store and passes it to the root component:

```javascript
import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import CompositionAPI from "@vue/composition-api";

Vue.config.productionTip = false;
Vue.use(CompositionAPI);

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
```

Side note: With only one stateful component, using Vuex is
over-engineering since the main purpose of Vuex is to *share state between
components*. But I want to expand my example to show how components with
and without and composition API can share the same store, so bear with
me.


## First attempt - getting the store from the root element

In the `setup` method of the component API you don't have a reference to
the Vue component instance, you can't call `this.$store`. There
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
local Vue instance. With Vue 3, even that line will become unnecessary. 

With the composition API there is no need for the `mapState`,
`mapGetters` or other Vuex helpers. Instead, you write small, one-line wrapper
functions yourself. This gives you much more fine-grained
control over which parts of the store you connect to the component. Some
people may see that implicitness as boilerplate and adding more lines to
the code, but that's for you to decide.

## Second attempt - using Node module singleton pattern
I admit that I prefer to write object-oriented backend code, using PHP with
dependency injection and implicit instantiation. I still have to get used
to the idea, that whenever a Node module instantiates a class and exports it -
like in our example store above - that same instance will get re-used
whenever you `import` it. In our case, it allows us to write the component
like this:

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

The `store`, directly imported into the component, refers to the same store
that I imported in my `main.js` file. 

What looks straightforward and concise, becomes a nightmare to test: In
the unit tests, you have to mock the imported `store` module. All my
attempts to use `Jest.mock` failed. I think it's an issue of circular
dependencies: mocking a module means you have to import it at the top of
the test. But before you can import it, you have to parameterize the
returned mock, which is impossible, because the import of the mocked
module has to happen before any other code is executed. Maybe some
Jest-Gurus can enlighten me with a [pull
request](https://github.com/gbirke/vuex-composition-doodle).

## Third attempt - using provide and inject
The composition API has the `provide` function that delivers an instance
to all child components. The modified `main.js` now looks like this:

```javascript
import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import { provide }, CompositionAPI from "@vue/composition-api";

Vue.config.productionTip = false;
Vue.use(CompositionAPI);

new Vue({
  setup(){
    provide("vuex-store", store);
  },
  store,
  render: h => h(App)
}).$mount("#app");
```

Our component can access the store by calling `inject` in its setup
method:

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
import { computed, inject } from "@vue/composition-api";

export default {
  setup() {
  	const store = inject("vuex-store");
    const awesomeness = computed(() => store.state.awesomeness);
  	const toggle = () => store.commit("toggleAwesomeness");
  	return { awesomeness, toggle };
  }
};
```

The test can provide the component with its own mock implementation of the
store.

In my [example
repository](https://github.com/gbirke/vuex-composition-doodle), I have
wrapped the calls to `provide` and `inject` in custom function calls to
make them more semantic and enable searching for specific usages of the
store, in case you use `inject` for several values. It also encapsulates
`inject`, so you could use a different state management library later.

## Replacing Vuex with your own state management
If you want to replace Vuex with your custom state management, I recommend
reading the article "[State Management with Composition
API](https://vueschool.io/articles/vuejs-tutorials/state-management-with-composition-api/)".

Implementing a custom store that shares its state across all components
looks like this:

```javascript
import Vue from "vue";
import CompositionAPI, { ref } from "@vue/composition-api";

// Boilerplate for Vue 2
Vue.use(CompositionAPI);

// Put inside `useRef` for non-shared state
const awesomeness = ref("On");

export function useAwesomeness() {
  function toggle() {
    if (awesomeness.value === "On") {
      awesomeness.value = "Off";
      return;
    }
    awesomeness.value = "On";
  }

  return {
    awesomeness,
    toggle
  };
}
```

The component using the store can call `useRef` directly in `setup()`:

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
import { useAwesomeness } from "./useAwesomeness";

export default {
  setup() {
  	return useAwesomeness();
  }
};
```

If you are not in a greenfield project and need to synchronize your
custom store with Vuex, you need to write a synchronization plugin, that
changes your reactive objects on every store mutation and commits new
values to the store on every value change, using the `watch` function from
the composition API. There is a danger to trigger
an endless loop, so you need to keep track where a change is coming from.
This is how a Vuex plugin could look like:

```javascript
import { watch } from "@vue/composition-api";
import { useRef } from "./components/composition/useRef";

export function synchronizeAwesomeness(store) {
  const { awesomeness, toggle } = useRef();
  let inWatcher = false;
  
  store.subscribe(mutation => {
    if (mutation.type === "toggleAwesomeness" && !inWatcher) {
      toggle();
    }
  });

  watch(awesomeness, newAwesomness => {
    if (newAwesomness !== store.state.awesomeness) {
      inWatcher = true;
      store.commit("toggleAwesomeness");
      inWatcher = false;
    }
  });
}
```

## Conclusion

Using `provide` and `inject` looks like the most promising migration path - your
code stays functional, your component is independent from the root
component and you can mock the store in the unit tests. You can gradually
migrate your existing components to the composition API or create new
components with the composition API. 

If you encapsulate the usage of Vuex behind a function, not using `inject`
directly in your component, (see [example repository](https://github.com/gbirke/vuex-composition-doodle)), you can
replace Vuex with a pure composition API state management solution when
all your components use the function.

I think the synchronization layer solution is too clever and too
error-prone and adds a maintenance burden to all future state changes.


