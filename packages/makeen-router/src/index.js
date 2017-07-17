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

  addRouter(id, router, middlewarePivot) {
    this.app.middlewares.insert(
      middlewarePivot || this.getConfig('middlewarePivot'),
      {
        id,
        factory: () => router,
      },
    );
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
    await this.manager.run('router:load', this.loadModuleRouter, {
      addRouter: this.addRouter,
    });

    this.export({
      generateRESTRouter,
    });
  }
}

export { Router as default, BaseRouter as Router, helpers };
