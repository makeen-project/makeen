Makeen provides a singleton implementation of a configuration object. That's because most of the times you'll need a shared instance of it for the entire project.

```js
import { Config } from 'makeen';

Config.set('someKey', someValue);

export default Config;
```

Because it uses the lodash set / get / has methods, dealing with nested keys is easy.

```js
Config.set('session', {
  secret: `I won't tell you!`,
});

const defaultValue = 'Not so secret anymore!';
const secret = Config.get('session.secret', defaultValue);

// secret === `I won't tell you!`
```

When you want to merge you configuration with an object, you can simply use `Config.merge(configurationObject)`.

And if you want to prevent any other changes to your configuration, you can use `Config.freeze()`. This way you'll get an error whenever you want to make an additional change to it.

Sharing sensitive through your (version controlled) code is risky. That's why you'll rely on environment variables for that or whenever you want to have machine-specific configuration.
To achieve that we recommend that you use the dotenv node module (check makeen-boilerplate for an example). Then you can use a helper available in makeen to load the variables.
When you setup your configuration you should specify all the possible configuration options (even if you have to use placeholders for sensitive data), and then you overwrite some of that data by leveraging environment variables.
Let's look at an example:

`config.js`
```js
import path from 'path';
import { Config, helpers } from 'makeen';
import randomstring from 'randomstring';

Config.merge({
  port: 3000,
  secrets: {
    jwt: '123', // we provide some defaults
    sessionToken: randomstring.generate(),
  },
  test: [{ first: 'nope' }],
});

/**
 * Config.get() will return the entire configuration object
 * loadFromENV will try to load from environment variables the values matching the keys available
 * in our configuration object prefixed by the specified prefix.
 * In this example, it will try to load the following:
 * MAKEEN_CONFIG_PORT
 * MAKEEN_CONFIG_SECRETS_JWT
 * MAKEEN_CONFIG_SECRETS_SESSION_TOKEN
 * MAKEEN_CONFIG_TEST_0_FIRST
 */
Config.merge(helpers.loadFromENV('MAKEEN_CONFIG', Config.get()));

export default Config;
```

And let's say we have the following environment variables:
```
MAKEEN_CONFIG_PORT=3001
MAKEEN_CONFIG_SECRETS_SESSION_TOKEN=it's a secret
MAKEEN_CONFIG_TEST_0_FIRST=yep
```

You'll end up with the following configuration:
```js
{
  port: 3001,
  secrets: {
    jwt: '123', // we provide some defaults
    sessionToken: `it's a secret`,
  },
  test: [{ first: 'yep' }],
}
```
