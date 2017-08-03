class MemoryCache {
  static resolve(value) {
    return typeof value === 'function' ? value() : Promise.resolve(value);
  }

  static isExpired(entry) {
    return entry.expire && entry.expire < Date.now();
  }

  constructor(defaultTTL) {
    this.store = {};
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl) {
    const finalTTL = ttl || this.defaultTTL;

    const entry = {
      value,
      expire: finalTTL ? finalTTL + Date.now() : false,
    };

    if (ttl) {
      entry.timeoutId = setTimeout(() => {
        this.remove(key);
      }, ttl);
    }

    this.store[key] = entry;

    return this;
  }

  has(key) {
    return (
      Object.keys(this.store).includes(key) &&
      !MemoryCache.isExpired(this.store[key])
    );
  }

  get(key, defaultValue) {
    const entry = this.store[key];

    if (!entry) {
      return defaultValue;
    }

    if (MemoryCache.isExpired(entry)) {
      this.remove(key);
      return defaultValue;
    }

    return MemoryCache.resolve(entry.value);
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

    return this;
  }
}

export default MemoryCache;
