import assert from 'assert';
import Config, { stores } from '../src';

const { Memory: MemoryStore } = stores;

class CustomStore extends MemoryStore {
  set(key, value) {
    super.set(key, typeof value === 'number' ? value + 1 : value);
  }

  async get(key) {
    const value = await MemoryStore.prototype.get.call(this, key);
    await new Promise(resolve => setTimeout(resolve), 1000);
    return value;
  }
}

const config = new Config();
const store = new CustomStore();
store.set('port', 3000);
store.set('email', 'test@example.com');

config.addStore(store);

const run = async () => {
  assert.equal(await config.get('port'), 3001);
  assert.equal(await config.get('email'), 'test@example.com');
};

run().catch(console.log);
