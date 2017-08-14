import { Module } from 'makeen';
import router from './router';

class Health extends Module {
  name = 'makeen:health';
  router = router;
}

export default Health;
