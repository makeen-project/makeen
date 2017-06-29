import { application, request, response } from 'express';
import mixin from 'merge-descriptors';
import EventEmitter from 'events';
import omit from 'lodash/omit';

class ExpressApplication extends EventEmitter {
  constructor() {
    super();
    this.originalApp = application;
    mixin(this, omit(application, ['listen']), false);
    this.init();
    this.request = request;
    this.request.app = this;
    this.response = response;
    this.response.app = this;
  }

  listen(...args) {
    return this.originalApp.listen.apply(this.handle.bind(this), args);
  }
}

export default ExpressApplication;
