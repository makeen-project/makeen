import { CRUDServiceContainer } from 'octobus-crud';

class Repository extends CRUDServiceContainer {
  constructor(schema, collectionName) {
    super(schema);
    this.collectionName =
      collectionName ||
      this.constructor.name.substr(
        0,
        this.constructor.name.indexOf('Repository'),
      );
  }
}

export default Repository;
