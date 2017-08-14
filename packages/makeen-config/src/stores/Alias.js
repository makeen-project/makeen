class Alias {
  constructor(backend, aliases = {}) {
    this.backend = backend;
    this.aliases = aliases;
  }

  add(from, to) {
    if (typeof from === 'string') {
      this.aliases[from] = to;
    } else {
      this.aliases = {
        ...this.aliases,
        ...from,
      };
    }

    return this;
  }

  has(key) {
    return Object.keys(this.aliases).includes(key);
  }

  get(key) {
    return this.backend.get(this.aliases[key]);
  }
}

export default Alias;
