import filter from 'lodash/filter';

class MemoryStore {
  constructor() {
    this.data = [];
  }

  save(msg) {
    this.data.push(msg);
  }

  find(query = {}) {
    return filter(this.data, query);
  }

  findChildren(parentId, query = {}) {
    return filter(this.data, {
      ...query,
      parentId,
    });
  }
}

export default MemoryStore;
