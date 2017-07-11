import range from 'lodash/range';

class TaskTree {
  constructor() {
    this.tree = {};
  }

  add(path, _checkFns) {
    if (typeof path === 'object') {
      Object.keys(path).forEach(key => {
        if (Array.isArray(path[key])) {
          this.add(key, path[key]);
        } else {
          this.add(
            Object.keys(path[key]).reduce(
              (acc, subKey) => ({
                ...acc,
                [`${key}.${subKey}`]: path[key][subKey],
              }),
              {},
            ),
          );
        }
      });
      return this;
    }

    const checkFns = Array.isArray(_checkFns) ? _checkFns : [_checkFns];
    this.tree[path] = [...(this.tree[path] || []), ...checkFns];
    return this.get(path);
  }

  get(path) {
    return {
      add: (name, ...args) => this.add(`${path}.${name}`, ...args),
      back: (nr = 1) => this.get(path.split('.').slice(0, -1 * nr).join('.')),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  end() {
    throw new Error('No subpaths available!');
  }

  runTask(previous, task, ...args) {
    return Array.isArray(task) ? this.runTasks(task, ...args) : task(...args);
  }

  runTasks(tasks, ...args) {
    return tasks.reduce(
      (promise, task) =>
        promise.then(result => this.runTask(result, task, ...args)),
      Promise.resolve(true),
    );
  }

  run(path, ...args) {
    const nodes = path.split('.');

    const tasks = range(nodes.length)
      .map(index => this.tree[nodes.slice(0, index + 1).join('.')])
      .filter(Boolean);

    return this.runTasks(tasks, ...args);
  }
}

export default TaskTree;
