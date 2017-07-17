import Joi from 'joi';
import { Module } from 'makeen';
import router from './router';

class Play extends Module {
  hooks = {
    'router:load': ({ addRouter }) => {
      this.addRouter = addRouter;
    },
  };

  async setup() {
    const [
      { jwtMiddleware },
      { generateRESTRouter },
      { createRepository },
    ] = await this.dependencies(['user', 'router', 'storage']);
    this.addRouter('playRouter', router({ jwtMiddleware }));

    const ProductRepository = createRepository('Product', {
      name: Joi.string().required(),
      price: Joi.number().required(),
    });

    const productRouter = generateRESTRouter({
      repository: ProductRepository,
    });

    this.addRouter('/products', 'productRouter', productRouter);
  }
}

export default Play;
