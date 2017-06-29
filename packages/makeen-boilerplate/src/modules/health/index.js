import { Module } from 'makeen';
import router from './router';

class Health extends Module {
  router = router;
}

export default Health;
