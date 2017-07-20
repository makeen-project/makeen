import Joi from 'joi';
import { Module } from 'makeen';
import MessageBus from './libs/MessageBus';
import ServiceBus from './libs/ServiceBus';
import MemoryStore from './libs/EventStore/Memory';

class Octobus extends Module {
  static configSchema = {
    logMessages: Joi.boolean().default(false),
  };

  constructor(...args) {
    super(...args);
    this.createServiceBus = this.createServiceBus.bind(this);
    this.registerServices = this.registerServices.bind(this);
  }

  initialize() {
    this.messageBus = new MessageBus();

    this.messageStore = new MemoryStore();
    this.messageBus.onMessage(msg => this.messageStore.save(msg));
    this.serviceBus = this.createServiceBus('main');
  }

  createServiceBus(name, routes = []) {
    const serviceBus = new ServiceBus(name, routes);
    serviceBus.connect(this.messageBus);
    return serviceBus;
  }

  registerServices(module, serviceMap) {
    if (!serviceMap) {
      return this.serviceBus.registerServices(module);
    }

    if (!module.serviceBus) {
      // eslint-disable-next-line
      module.serviceBus = this.createServiceBus(module.name);
    }

    return module.serviceBus.registerServices(serviceMap);
  }

  async setup({ logMessages }) {
    const {
      createServiceBus,
      registerServices,
      messageBus,
      messageStore,
    } = this;

    if (logMessages) {
      const { log } = await this.dependency('logger');
      messageBus.onMessage(msg => {
        log.info(JSON.stringify(msg, null, 2)); // eslint-disable-line
      });
    }

    await this.manager.run('octobus:createServiceBus', () => {}, {
      create: createServiceBus,
    });

    await this.manager.run(
      'services:register',
      module => {
        if (module.services) {
          this.registerServices(module, module.services);
        }
      },
      {
        register: registerServices,
      },
    );

    this.export({
      messageStore,
      messageBus,
      createServiceBus,
      registerServices,
    });
  }
}

export default Octobus;
