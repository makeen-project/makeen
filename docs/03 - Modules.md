A makeen module is a first class citizen.

They work like mini-apps and you use them to bundle together specific functionality:
- adding routers
- registering services
- working with GraphQL
- etc.

The modules are registered by a modules manager. Its job is to provide a communication layer between modules, to resolve dependencies between them and allow them to create hooks.

The simplest module that doesn't provide any functionality can be created like this:

```js
import { Application, Module } from 'makeen';

const app = new Application();

app.modules.add(new Module({ name: 'simple' }));

app.listen(3000).then(() => {
  console.log('application started...');
});
```

The single argument of a module constructor is a configuration object local to the module.
A module can define a `configSchema` static property which can be a Joi object and is called to validate the configuration provided through the module constructor.
You can access this configuration inside a module by a `this.getConfig('key.path', defaultValue)` method.

A module has a lifecycle of its own which is handled by 2 methods (empty by default):
- initialize(config, manager)
- setup(config, manager)

`initialize` is called right after registering the module (by calling the `add` method of a manager). This is not the right place where you can perform async operations, but mainly initialization tasks.
`setup` can be an async method returning a promise. This way you can perform async tasks inside the setup method (like connecting to a database). Other modules depending on it will wait for this promise to be resolved before continuing execution.

The common pattern is to create a new module class that extends the base Module.

```js
class Simple extends Module {
  initialize() {
    console.log(`initializing the ${this.name} module`);
  }

  setup() {
    return new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
  }
}
```
Inside a module you have access to the manager by `this.manager` and the application by `this.app`.

Let's rewrite the 'Hello, world!' example by using a module:

```js
import { Application, Module } from 'makeen';
import { Router } from 'express';

const app = new Application();

class Simple extends Module {
  initialize() {
    const router = Router();
    router.get('/', (req, res) => {
      res.send('Hello, world!');
    });

    this.app.middlewares.push({
      id: `${this.name}Router`,
      factory: () => router,
    });
  }
}

app.modules.add(new Simple());

app.listen(3000).then(() => {
  console.log('application started...');
});
```
