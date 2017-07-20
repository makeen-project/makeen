import Joi from 'joi';
import { Module } from 'makeen';
import router from './router';

class Play extends Module {
  async setup() {
    const [
      { jwtMiddleware },
      { generateRESTRouter, addRouter },
      { createRepository },
    ] = await this.dependencies(['user', 'router', 'storage']);

    addRouter('playRouter', router({ jwtMiddleware }));

    const ProductRepository = createRepository('Product', {
      _id: Joi.object(),
      name: Joi.string().required(),
      price: Joi.number().required(),
      createdAt: Joi.date(),
      updatedAt: Joi.date(),
    });

    const productRouter = generateRESTRouter({
      repository: ProductRepository,
    });

    addRouter('/products', 'productRouter', productRouter);
  }
}

export default Play;
