class Cache {
  static resolve(value) {
    return typeof value === 'function' ? value() : Promise.resolve(value);
  }

  static isExpired(entry) {
    return entry.expire && entry.expire < Date.now();
  }

  constructor() {
    this.store = {};
  }

  set(key, value, ttl) {
    const entry = {
      value,
      expire: ttl ? ttl + Date.now() : false,
    };

    if (ttl) {
      entry.timeoutId = setTimeout(() => {
        this.remove(key);
      }, ttl);
    }

    this.store[key] = entry;

    return this;
  }

  get(key, defaultValue) {
    const entry = this.store[key];

    if (!entry) {
      return defaultValue;
    }

    if (Cache.isExpired(entry)) {
      this.remove(key);
      return defaultValue;
    }

    return Cache.resolve(entry.value);
  }

  remove(key) {
    if (!this.store[key]) {
      return this;
    }

    if (this.store[key].timeoutId) {
      clearTimeout(this.store[key].timeoutId);
    }

    delete this.store[key];

    return this;
  }

  clear() {
    this.store = {};
  }
}

export default Cache;
