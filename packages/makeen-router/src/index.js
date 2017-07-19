import Joi from 'joi';
import { Module } from 'makeen';
import path from 'path';
import BaseRouter from './libs/Router';
import * as helpers from './libs/helpers';
import generateRESTRouter from './libs/generateRESTRouter';

class Router extends Module {
  static configSchema = {
    middlewarePivot: Joi.any().required(),
  };

  constructor(...args) {
    super(...args);
    this.addRouter = this.addRouter.bind(this);
    this.loadModuleRouter = this.loadModuleRouter.bind(this);
  }

  addRouter(...args) {
    if (args.length === 2) {
      args.unshift('/');
    }

    const [pathPrefix, id, router] = args;

    this.app.middlewares.insert(this.getConfig('middlewarePivot'), {
      path: pathPrefix,
      id,
      factory: () => router,
    });
  }

  loadModuleRouter(module) {
    let router = module.router;

    if (!router) {
      const routerPath = path.resolve(path.dirname(module.filePath), 'router');
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        router = require(routerPath).default;
      } catch (err) {} // eslint-disable-line no-empty
    }

    if (router) {
      this.addRouter(`${module.name}Router`, router);
    }
  }

  async setup() {
    const { addRouter } = this;

    await this.manager.run('router:load', this.loadModuleRouter, {
      addRouter,
    });

    this.export({
      generateRESTRouter,
      addRouter,
    });
  }
}

export { Router as default, BaseRouter as Router, helpers };
