import filter from 'lodash/filter';

export class MemoryStore {
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

export class MongoStore {
  constructor(db, collectionName = 'OctobusMessage') {
    this.db = db;
    this.collectionName = collectionName;
  }

  save(msg) {
    this.db.collection(this.collectionName).insertOne({
      ...msg,
      data: JSON.stringify(msg.data, null, 2),
    });
  }

  find(query) {
    return this.db.collection(this.collectionName).find(query).toArray();
  }

  findChildren(messageId, filters = {}) {
    return this.db
      .collection(this.collectionName)
      .find({ ...filters, parentId: messageId })
      .toArray();
  }
}
